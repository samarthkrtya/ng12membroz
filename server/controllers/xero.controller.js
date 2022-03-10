const HttpError = require("http-errors");

const Joi = require('joi');
var ObjectID = require('mongodb').ObjectID;
var url = process.env.MONGO_HOST;
var MongoClient = require('mongodb').MongoClient;
const common = require('../helpers/common');
import async from "async";
// Local Modules
const xeroProfile = require('../models/xeroProfile.model');
const timeSheet = require('../models/timesheet.model');
const user = require('../models/user.model');
const attendancemodel = require('../models/attendance.model');
const stAffattendanceView = require('../views/staffattendance.view');

// LOAD XERO REQUIRED PACKAGES
const dateFormat = require("dateformat");
const jwtDecode = require("jwt-decode");
const session = require("express-session");
const XeroClient = require("xero-node");
const Invoice = XeroClient.Invoice;

// SET XERO APIs SCOPES
const scopes = "offline_access openid profile email accounting.transactions accounting.transactions.read accounting.reports.read accounting.journals.read accounting.settings accounting.settings.read accounting.contacts accounting.contacts.read accounting.attachments accounting.attachments.read files files.read assets assets.read projects projects.read payroll.employees payroll.payruns payroll.payslip payroll.timesheets payroll.settings";
// INITIALIZE XERO
const xero = new XeroClient.XeroClient({
  clientId: process.env.XERO_CLIENT_ID,
  clientSecret: process.env.XERO_CLIENT_SECRET,
  redirectUris: [process.env.XERO_REDIRECT_URL],
  scopes: scopes.split(" "),
});
const newXeroClient = new XeroClient.XeroClient();


/*
 * GET XERO ORG CONNECT URL
 */

module.exports.getConnectURL = async function (req, res, next) {
  if (session.tokenSet) {
    // This reset the session and required data on the xero client after ts recompile
    xero.setTokenSet(session.tokenSet);
    await xero.updateTenants();
  }
  const url = await xero.buildConsentUrl();
  return res.json({ url: url });
};



module.exports.disConnect = async function (req, res, next) {
  const orgId = req.query.orgId;

  // Delete all timesheet ids
  await attendancemodel.updateMany({ timesheetid : { $ne : 'null' } },{timesheetid : "null"}, {new : true}).then(d =>d); 
  // Delete all employee ids
  await user.updateMany({ xeroid : { $ne : 'null' } },{xeroid : "null"}, {new : true}).then(d =>d); 

  const org = await xeroProfile.findOneAndDelete({
    orgId: orgId,
  });
  return res.json(
  {
    "Status"        : "success",
    "Message"       : "Your xero account is disconnected."
  });
};

/*
 * XERO AFTER AUTHENTICATE SAVE ORG DATA XERO_PROFILE
 */

