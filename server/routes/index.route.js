const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const designationRoutes = require('./designation.route');
const branchRoutes = require('./branch.route');
const memberRoutes = require('./member.route');
const roleRoutes = require('./role.route');
const formRoutes = require('./form.route');
const formfieldRoutes = require('./formfield.route');
const organizationsettingRoutes = require('./organizationsetting.route');
const languageresourceRoutes = require('./languageresource.route');
const analyticsreportRoute = require('./analyticsreport.route');
const menuRoutes = require('./menu.route');
const formlistRoutes = require('./formlist.route');
const lookupRoutes = require('./lookup.route');
const commonRoutes = require('./common.route');
const menupermissionRoutes = require('./menupermission.route');
const dashboardRoutes = require('./dashboard.route');
const importRoutes = require('./import.route');
const bookingRoutes = require('./booking.route');
const facilitybookingRoutes = require('./facilitybooking.route');
const leaseorderRoutes = require('./leaseorder.route');
const billitemRoutes = require('./billitem.route');
const inventoryRoutes = require('./inventory.route');
const purchaserequestRoutes = require('./purchaserequest.route');
const purchaseorderRoutes = require('./purchaseorder.route');
const purchaseinvoiceRoutes = require('./purchaseinvoice.route');
const purchaseinvoicepaymentRoutes = require('./purchaseinvoicepayment.route');
const billRoutes = require('./bill.route');
const billpaymentRoutes = require('./billpayment.route');
const challanRoutes = require('./challan.route');
const vendorRoutes = require('./vendor.route');
const taxRoutes = require('./tax.route');
const serviceRoutes = require('./service.route');
const assetRoutes = require('./asset.route');
const quotationRoutes = require('./quotation.route');
const salesorderRoutes = require('./salesorder.route');
const formdataRoutes = require('./formdata.route');
const appointmentRoutes = require('./appointment.route');
const couponRoutes = require('./coupon.route');
const communicationRoutes = require('./communication.route');
const activityRoutes = require('./activity.route');
const dispositionRoutes = require('./disposition.route');
const membershipRoutes = require('./membership.route');
const paymentRoutes = require('./payment.route');
const paymentscheduleRoutes = require('./paymentschedule.route');
const paymentitemRoutes = require('./paymentitem.route');
const paymenttermRoutes = require('./paymentterm.route');
const prospectRoutes = require('./prospect.route');
const enquiryRoutes = require('./enquiry.route');
const saleschannelRoutes = require('./saleschannel.route');
const saleschannelteamRoutes = require('./saleschannelteam.route');
const campaignRoutes = require('./campaign.route');
const resortRoutes = require('./resort.route');
const resortlocationRoutes = require('./resortlocation.route');
const groupclassRoutes = require('./groupclass.route');
const accountheadRoutes = require('./accounthead.route');
const expenseRoutes = require('./expense.route');
const journalRoutes = require('./journal.route');
const activitytemplateRoutes = require('./activitytemplate.route');
//const mailalertRoutes = require('./mailalert.route');
const templateRoutes = require('./template.route');
const wallettxnRoutes = require('./wallettxn.route');
const publicRoutes = require('./public.route');
const quickformRoutes = require('./quickform.route');
const cashbacktermRoutes = require('./cashbackterm.route');
const reportRoutes = require('./report.route');
const bireportRoutes = require('./bireport.route');
const eventRoutes = require('./event.route');
const communicationlogRoutes = require('./communicationlog.route');
const documentRoutes = require('./document.route');
const folderRoutes = require('./folder.route');
const membershipusageRoutes = require('./membershipusage.route');
const timesheetRoutes = require('./timesheet.route');
const leaverequestRoutes = require('./leaverequest.route');
const supportRoutes = require('./support.route');
const reportschedulerRoutes = require('./reportscheduler.route');
const attendanceRoutes = require('./attendance.route');
const leavetypeRoutes = require('./leavetype.route');
const creditdebitnoteRoutes = require('./creditdebitnote.route');
const joborderRoutes = require('./joborder.route');
const workflowRoutes = require('./workflow.route');
const payrollRoutes = require('./payroll.route');
const salarycomponentRoutes = require('./salarycomponent.route');
const advanceclaimRoutes = require('./advanceclaim.route');
const payrollsettingRoutes = require('./payrollsetting.route');
const webpartRoutes = require('./webpart.route');
const auditactionRoutes = require('./auditaction.route');
const historyRoutes = require('./history.route');
const seasoncalendarRoutes = require('./seasoncalendar.route');
const weekscheduleRoutes = require('./weekschedule.route');
const availabilitycalendarRoutes = require('./availabilitycalendar.route');
const tourpackageRoutes = require('./tourpackage.route');
const packagebookingRoutes = require('./packagebooking.route');
// Import Xero Route
const xeroRoute = require('./xero.route');

