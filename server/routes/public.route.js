const express = require('express');
const asyncHandler = require('express-async-handler');
const userCtrl = require('../controllers/user.controller');
const memberCtrl = require('../controllers/member.controller');
const billCtrl = require('../controllers/bill.controller');
const paymentscheduleCtrl = require('../controllers/paymentschedule.controller');
const communicationCtrl = require('../controllers/communication.controller');
const commonCtrl = require('../controllers/common.controller');
const workflowCtrl = require('../controllers/workflow.controller');
const reportschedulerCtrl = require('../controllers/reportscheduler.controller');
const formdataCtrl = require('../controllers/formdata.controller');
const paymentgatewayCtrl = require('../integrations/paymentgateway.controller');
const magpieCtrl = require('../integrations/magpie');
const authCtrl = require('../controllers/auth.controller');
const router = express.Router();

module.exports = router;
var schedule = require('node-schedule');

router.route('/user/:Id')
  /** GET /api/wallets - Get list of wallets */
  .get(asyncHandler(getuserbyId))

router.route('/member/:Id')
  /** GET /api/wallets - Get list of wallets */
  .get(asyncHandler(getmemberbyId))

router.route('/user/resetpassword')
  .post(asyncHandler(authCtrl.resetuserpassword));

router.route('/member/resetpassword')
  .post(asyncHandler(authCtrl.resetmemberpassword));

router.route('/checkuser')
  .post(asyncHandler(userCtrl.checkuser));

router.route('/checkmember')
  .post(asyncHandler(memberCtrl.checkmember));

router.route('/paymentgateway')
  .post(asyncHandler(billbyId), asyncHandler(commonCtrl.getpaymentgateway));

router.route('/onlinepayment')
  .post(asyncHandler(billbyId), asyncHandler(getpaymentgateway), asyncHandler(onlinepayment))

router.route('/sms')
  .post(asyncHandler(communicationCtrl.sendsms))

router.route('/pushalert')
  .post(asyncHandler(communicationCtrl.sendpushalert))

router.route('/start')
  .get(asyncHandler(startreportscheduler), asyncHandler(startworkflow))

router.route('/downloadcert')
  .get(asyncHandler(downloadcert))

router.route('/sendotp')
  .post(asyncHandler(commonCtrl.getotpmessage), asyncHandler(communicationCtrl.sendsms))

router.route('/onlinepaymentsuccess')
  .post(paymentgatewayCtrl.onlinepaymentsuccess)
  .get(paymentgatewayCtrl.onlinepaymentsuccess);

router.route('/stripesuccess')
  .post(paymentgatewayCtrl.stripesuccess, paymentgatewayCtrl.onlinepaymentsuccess);

router.route('/razorpaysuccess')
  .post(paymentgatewayCtrl.onlinepaymentsuccess);

router.route('/onlinepaymentfail')
  .post(paymentgatewayCtrl.onlinepaymentfail); 

router.route('/generatepayments')
  .get(commonCtrl.generatepayments);

router.route('/createmagpietoken')
  .post(magpieCtrl.createmagpiesource, magpieCtrl.retrieveCustByEmail, magpieCtrl.createmagpiecustomer, magpieCtrl.attachsource);

router.route('/deletemagpietoken')
  .post(magpieCtrl.deletemagpietoken);

router.route('/chargemagpiecarde')
  .post(magpieCtrl.chargecard)
   

//  router.route('/createcheckout')
//   .post(paymentgatewayCtrl.createcheckout);

router.route('/removecache')
  /** GET /api/taxes - Get list of taxes */
  .get(commonCtrl.removecache)

router.route('/callend')
  .post(asyncHandler(commonCtrl.getcalldetail))  


async function getuserbyId(req, res) {
  let user = await userCtrl.findbyId(req.params.Id);
  res.json(user);
}

async function getmemberbyId(req, res) {
  let member = await memberCtrl.findbyId(req.params.Id);
  res.json(member);
}

async function billbyId(req, res, next) {

  var billid = req.body.billid;
  var paymentscheduleid = req.body.paymentscheduleid;
  let bill;
  if(billid){
    bill = await billCtrl.findbyId(billid)
  }else if(paymentscheduleid){
    bill = await paymentscheduleCtrl.findbyId(paymentscheduleid)
  }
  req.body.bill = bill
  next();
}

async function onlinepayment(req, res, next) {
  await paymentgatewayCtrl.onlinepayment(req, res);
}

async function getpaymentgateway(req, res, next) {
  var id = req.body._id;
  var gateway = await formdataCtrl.findbyId(id);
  var paymentMode = req.body.paymentMode
  if (!gateway) {
    res.json({ "failure": paymentMode + " Payment gateway not configured yet, please choose another payment gateway!!!" });
  }
  else {
    req.body.paymentMode = gateway.property.integration;
    req.body.gateway = gateway;
    next();
  }
}

async function downloadcert(req, res, next)
{

  const http = require('https');
  const fs = require('fs');

  const url = 'https://res.cloudinary.com/membroz/raw/upload/v1629377373/fhiit/webxpay_ra7cpr.pem'; // link to file you want to download
  http.get(url, function(response) {
      if (response.statusCode === 200) {
          if (!fs.existsSync("./uploads/")) fs.mkdirSync("./uploads/");
          var file = fs.createWriteStream("./uploads/webxpay.pem");
          response.pipe(file);
          res.json("File downloaded")
      }
  });


}
 
async function startreportscheduler(req, res, next) {  
  let rule = new schedule.RecurrenceRule();
  //rule.second = 30;
  //rule.minute = new schedule.Range(0, 59, 15);
  rule.minute = 30;
  //console.log(rule)
  // schedule
  reportschedulerCtrl.generatereport(req);
  schedule.scheduleJob(rule, function () {
    reportschedulerCtrl.generatereport(req);
  });

  next();
}

async function startworkflow(req, res, next) {
  let rule = new schedule.RecurrenceRule();
  // runs at 15:00:00
  //rule.second = 30;  
  rule.minute = 30; //new schedule.Range(0, 59, 15);
  //rule.hour = 15;
  //console.log(rule)
  // schedule
  
  schedule.scheduleJob(rule, function () {
    workflowCtrl.generatenotification(req);
  });

  res.json({})
}