module.exports.xerocallback = async function (req, res, next) {
  try {         
    const url = req.url;
    const orgId = req.query.orgId;
    if (session.tokenSet) {
      // This reset the session and required data on the xero client after ts recompile
      xero.setTokenSet(session.tokenSet);
      await xero.updateTenants();
    }

    const tokenSet = await xero.apiCallback(url);
    await xero.updateTenants();

    // this is where you can associate & save your
    // `tokenSet` to a user in your Database
    const decodedIdToken = jwtDecode(tokenSet.id_token);
    const decodedAccessToken = jwtDecode(tokenSet.access_token);

    session.tokenSet = tokenSet;
    session.decodedIdToken = decodedIdToken;
    session.decodedAccessToken = decodedAccessToken;
    session.allTenants = xero.tenants;
    session.activeTenant = xero.tenants[0];
    //console.log("Session () >>>> ", session);
    const orgData = xero.tenants[0].orgData;
    let addresses = {};
    if (orgData.addresses[0]) {
      addresses = orgData.addresses[0];
    }

    console.log("orgData () >>>> ", orgData);
    

    let companyAddresses = "";
    if (addresses.addressLine1 !== undefined) {
      companyAddresses = addresses.addressLine1;
    }
    if (addresses.addressLine2 !== undefined) {
      companyAddresses = companyAddresses + " " + addresses.addressLine2;
    }
    if (addresses.addressLine3 !== undefined) {
      companyAddresses = companyAddresses + " " + addresses.addressLine3;
    }
    if (addresses.addressLine4 !== undefined) {
      companyAddresses = companyAddresses + " " + addresses.addressLine4;
    }

    let phone = "";
    if (orgData.phones.length > 0) {
      phone = orgData.phones[0].phoneNumber;
    } else {
      phone = undefined;
    }

    // Get Payroll Calendars
    const payrollCalendarRes = await getPayrollCalendars(orgData.organisationID);
    if(payrollCalendarRes.error){
      return res.json(
      {
        "Status"        : "danger",
        "Type"          : "payrollCalendarRes",
        "Message"       : payrollCalendarRes.error           
      });
    }
    const payrollCalendarId = getPaymentCalendarId(payrollCalendarRes.data);
   
    // Get Pay Items
    const payItemRes = await getPayItems(orgData.organisationID);
    if(payItemRes.error){
      return res.json(
      {
        "Status"        : "danger",
        "Type"          : "payItemRes",
        "Message"       : payItemRes.error           
      });
    }
    const ordinaryEarningsRateID = getEarningsRateId(payItemRes.data.earningsRates);     
   

    const param = {
      orgId:orgId,
      companyId:orgData.organisationID,
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
      expiresAt: tokenSet.expires_at,
      companyName: orgData.name,
      legalName: orgData.legalName,
      companyAddress: companyAddresses,
      companyEmailAddress: orgData.email,
      city: orgData.city,
      region: orgData.region,
      country: orgData.country,
      countryCode: orgData.countryCode,
      postalCode: orgData.postalCode,
      mobile: phone,
      baseCurrency: orgData.baseCurrency,
      createTime: orgData.createdDateUTC,
      companyInfo: orgData,
      payItems:payItemRes.data?payItemRes.data:null,
      payrollCalendars:payrollCalendarRes.data?payrollCalendarRes.data:null,
      payrollCalendarId: payrollCalendarId?payrollCalendarId:null,
      ordinaryEarningsRateID: ordinaryEarningsRateID?ordinaryEarningsRateID:null,
      isConnected: true,
    };

    console.log("param =>>>",param);
        
    // GET XERO PROFILE AND UPDATE/CREATE
    let xeroRes = {};        
    const xeroProfileRes = await xeroProfile.findOne({companyId:orgData.organisationID}).then(d=>d);
    if (xeroProfileRes) {
      await xeroProfile.findOneAndUpdate({companyId:orgData.organisationID},param,{new:true}).then (d=>d);
      xeroRes = xeroProfileRes;
    } else {
      const newxeroProfile = new xeroProfile(param);
      xeroRes = await newxeroProfile.save();
    }
    return res.json(
    {
      "Status"        : "success",
      "Message"       : "Xero account authentication successful.",
      "CalendarId"    : payrollCalendarId
    });
  } catch (error) {
    // LOGGING ERROR
    return res.json(
    {
      "Status"        : "danger",
      "Message"       : error.message,
    });
  }
};

/*
 * REFRESH XERO TOKEN
 */
async function xeroRefreshToken(orgId) {
  try {
    const org = await xeroProfile.findOne({
      orgId: orgId,
      isConnected: true,
      isDeleted: false,
    });

    //const now = new Date().getTime();
    const now = Math.floor(Date.now() /1000);
    if (parseInt(org.expiresAt) < now) {
      console.log("Token is currently expired!");
      const newTokenSet = await newXeroClient.refreshWithRefreshToken(
        process.env.XERO_CLIENT_ID,
        process.env.XERO_CLIENT_SECRET,
        org.refreshToken
      );
      org.accessToken = newTokenSet.access_token;
      org.refreshToken = newTokenSet.refresh_token;
      org.expiresAt = newTokenSet.expires_at;
      org.save();
      return org;      
    } else {
      console.log("TokenSet is not expired!");
      return org;  
    }    
  } catch (error) {
    // LOGGING ERROR
    console.log(error);
    return { error: error.message };
  }
}


/*
 * CREATE EMPLOYEE FOR TIMESHEET
 */
module.exports.checkToken = async function (req, res, next) {   
    const refTkn = await xeroRefreshToken(req.body.orgId); 
    res.json({
      status: true,
      refTkn: refTkn
    });
}