const router = express.Router(); // eslint-disable-line new-cap
import User from '../models/user.model';
import Member from '../models/member.model';
import Auditaction from '../models/auditaction.model';
import global from '../config/global';
global.loadGlobal();
/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use(function (req, res, next) {

  var url = req.originalUrl.toString().trim(); 
  console.log("url", url) 
  var userid = req.headers ? req.headers.authkey : null;
  var authtoken = req.headers ? req.headers.authtoken : null; 
  var ipAddress = req.headers ? req.headers.ipaddress : null;  
  if (ipAddress && !global.checkiprestriction(ipAddress)) 
  {     
    console.log("You do not have permission")
    return res.json({ message: "Your IP is not in allow list.", Error: 403, status: "permission denied" });    
  }

  if (url.startsWith("/api/public") || url.startsWith("/api/xero") || url.startsWith("/api/auth") || url.startsWith("/api/forms") || url.startsWith("/api/formdatas") || url.startsWith("/api/formfields") || url.startsWith("/api/organizationsettings") || url.startsWith("/api/langresources")) {
    if (userid)
      User.findOne({ _id: userid, status: "active" })
        .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
        .exec()
        .then((user) => {
          if (!user){
            Member.findOne({ _id: userid, status: "active" })
                  .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
                  .then((member) => {
                    req.body.authkey = member;
                    req.body.authtoken = authtoken;
                    req.body.ipAddress = ipAddress;
                      next() 
                  })
          }
          else {
            req.body.authkey = user;
            req.body.authtoken = authtoken;
            req.body.ipAddress = ipAddress;
            next()
          }          
        })
    else next();
  }
  else if (req.headers && req.headers.authkey && req.headers.authkey != "undefined") {    
    User.findOne({ _id: userid, status: "active", "$or": [{ forcelogin: false }, { forcelogin: { "$exists": false } }] })
        .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
        .exec()
        .then((user)=> {

          if (!user){

            Member.findOne({ _id: userid, status: "active", "$or": [{ forcelogin: false }, { forcelogin: { "$exists": false } }] })
                  .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
                  .then((member) => {
                      if (!member){
                          return res.json({ message: "You do not have permission", Error: 403, status: "permission denied" })
                      }
                      req.body.authkey = member;
                      req.body.authtoken = authtoken;
                      req.body.ipAddress = ipAddress;
                      next()
                  })
                  .catch((e) => console.log(e))
          }
          else {
            req.body.authkey = user;
            req.body.authtoken = authtoken;
            req.body.ipAddress = ipAddress;
            next()
          }
        }) 
        .catch((e) => console.log(e))
  }
  else  {
      return res.json({ message: "You do not have permission", Error: 403, status: "permission denied" })
  }
});