/*
 * Save Xero Tokens
 */
module.exports.saveToken = async function (req, res, next) { 
    // GET XERO PROFILE CREATE
    let xeroRes = {};      
    const newxeroProfile = new xeroProfile(req.body);
    xeroRes = await newxeroProfile.save();
    return res.json(xeroRes);
}    


/*
 * CREATE EMPLOYEE ON XERO
 */
async function createXeroEmployee(xeroCompanyId,employee,userid) {
    return new Promise(async resolve => {
      try {
        const response = await xero.payrollAUApi.createEmployee(xeroCompanyId,employee);
        const employeeID = response.body.employees[0].employeeID;
        // Update xero id un user collection
        await user.findOneAndUpdate({_id: userid},{xeroid : employeeID}, {new : true}).then(d =>d);               
        resolve(employeeID);
      } catch (error) {  
        const error = JSON.stringify(error.response.body, null, 2);
        resolve({ error: xeroError(error) }); 
      } 
    });  
  }

/*
 * UPDATE EMPLOYEE ON XERO
 */
async function updateXeroEmployee(xeroCompanyId,employeeId,employee) {
    return new Promise(async resolve => {
      try {
        const response = await xero.payrollAUApi.updateEmployee(xeroCompanyId,employeeId,employee);
        const employeeID = response.body.employees[0].employeeID;
        resolve(employeeID);
      } catch (error) {  
        const error = JSON.stringify(error.response.body, null, 2);
        resolve({ error: xeroError(error) }); 
      } 
    });  
  }


/*
 * CREATE EMPLOYEE'S TIMESHEET ON XERO 
 */
async function createXeroTimesheet(xeroCompanyId,timesheet) {
  return new Promise(async resolve => {
    try {
      const response = await xero.payrollAUApi.createTimesheet(xeroCompanyId,timesheet);
      const timesheetID = response.body.timesheets[0].timesheetID;
      resolve(timesheetID);
    } catch (error) {  
      const error = JSON.stringify(error.response.body, null, 2);
      resolve({ error: xeroError(error) }); 
    } 
  });  
}

/*
 * UPDATE TIMESHEET ON XERO
 */
async function updateXeroTimesheet(xeroCompanyId,updateTimesheetID,updateTimesheet) {  
  return new Promise(async resolve => {
    try {
      const response = await xero.payrollAUApi.updateTimesheet(xeroCompanyId, updateTimesheetID,  updateTimesheet);
      const timesheetID = response.body.timesheets[0].timesheetID;
      resolve(timesheetID);
    } catch (error) {
      const error = JSON.stringify(error.response.body, null, 2);
      resolve({ error: xeroError(error) }); 
    }
  });
} 

/*
 * Find xero id in database, If not found then create employee on xero
 */
async function findUser(userid,org) { 
  return new Promise(async resolve => {
    await user.findOne({"_id":userid}) .then(async function(userdata) {            

    let employeeData = {};
    let homeAddress = {};
    homeAddress['addressLine1'] = userdata.property.ddress_li_559d ? "Adress line1" : "Adress line1";
    homeAddress['postalCode']   = userdata.property.ostal_cod_ehi6 ? "1234" : "1234";
    homeAddress['city']         = userdata.property.uburb_ta4j ? "city" : "city";
    homeAddress['region']       = userdata.property.uburb_ta4j ? "NSW" : "NSW";

    const dob = userdata.property.date_of_birth_1c7 ? new Date(await convertTZ(userdata.property.date_of_birth_1c7,req.body.authkey.branchid.timezone)).toISOString().slice(0, 10) : "1970-01-01";     

    employeeData['firstName']   = userdata.property.first_name;
    employeeData['lastName']    = userdata.property.last_name;
    employeeData['email']       = userdata.property.primaryemail;
    employeeData['dateOfBirth'] = dob;
    employeeData['startDate']   = userdata.property.createdAt ? userdata.property.createdAt : new Date().getFullYear()+"-01-01";
    employeeData['IsAuthorisedToApproveTimesheets'] = true;
    employeeData['payrollCalendarID']         = org.payrollCalendarId;
    employeeData['ordinaryEarningsRateID']   = org.ordinaryEarningsRateID;
    employeeData['homeAddress']              = homeAddress;

    let employee = [{"Employee": employeeData}];
    //const employeeId = await createXeroEmployee(org.companyId,employee[0],userid); 
    
    let employeeId = '';

    const where = 'email="' + userdata.property.primaryemail + '"';

    const res = await xero.payrollAUApi
      .getEmployees(
        org.companyId,
        org.companyInfo.createdDateUTC,           
        where
      ).then(async (response) => {
        if (response.body) {
          if(response.body.employees.length == 0){
            // Create new employee on xero
            employeeId = await createXeroEmployee(org.companyId,employee[0],userid); 
          }else{
            // Update existing employee on xero
            const employeeID = response.body.employees[0].employeeID;
            employeeId = await updateXeroEmployee(org.companyId,employeeID,employee[0]); 
          }                  
        }
        resolve(employeeId); 
      }).catch((err) => {
        console.log(err);
        resolve(err);
      });  
    });     
  });
}

/*
 * Weekly Attecndence Data
 */
function weeklyAttecndenceData(startDate,endDate){

  // const startdate = new Date(startDate); 
  // let sday = ("0" + startdate.getDate()).slice(-2);
  // let smonth = ("0" + (startdate.getMonth() + 1)).slice(-2);
  // let syear = startdate.getFullYear();
  // const timeSheetStartDate = syear+"-"+smonth+"-"+sday;

  // const enddate = new Date(endDate); 
  // let eday = ("0" + enddate.getDate()).slice(-2);
  // let emonth = ("0" + (enddate.getMonth() + 1)).slice(-2);
  // let eyear = enddate.getFullYear();
  // const timeSheetEndDate = eyear+"-"+emonth+"-"+eday;

  let weeklyAttendanceArr = [];
  for (let index = 0; index < 7; index++) {     
    let data  = {};
    let timestampDate = new Date(startDate); 
    timestampDate.setDate(timestampDate.getDate()+parseInt(index)); 

    let checkinday = ("0" + timestampDate.getDate()).slice(-2);
    let checkinmonth = ("0" + (timestampDate.getMonth() + 1)).slice(-2);
    let checkinyear = timestampDate.getFullYear();
    let timestamp = checkinyear+checkinmonth+checkinday;
     
    data.time=checkinyear+checkinmonth+checkinday;
    data.hours= 0.00;

    weeklyAttendanceArr.push(data);
  }

  const weeklyData = [];
   
  weeklyData['startDate']   = startDate;
  weeklyData['endDate']     = endDate;
  weeklyData['attendance']  = weeklyAttendanceArr;

  return weeklyData;
} 

/*
 * Find Default Payment Calendar Id 
 */

function getPaymentCalendarId(calendar){
  let index = calendar.findIndex(item => item.calendarType == "WEEKLY");
  if(index != -1){
    return calendar[index].payrollCalendarID;
  }else{
    return 'undefined';
  }
}

/*
 * Find Default Payment Calendar Id 
 */

function getEarningsRateId(earningsRate){
  let index = earningsRate.findIndex(item => item.earningsType == "ORDINARYTIMEEARNINGS");
  if(index != -1){
    return earningsRate[index].earningsRateID;
  } 
}