router.use(function (req, res, next) {
  var authtoken = req.body.authtoken;
  if (authtoken)  
    Auditaction.findOneAndUpdate({ token: authtoken }, { "$set": { last: new Date } }).then();
  next();
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/designations', designationRoutes);
router.use('/branches', branchRoutes);
router.use('/members', memberRoutes);
router.use('/roles', roleRoutes);
router.use('/forms', formRoutes);
router.use('/formfields', formfieldRoutes);
router.use('/organizationsettings', organizationsettingRoutes);
router.use('/langresources', languageresourceRoutes);
router.use('/analyticsreports', analyticsreportRoute);
router.use('/menus', menuRoutes);
router.use('/formlists', formlistRoutes);
router.use('/lookups', lookupRoutes);
router.use('/common', commonRoutes);
router.use('/menupermissions', menupermissionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/imports', importRoutes);
router.use('/bookings', bookingRoutes);
router.use('/facilitybookings', facilitybookingRoutes);
router.use('/leaseorders', leaseorderRoutes);
router.use('/billitems', billitemRoutes);
router.use('/inventories', inventoryRoutes);
router.use('/purchaserequests', purchaserequestRoutes);
router.use('/purchaseorders', purchaseorderRoutes);
router.use('/purchaseinvoices', purchaseinvoiceRoutes);
router.use('/purchaseinvoicepayments', purchaseinvoicepaymentRoutes);
router.use('/bills', billRoutes);
router.use('/billpayments', billpaymentRoutes);
router.use('/challans', challanRoutes);
router.use('/vendors', vendorRoutes);
router.use('/taxes', taxRoutes);
router.use('/services', serviceRoutes);
router.use('/assets', assetRoutes);
router.use('/quotations', quotationRoutes);
router.use('/salesorders', salesorderRoutes);
router.use('/formdatas', formdataRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/coupons', couponRoutes);
router.use('/communications', communicationRoutes);
router.use('/activities', activityRoutes);
router.use('/dispositions', dispositionRoutes);
router.use('/memberships', membershipRoutes);
router.use('/payments', paymentRoutes);
router.use('/paymentschedules', paymentscheduleRoutes);
router.use('/paymentitems', paymentitemRoutes);
router.use('/paymentterms', paymenttermRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/prospects', prospectRoutes);
router.use('/saleschannels', saleschannelRoutes);
router.use('/saleschannelteams', saleschannelteamRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/resorts', resortRoutes);
router.use('/resortlocations', resortlocationRoutes);
router.use('/groupclasses', groupclassRoutes);
router.use('/accountheads', accountheadRoutes);
router.use('/expenses', expenseRoutes);
router.use('/journals', journalRoutes);
router.use('/activitytemplates', activitytemplateRoutes);
//router.use('/mailalerts', mailalertRoutes);
router.use('/templates', templateRoutes);
router.use('/wallettxns', wallettxnRoutes);
router.use('/public', publicRoutes);
router.use('/quickforms', quickformRoutes);
router.use('/cashbackterms', cashbacktermRoutes);
router.use('/reports', reportRoutes);
router.use('/bireports', bireportRoutes);
router.use('/events', eventRoutes);
router.use('/communicationlogs', communicationlogRoutes);
router.use('/documents', documentRoutes);
router.use('/folders', folderRoutes);
router.use('/membershipusages', membershipusageRoutes);
router.use('/timesheets', timesheetRoutes);
router.use('/leaverequests', leaverequestRoutes);
router.use('/supports', supportRoutes);
router.use('/reportschedulers', reportschedulerRoutes);
router.use('/attendances', attendanceRoutes);
router.use('/leavetypes', leavetypeRoutes);
router.use('/creditdebitnotes', creditdebitnoteRoutes);
router.use('/joborders', joborderRoutes);
router.use('/workflows', workflowRoutes);
router.use('/payrolls', payrollRoutes);
router.use('/salarycomponents', salarycomponentRoutes);
router.use('/advanceclaims', advanceclaimRoutes);
router.use('/payrollsettings', payrollsettingRoutes);
router.use('/webparts', webpartRoutes);
router.use('/auditactions', auditactionRoutes);
router.use('/histories', historyRoutes);
router.use('/seasoncalendars', seasoncalendarRoutes);
router.use('/weekschedules', weekscheduleRoutes);
router.use('/availabilitycalendars', availabilitycalendarRoutes);
router.use('/tourpackages', tourpackageRoutes);
router.use('/packagebookings', packagebookingRoutes);
// Use Xero Route
router.use('/xero', xeroRoute);

module.exports = router;