module.exports.createTimesheet = async function (req, res, next) { 


  const startDate   = new Date(await convertTZ(req.body.startDate,req.body.authkey.branchid.timezone)).toISOString().slice(0, 10);     
  const endDate     = new Date(await convertTZ(req.body.endDate,req.body.authkey.branchid.timezone)).toISOString().slice(0, 10);     

  const employees = req.body.employees;
  const orgId     = req.body.orgId;
  // const startDate = req.body.startDate;     
  // let endDate     = new Date(req.body.endDate);    
  // endDate.setDate(endDate.getDate()+1);
        
  let weeklyData = weeklyAttecndenceData(startDate,endDate);
        
  // let tenddate  = new Date(req.body.endDate); 
  // let eday      = ("0" + tenddate.getDate()).slice(-2);
  // let emonth    = ("0" + (tenddate.getMonth() + 1)).slice(-2);
  // let eyear     = tenddate.getFullYear();
  // const timeSheetEndDate = eyear+"-"+emonth+"-"+eday;

  const org = await xeroRefreshToken(orgId); 
  await xero.initialize();
  const tokenSet = {
      "access_token": org.accessToken,
      "expires_in": org.expiresAt,
      "token_type": "Bearer",
      "refresh_token": org.refreshToken,
    };
      
    await xero.setTokenSet(tokenSet);

    for (let index = 0; index < employees.length; index++) {
        const employee = employees[index];

        let xeroEmpId = await findUser(employee,org);
        
        if(xeroEmpId && xeroEmpId.error){
          return res.json(
          {
            "Status"        : "danger",
            "Message"       : xeroEmpId.error           
          });
        }

        const attendanceRes =  await attendancemodel.find({ membrozid: employee,'checkin': {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            } ,'checkout': {
              //$gte: new Date(startDate),
              $lte: new Date(endDate)
            }         
        }); 

        // Create timesheet on xero          
        let timeSheetData = {};
        let timesheetLines = {};
        timesheetLines['earningsRateID']  = org.ordinaryEarningsRateID;

        let numberOfUnits = [];
        let totalHour = 0;

        let xeroResponse = [];
        let timesheetAction = "create";
        let timeSheetID = "";

        for (let i = 0; i < attendanceRes.length; i++) {
          const attendance    = attendanceRes[i];
          const checkin       = new Date(attendance.checkin).getTime();
          const checkout      = new Date(attendance.checkout).getTime()
          const userid        = attendance.membrozid._id;          

          if(attendance && attendance.timesheetid && attendance.timesheetid != 'null'){
            timesheetAction = "update";
            timeSheetID = attendance.timesheetid;
          }       

          const seconds = Math.floor((checkout - (checkin))/1000);
          const minutes = Math.floor(seconds/60);
          const hours = Math.floor(minutes/60);
          totalHour = totalHour+hours;
          //numberOfUnits.push(hours); 
            
          const checkindate   = new Date(attendance.checkin);
          const checkinday = ("0" + checkindate.getDate()).slice(-2);
          const checkinmonth = ("0" + (checkindate.getMonth() + 1)).slice(-2);
          const checkinyear = checkindate.getFullYear();
          const timestamp = checkinyear+checkinmonth+checkinday;  
          
          let index = weeklyData.attendance.findIndex(item=>item.time==timestamp)

          if(index!=-1){
            weeklyData.attendance[index].hours=hours
          }
        }

        weeklyData.attendance.forEach(element => numberOfUnits.push(element.hours));

        timeSheetData['employeeID'] = xeroEmpId;
        timeSheetData['startDate'] = weeklyData['startDate'];
        timeSheetData['endDate'] = weeklyData['endDate'];
        timeSheetData['status'] = "DRAFT";
        timeSheetData['hours'] = totalHour;  

        timesheetLines['numberOfUnits'] = numberOfUnits;
        timeSheetData['timesheetLines'] = [timesheetLines];

        let timesheet = [{"Timesheet": timeSheetData}];  

        let timesheetIdRes = '';

        if(timesheetAction == "create"){
          timesheetIdRes = await createXeroTimesheet(org.companyId,timesheet[0]);
        }else{
          timesheetIdRes = await updateXeroTimesheet(org.companyId,timeSheetID,timesheet[0]);
        }

        if(timesheetIdRes && timesheetIdRes.error){
          return res.json(
          {
            "Status"        : "danger",
            "Message"       : timesheetIdRes.error    
          });
        }else{
          // Update timesheet id in attendace collection
          xeroResponse[employee] = timesheetIdRes;
          await attendancemodel.updateMany({membrozid: employee, 'checkin': {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }},{timesheetid : timesheetIdRes}, {new : true}).then(d =>d); 
        } 

    }  
    return res.json(
    {
      "Status"        : "success",
      "Message"      : "Timesheet created on xero sucessfully."
    });
} 

function xeroError(err) {
  const error = JSON.parse(err);
  console.log("Main Error =>>",  error);
  
  let errorMessage = '';
  if(error.Type ==  'ValidationException' || error.Type ==  'Error') {
    if(error && error.Timesheets) {
      errorMessage = error.Timesheets[0].ValidationErrors[0].Message;
    }else if(error && error.Employees) {
      errorMessage = error.Employees[0].ValidationErrors[0].Message;
    }else if(error && error.Message) {
      errorMessage = error.Message;
    }else{
      errorMessage = "Some thing went wrong.";
    } 
  }else if(error && error.Message) {
    errorMessage = error.Message;
  }else if(error && error.Detail) {
    errorMessage = error.Detail;
  }else{
    errorMessage = "Some thing went wrong.";
  }

  return "Xero api error: "+errorMessage;
}


/*
 * Get Payroll Calendars
 */
async function getPayrollCalendars(xeroCompanyId) {
  return new Promise(async resolve => {
    try {
      const response = await xero.payrollAUApi.getPayrollCalendars(xeroCompanyId, null, null, null, null);
      console.log("getPayrollCalendars response =>>", response);
      resolve({ data: response.body.payrollCalendars }); 
    } catch (error) {
      const error = JSON.stringify(error, null, 2);
      console.log(`Status Code: ${err.response.statusCode} => ${error}`);
      console.log(`Error Body: ${err.response.body} => ${error}`);
      return false;
      //resolve({ error: xeroError(error) }); 
    } 
  }); 
}

async function convertTZ(date, tzString) {
    //return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
    // Set static for testing
    tzString = "America/Los_Angeles";
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

/*
 * Create New Payment Calender
 */
module.exports.createPayrollCalendar = async function (req, res, next) {

  console.log("req.body.startDate =>>",req.body.startDate);
  console.log("req.body.endDate =>>",req.body.endDate);

  const sdate = await convertTZ(req.body.startDate,req.body.authkey.branchid.timezone);

  const orgId       = req.body.orgId;
  //const startDate   = new Date(await convertTZ(req.body.startDate,req.body.authkey.branchid.timezone)).toISOString().slice(0, 10);     
  //const endDate     = new Date(await convertTZ(req.body.endDate,req.body.authkey.branchid.timezone)).toISOString().slice(0, 10);     
  const startDate   = new Date(req.body.startDate).toISOString().slice(0, 10);     
  const endDate     = new Date(req.body.endDate).toISOString().slice(0, 10);     
  let  paymentDate  = new Date(req.body.endDate);
  paymentDate.setDate(paymentDate.getDate()+1);

  const org = await xeroRefreshToken(orgId); 
  await xero.initialize();
  const tokenSet = {
      "access_token"  : org.accessToken,
      "expires_in"    : org.expiresAt,
      "token_type"    : "Bearer",
      "refresh_token" : org.refreshToken,
    };
        
  await xero.setTokenSet(tokenSet);

  let calendarData = [];
  calendarData['name']          = "CSA-HR-Weekly123";
  calendarData['calendarType']  = "Weekly";
  calendarData['startDate']     = startDate;
  calendarData['paymentDate']   = paymentDate;

  const payrollCalendars = [];
  payrollCalendars.push(calendarData);
  
  console.log("payrollCalendars =>>>",payrollCalendars);
  return false;

  try {
    const response = await xero.payrollAUApi.createPayrollCalendar(org.companyId,payrollCalendars);
    
    if(response && response.error){
      return res.json(
      {
        "Status"        : "danger",
        "Message"       : response.error      
      });
    }else{
      const calendarID = response.body.payrollCalendars[0].payrollCalendarID;
      // Update xero id un user collection
      await xeroProfile.findOneAndUpdate({companyId: org.companyId},{payrollCalendarId : calendarID}, {new : true}).then(d =>d);               
    }
  } catch (error) {    
    const error = JSON.stringify(error, null, 2);  
    return res.json(
    {
      "Status"    : "danger",
      "Message"   : xeroError(error)
    }); 
  }

  return res.json(
  {
    "Status"    :  "success",
    "Message"   :  "Payroll Calendar Created Sucessfully."
  });

}

/*
 * Get Pay Items
 */
async function getPayItems(xeroCompanyId) {  
  return new Promise(async resolve => {
    try {
      const response = await xero.payrollAUApi.getPayItems(xeroCompanyId, null, null, null, null);
      resolve({ data: response.body.payItems }); 
    } catch (error) {
      resolve({ error: xeroError(error) }); 
    }    
  });
}
