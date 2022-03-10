const Joi = require('joi');
var ObjectID = require('mongodb').ObjectID;
var url = process.env.MONGO_HOST;
var MongoClient = require('mongodb').MongoClient;
const common = require('../helpers/common');
const createHTML = require('../helpers/createHTML');
const previewhtml = require('../helpers/printpreview');
const thermalpreviewhtml = require('../helpers/thermalpreview');
const puppetter = require('../helpers/puppetter');
import json2csv from 'json2csv';
import fs from 'fs';
import async from "async";
const Contactview = require('../views/contact.view');
const Rfidmappingview = require('../views/rfidmapping.view');
const Holidayeventview = require('../views/holidayevent.view');
const Formdata = require('../models/formdata.model');
import { ToWords } from 'to-words';
import cache from 'memory-cache';
import { ObjectId } from 'mongodb';
const Appointment = require('../models/appointment.model');
const Leaverequest = require('../models/leaverequest.model');
const Attendance = require('../models/attendance.model');
const Advanceclaim = require('../models/advanceclaim.model');
const Bill = require('../models/bill.model');
const Billpayment = require('../models/billpayment.model');
const Booking = require('../models/booking.model');
const Challan = require('../models/challan.model');
const Creditdebitnote = require('../models/creditdebitnote.model');
const Expense = require('../models/expense.model');
const Facilitybooking = require('../models/facilitybooking.model'); 
const Joborder = require('../models/joborder.model');
const Organizationsetting = require('../models/organizationsetting.model');
const Leaseorder = require('../models/leaseorder.model');
const Payment = require('../models/payment.model');
const Paymentschedule = require('../models/paymentschedule.model');
const Purchaserequest = require('../models/purchaserequest.model');
const Purchaseinvoice = require('../models/purchaseinvoice.model');
const Purchaseinvoicepayment = require('../models/purchaseinvoicepayment.model');
const Purchaseorder = require('../models/purchaseorder.model');
const Quotation = require('../models/quotation.model');
const Packagebooking = require('../models/packagebooking.model');
const Tourpackage = require('../models/tourpackage.model');
const Salesorder = require('../models/salesorder.model');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const Communication = require('../models/communication.model');
const Support = require('../models/support.model');
const axios = require('axios')
const nodeHtmlToImage = require('node-html-to-image')
var cloudinary = require('cloudinary').v2;
const QRCode = require('qrcode')

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: false,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  }
});

module.exports = {
  getbycollection,
  deepobjectsearch_like,
  exportcsv,
  generatehtml,
  generatepreview,
  generatepdf,
  getmessagetemplate,
  massupdate,
  updatestatus,
  updatefields,
  contactfilterview,
  updatewfstatus,
  getpaymentgateway,
  viewfilter,
  viewfiltercount,
  viewcalendar,
  removecache,
  generatepayments,
  getobjectbyId,
  getrfidmapping,
  createrazorpaysubscription,
  approveupdate,
  clone,
  getotpmessage,
  cleanbranchdata,
  validateuniquefieldvalue,
  kickoffworkflow,
  checkandupdatepermissions,
  generateindex,
  generateindexscript,
  connecttocall,
  getcalldetail,
  updatethumbnail,
  generateqrcode,
  generatebarcode,
}

async function generateindex(req, res, next) {

  var client = await MongoClient.connect(url);
  var db = client.db();

  db.collection("webparts").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("webparts").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("histories").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("histories").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("payments").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("payments").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("paymentschedules").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("paymentschedules").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("workflows").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("workflows").createIndex({ "branchid": 1 }, { "name": "branchid", "background": true });
  db.collection("workflows").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("members").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("members").createIndex({ "branchid": 1, "status": 1 }, { "name": "branchid+status", "background": true });
  db.collection("members").createIndex({ "property.primaryemail": 1 }, { "unique": true, "name": "primaryemail", "background": true });
  db.collection("supports").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("supports").createIndex({ "branchid": 1, "status": 1 }, { "name": "branchid+status", "background": true });
  db.collection("reportschedulers").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("reportschedulers").createIndex({ "branchid": 1 }, { "name": "branchid", "background": true });
  db.collection("reportschedulers").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("paymentterms").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("paymentterms").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("bookings").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("bookings").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("designations").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("designations").createIndex({ "branchid": 1, "status": 1 }, { "name": "branchid+status", "background": true });
  db.collection("designations").createIndex({ "title": 1, "branchid": 1 }, { "unique": true, "name": "title+branch", "background": true });
  db.collection("quickforms").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("quickforms").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("quotations").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("quotations").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("templates").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("templates").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("branches").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("branches").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("availabilitycalendars").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("availabilitycalendars").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("leaverequests").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("leaverequests").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("dispositions").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("dispositions").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("attendances").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("attendances").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("resorts").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("resorts").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("campaigns").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("campaigns").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("campaigns").createIndex({ "campaignname": 1, "branchid": 1 }, { "unique": true, "name": "campaignname+branch", "background": true });
  db.collection("communications").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("communications").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("coupons").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("coupons").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("coupons").createIndex({ "branchid": 1, "couponcode": 1 }, { "unique": true, "name": "couponcode+branch", "background": true });
  db.collection("bills").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("bills").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("activitytemplates").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("activitytemplates").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("facilitybookings").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("facilitybookings").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("billpayments").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("billpayments").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("menupermissions").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("menupermissions").createIndex({ "roleid": 1, "status": 1 }, { "unique": true, "name": "roleid+status", "background": true });
  db.collection("services").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("services").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("services").createIndex({ "branchid": 1, "title": 1 }, { "unique": true, "name": "branch+title", "background": true });
  db.collection("billitems").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("billitems").createIndex({ "branchid": 1, "status": 1 }, { "name": "branchid+status", "background": true });
  db.collection("billitems").createIndex({ "branchid": 1, "itemname": 1 }, { "unique": true, "name": "branch+itemname", "background": true });
  db.collection("dashboards").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("dashboards").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("leaseorders").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("leaseorders").createIndex({ "status": 1, "branchid": 1 }, { "name": "branchid+status", "background": true });
  db.collection("users").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("users").createIndex({ "branchid": 1, "status": 1 }, { "name": "branchid+status", "background": true });
  db.collection("users").createIndex({ "property.primaryemail": 1 }, { "unique": true, "name": "primaryemail", "background": true });
  db.collection("salesorders").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("salesorders").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("payrolls").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("payrolls").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("membershipusages").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("membershipusages").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("formdatas").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("formdatas").createIndex({ "formid": 1, "branchid": 1, "status": 1 }, { "name": "formid+branch+status", "background": true });
  db.collection("inventories").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("inventories").createIndex({ "branchid": 1 }, { "name": "branchid", "background": true });
  db.collection("inventories").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("advanceclaims").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("advanceclaims").createIndex({ "branchid": 1, "status": 1 }, { "name": "branchid+status", "background": true });
  db.collection("appointments").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("appointments").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("langresources").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("cashbackterms").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("cashbackterms").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("formlists").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("formlists").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("formlists").createIndex({ "formname": 1 }, { "unique": true, "name": "formname", "background": true });
  db.collection("menus").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("menus").createIndex({ "menuname": 1 }, { "unique": true, "name": "menuname", "background": true });
  db.collection("documents").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("documents").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("activities").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("activities").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("formfields").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("formfields").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("purchaseinvoicepayments").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("purchaseinvoicepayments").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("assets").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("assets").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("assets").createIndex({ "title": 1, "branchid": 1 }, { "unique": true, "name": "title+branch", "background": true });
  db.collection("groupclasses").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("groupclasses").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("groupclasses").createIndex({ "branchid": 1, "title": 1 }, { "unique": true, "name": "title+branch", "background": true });
  db.collection("formfieldoptions").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("packagebookings").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("packagebookings").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("organizationsettings").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("organizationsettings").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("wallettxns").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("wallettxns").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("timesheets").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("timesheets").createIndex({ "branchid": 1, "status": 1 }, { "name": "branchid+status", "background": true });
  db.collection("reports").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("reports").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("purchaseinvoices").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("purchaseinvoices").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("payrollsettings").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("payrollsettings").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("Copy_of_roles").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("Copy_of_roles").createIndex({ "branchid": 1 }, { "name": "branchid", "background": true });
  db.collection("Copy_of_roles").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("weekschedules").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("weekschedules").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("joborders").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("joborders").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("memberships").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("memberships").createIndex({ "membershipname": 1, "branchid": 1 }, { "unique": true, "name": "branch+membershipname", "background": true });
  db.collection("memberships").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("enquiries").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("enquiries").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("communicationlogs").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("communicationlogs").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("purchaserequests").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("purchaserequests").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("folders").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("folders").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("bireports").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("bireports").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("vendors").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("vendors").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("vendors").createIndex({ "branchid": 1, "fullname": 1, "property.primaryemail": 1, "property.mobile": 1, "status": 1 }, { "unique": true, "name": "branchid+fullname+pimaryemail+mobile+status", "background": true });
  db.collection("purchaseorders").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("purchaseorders").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("salarycomponents").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("salarycomponents").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("system.views").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("expenses").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("expenses").createIndex({ "branchid": 1, "status": 1 }, { "name": "branchid+status", "background": true });
  db.collection("tourpackages").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("tourpackages").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("prospects").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("prospects").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("creditdebitnotes").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("creditdebitnotes").createIndex({ "branchid": 1, "status": 1 }, { "name": "branchid+status", "background": true });
  db.collection("auditactions").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("auditactions").createIndex({ "branchid": 1 }, { "name": "branchid", "background": true });
  db.collection("seasoncalendars").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("seasoncalendars").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("leavetypes").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("leavetypes").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("leavetypes").createIndex({ "title": 1, "branchid": 1 }, { "unique": true, "name": "title+branch", "background": true });
  db.collection("roles").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("roles").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("accountheads").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("accountheads").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("accountheads").createIndex({ "headname": 1, "branchid": 1 }, { "unique": true, "name": "headname+branch", "background": true });
  db.collection("saleschannels").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("saleschannels").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("saleschannels").createIndex({ "channelname": 1, "branchid": 1 }, { "unique": true, "name": "channelname+branch", "background": true });
  db.collection("taxes").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("taxes").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("taxes").createIndex({ "branchid": 1, "taxname": 1, "status": 1 }, { "unique": true, "name": "branch+taxname+status", "background": true });
  db.collection("saleschannelteams").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("saleschannelteams").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("saleschannelteams").createIndex({ "salesteamname": 1, "branchid": 1 }, { "unique": true, "name": "salesteamname+branch", "background": true });
  db.collection("paymentitems").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("paymentitems").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("paymentitems").createIndex({ "branchid": 1, "paymentitemname": 1 }, { "unique": true, "name": "branch+paymentitemname", "background": true });
  db.collection("lookups").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("lookups").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("resortlocations").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("resortlocations").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("resortlocations").createIndex({ "locationname": 1, "branchid": 1 }, { "unique": true, "name": "locationname+branch", "background": true });
  db.collection("events").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("events").createIndex({ "branchid": 1, "status": 1 }, { "name": "branch+status", "background": true });
  db.collection("events").createIndex({ "branchid": 1, "title": 1 }, { "unique": true, "name": "title+branch", "background": true });
  db.collection("forms").createIndex({ "_id": 1 }, { "name": "_id_" });
  db.collection("forms").createIndex({ "status": 1 }, { "name": "status", "background": true });
  db.collection("forms").createIndex({ "formname": 1 }, { "unique": true, "name": "formname", "background": true });
  db.collection("analyticsreports").createIndex({ "_id": 1 }, { "name": "_id_" });

  res.json("success")

}

async function generateindexscript(req, res, next) {

  var client = await MongoClient.connect(url);
  var db = client.db();
  // iterate through every collection in MongoDB database
  db.listCollections().forEach(function (collection) {
    //console.log("collection", collection.name)
    if (collection.type == "view") return;
    var indexes = db.collection(collection.name).listIndexes();
    // now iterate through every index in the collection
    indexes.forEach(function (index) {
      // we don't need these as it will be auto created

      delete index.v; delete index.ns;
      var key = index.key;
      delete index.key
      var options = {};
      // let us also copy all options associated with the index
      // index property unique is an example
      for (var option in index) {
        options[option] = index[option]
      }
      // console.log("key", key)
      // console.log("options", options)
      // Create script output
      console.log("db.collection(\"" + collection.name + "\").createIndex(" + JSON.stringify(key) + ", " + JSON.stringify(options) + ");");

    });
  });

}

async function checkandupdatepermissions(req, res, next) {

  var rolesids = req.body.roleids;
  var forms = req.body.forms;
  var client = await MongoClient.connect(url);
  var db = client.db();

  forms.forEach(async (formname) => {
    
    var updates = await db.collection("bi-permissionviews").find({ form: formname }).toArray();
    var updatesids = []
    updates.forEach((role) => {
      updatesids.push(role._id.toString())
    });
    let intersection = rolesids.filter(x => !updatesids.includes(x));
    var obj = {
      "recordpermission": [
        {
          "type": "edit",
          "datapermission": "My Branch"
        },
        {
          "type": "view",
          "datapermission": "My Branch"
        },
        {
          "type": "delete",
          "datapermission": "My Branch"
        },
        {
          "type": "add",
          "datapermission": "My Branch"
        }
      ],
      "formname": formname
    }

    var newroleid = [];
    intersection.forEach((roleid) => {
      newroleid.push(ObjectID(roleid));
    })
    // console.log("newroleid", newroleid, formname)
    await db.collection("roles").updateMany({ _id: { "$in": newroleid } }, { "$push": { "permissions": obj } })

  })

  //if (client) client.close();

  res.json("success")

}

async function kickoffworkflow(req, res, next) {
  
  var action = req.body.action;
  var branchid = req.body.authkey.branchid;
  var schemaname = req.body.schemaname;  
  var id = req.body.id;  
  var original;
  if(action.email && action.email.length > 0){
    var emailid = action.email[0];
    var email = await Communication.findById(emailid).lean({ virtuals: true, autopopulate: { maxDepth: 2 } });   
    action.email[0] = email;
  }else if(action.sms && action.sms.length > 0){
    var smsid = action.sms[0];
    var sms = await Communication.findById(smsid).lean({ virtuals: true, autopopulate: { maxDepth: 2 } }); 
    action.sms[0] = sms;
  }else if(action.whatsapp && action.whatsapp.length > 0){
    var whatsappid = action.whatsapp[0];
    var whatsapp = await Communication.findById(whatsappid).lean({ virtuals: true, autopopulate: { maxDepth: 2 } }); 
    action.whatsapp[0] = whatsapp;
  }
  
  
  switch(schemaname) {
    case "facilitybookings":
      original = await Facilitybooking.findById(id).lean({ virtuals: true, autopopulate: { maxDepth: 2 } });
      break;
    case "appointments":
      original = await Appointment.findById(id).lean({ virtuals: true, autopopulate: { maxDepth: 2 } });
      break;
    case "bookings":
      original = await Booking.findById(id).lean({ virtuals: true, autopopulate: { maxDepth: 2 } });
      break;
    case "bills":
      original = await Bill.findById(id).lean({ virtuals: true, autopopulate: { maxDepth: 2 } });
      break;
    case "paymentschedules":
      original = await Paymentschedule.findById(id).lean({ virtuals: true, autopopulate: { maxDepth: 2 } });
      break;
    default:
      // code block
  }
  common.generateobject(action, null, original, null, req, branchid);
  res.json("done");

}

async function getcalldetail(req, res, next) {

  // var request = require('request');
  // var key = "d9f7c75179f974e6c0a400425370c18c91f1f9f57cc9110b"
  // var sid = "vervitude1"
  // var token = "ba052c46579e6104c3164ab482156504a611c5a7f93aaf90"

  var sid = req.body.CallSid;
  var call = await Formdata.findOneAndUpdate({ "property.sid": sid }, { "$set": { 'property.response': req.body } }, { new: true })
  //console.log(call)
  // var prop = call.property;
  // prop.response = req.body;  
  // call.property = prop;
  // console.log("prop", call.property)
  // new Formdata(call).save(req).then();
  // var options = {
  //   url: "https://" + key + ":" + token + "@api.exotel.in/v1/Accounts/" + sid + "/Calls/" + CallSid
  // };

  // function callback(error, response, body) {
  //   if (!error && response.statusCode == 200) {
  //     console.log(body);
  //   }
  // }
}

async function connecttocall(req, res, next) {

  var from = req.body.from;
  var to = req.body.to;
  var consultantid = req.body.consultantid;

  var key="d9f7c75179f974e6c0a400425370c18c91f1f9f57cc9110b"
  var sid="vervitude1"
  var token="ba052c46579e6104c3164ab482156504a611c5a7f93aaf90"
  // from = from ? from : "919016353077"
  // to = to ? to : "918758363925"
  //console.log(from, to)
  const formUrlEncoded = x => Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')

  const axios = require('axios')
  var convert = require('xml-js');
  var url = "https://" + key + ":" + token + "@api.exotel.in/v1/Accounts/" + sid + "/Calls/connect"
  axios.post(url,
    formUrlEncoded({
      "From": from,
      "To": to,
      "CallerId": '02248932763',
      "CallerType": 'promo',
      "StatusCallback": "http://dashboard.vervitude.co/api/public/callend",
      "StatusCallbackEvents[0]": "terminal",
      "StatusCallbackContentType": "application/json"
    }),
    {
      withCredentials: true,
      headers: {
        "Accept": "application/x-www-form-urlencoded",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    },
  ) 
    .then((data) => {
      var result1 = convert.xml2js(data.data, {compact: true, spaces: 4});
      if (result1.TwilioResponse && result1.TwilioResponse.Call.Sid._text){

        var call = {
          formid: "61961b5ba83abc153c7f3d42",
          property: {
            sid:  result1.TwilioResponse.Call.Sid._text,
            request: result1.TwilioResponse.Call
          },
          contextid: consultantid,                
          onModel: "User",
          addedby: req.body.authkey._id,    
          onModelAddedby: "Member"          
        }
        new Formdata(call).save(req).then();
        res.json(call) 
      }
      else {
        res.json({ status: "failed" }) 
      }
      
    })
    .catch((error) => {
      console.error(error)
    })
  
}


async function cleanbranchdata(req, res, next) {

  MongoClient.connect(url, function (err, client) {
    var db = client.db();

    db.collection("members").deleteMany({ branchid: branchid});
    db.collection("prospects").deleteMany({ branchid: branchid});


  }, function(){
    if (client) client.close();
  });

}

async function getotpmessage(req, res, next) {
  let organizationsetting = await Organizationsetting.findOne({})
  var otpmessages = organizationsetting.property.otpmessages;
  var otptype = req.body.otptype;
  var otp = req.body.otp;
  var message;
  if (otpmessages && otpmessages.length>0)
  otpmessages.forEach((otpmessage)=>{
    if (otpmessage.otptype == otptype) {
      message = otpmessage.message.replace('{#var#}', otp);
    }
  })
  if (!message) message = "Dear Customer, Use this OTP ' + otp + ' - Thanks"
  req.body.message = message;
  next();
}


async function getrfidmapping(req, res) {
  var mappings = await Rfidmappingview.getfilterview(req.body)
  res.json(mappings)

}

function generatepayments(req, res, next) {

  // const Paymentschedule = require('../models/paymentschedule.model');
  // const Payment = require('../models/payment.model');
  const Member = require('../models/member.model');
  var number= 0;
  MongoClient.connect(url, function (err, client) {
    var db = client.db();

    db.collection("members").find({}).toArray()
      .then((members) => {
        async.forEachSeries(members, (member, next1) => {

          //console.log(member.fullname)
          var fullname = member.property.first_name + ' ' + member.property.middle_name + ' ' + member.property.surname
          //console.log(fullname)

          next1()
          // Member.findOneAndUpdate({ _id: member._id }, { "$set": { fullname: fullname } }, { new: true }).then((mem0) => {
          //   next1()
          //   // // var prop = {};
          //   // // prop = member.property;
          //   // // prop["mobile"] = member.mobile
          //   // // // console.log("member.email", member.email)
          //   // // // prop["primaryemail"] = member.email
          //   // // prop["joiningdate"] = member.joiningdate
          //   // // prop["gender"] = member.gender
          //   // mem0.property = member.property;
          //   // mem0.save(req).then((mem)=> {
          //   //   console.log(mem.property)
          //   //   next1()
          //   // } );
          //   // console.log(mem0.property)
          //   // next()
          // })

          //Member.findByIdAndUpdate(member._id, { "$set": { "property.mobile": member.mobile, "property.primaryemail": member.email, "property.joiningdate": member.joiningdate, "property.gender": member.gender } }).then()
        })
      })
    // db.collection("receiptviews").find({}).toArray()
    //   .then((receipts) => {
    //     receipts.forEach((receipt)=>{

    //       var dates = receipt.date;

    //       var count = 0;
    //       if (dates)
    //         dates.forEach((date) => {

    //           if (date instanceof Date && !isNaN(date)) {
    //             number +=1;
    //             var paymentschedule = new Paymentschedule({
    //               memberid: receipt._id,
    //               prefix: "INV",
    //               invoicenumber: number,
    //               paymentterms: receipt.paymentterms,
    //               scheduledate: date,
    //               amount: parseInt(receipt.amount[count]),
    //               totalamount: parseInt(receipt.amount[count]),
    //               paidamount: parseInt(receipt.amount[count]),
    //               balance: 0,
    //               status: "Paid"
    //             })

    //             paymentschedule.save(req).then((invoice)=>{
    //               var payment = new Payment({
    //                 memberid: invoice.memberid,
    //                 item: invoice._id,
    //                 prefix: "REC",
    //                 receiptnumber: invoice.invoicenumber,
    //                 paymentdate: invoice.scheduledate,
    //                 paidamount: invoice.paidamount,
    //                 totalamount: invoice.totalamount,
    //                 amount: invoice.paidamount,
    //                 status: "Paid"
    //               })
    //               //console.log(payment)
    //               payment.save(req).then()

    //             })
    //           }
    //           count += 1;

    //         })

    //     })
    //     if (client) client.close();
    //   });
      res.json({})

  });

}


async function validateuniquefieldvalue(req) {

  var formid = req.body.formid._id ? ObjectID(req.body.formid._id) : ObjectID(req.body.formid)
  var id = req.body._id ? ObjectID(req.body._id) : null;

  var client = await MongoClient.connect(url);
  var db = client.db();
  var query = { formid: formid, unique: true }

  var field = await db.collection("formfields").findOne(query)
  if (field) {

    query = { formid: formid, status: "active", _id: { "$ne": id }, branchid: req.body.authkey.branchid._id }
    query["property." + field.fieldname] = req.body.property[field.fieldname];
    var obj = await db.collection("formdatas").findOne(query)
    if (client) client.close();
    if (obj) {
      req.body.error = field.displayname + " should be unique " + "[" + req.body.property[field.fieldname] + "]";
      return obj;
    }
    else {
      return null;
    }

  }
  else return null;

}

async function clone(req, res, next) {
  var schemaname = req.body.schemaname;
  var id = req.body.id;
  var extraparams = req.body.extraparams;
  id = ObjectID(id)
  var query = { _id: id };
  MongoClient.connect(url, function (err, client) {
    var db = client.db();
    db.collection(schemaname).findOne(query, function(err, obj) {
      if (obj){
        obj._id = ObjectID();
        if(extraparams){
          extraparams.forEach((params)=>{
            if(params.datatype == 'date'){
              obj[params.fieldname] = new Date(params.fieldvalue);
            }else{
              obj[params.fieldname] = params.fieldvalue;
            }
          });
        }
        db.collection(schemaname).insertOne(obj, function(err, obj1) {
          if (client) client.close();
          res.json(obj);
        });

      }
      if (client) client.close();
    });

  });

}


async function contactfilterview(params) {
  return await Contactview.getfilterview(params)
}

async function approveupdate(formdata, req) {

  var schemaname = formdata.formid.schemaname;
  var objectId = formdata.contextid._id;
  var property = formdata.property;

  switch(schemaname) {
    case "users":
      var obj = await User.findById(ObjectID(objectId))
      var prop = obj.property;

      for (const p in property) {
        if (p == "profilepic") {
          obj.profilepic = property[p];
        }
        else {
          prop[p] = property[p];
        }
      }

      obj.property = prop;
      await obj.save(req)
      formdata.status = "Approved"
      return await formdata.save(req)
      break;
    case y:
      // code block
      break;
    default:
      // code block
  }

}

function updatewfstatus(req, res, next) {

  var objectId = req.body.objectId;
  var schemaname = req.body.schemaname;
  var wfstatus = req.body.wfstatus;
  switch (schemaname) {
    case "leaverequests":
      Leaverequest.findById(ObjectID(objectId))
        .then((obj) => {
          obj.wfstatus = wfstatus;
          obj.save(req);
          addcustomformdata(schemaname, obj, req)
          res.json(obj)
        });
      break;
    case "attendances":
      Attendance.findById(ObjectID(objectId))
        .then((obj) => {
          obj.wfstatus = wfstatus;
          obj.save(req);
          res.json(obj)
        });
      break;
    case "advanceclaims":
      Advanceclaim.findById(ObjectID(objectId))
        .then((obj) => {
          obj.wfstatus = wfstatus;
          obj.save(req);
          res.json(obj)
        });
      break;
    case "users":
      User.findById(ObjectID(objectId))
        .then((obj) => {
          obj.wfstatus = wfstatus;
          obj.save(req);
          res.json(obj)
        });
      break;
    case "formdatas":
      Formdata.findById(ObjectID(objectId))
        .then((obj) => {
          obj.wfstatus = wfstatus;
          obj.save(req);
          res.json(obj)
        });
      break;
    case "quotations":
      Quotation.findById(ObjectID(objectId))
        .then((obj) => {
          obj.wfstatus = wfstatus;
          obj.save(req);
          res.json(obj)
        });
      break;
    case "bills":
      Bill.findById(ObjectID(objectId))
        .then((obj) => {
          obj.wfstatus = wfstatus;
          obj.save(req);
          res.json(obj)
        });
      break;
    default:
      // code block
  }

  // MongoClient.connect(url, function (err, client) {
  //   var db = client.db();
  //   db.collection(schemaname).findOneAndUpdate({ _id: ObjectID(objectId) }, { $set: { wfstatus: wfstatus } }, { returnOriginal: false })
  //     .then((obj) => {
  //       if (client) client.close();
  //       addcustomformdata(schemaname, obj.value)
  //       res.json(obj)
  //     });

  // });

}

function addcustomformdata(schemaname, obj, req) {

  if (schemaname == "leaverequests" && obj.wfstatus == "Approved") {

    var leave = {
      formid: "60b7392f99e17f765884f426",
      property: {
        note:  obj.noofleave + " Leave used",
        leavecomponentid: obj.leavetype,
        quantity: obj.noofleave,
        date: new Date(),
      },
      contextid: obj.userid,
      onModel: "User"
    }
    new Formdata(leave).save(req);

    obj.approveleave = obj.noofleave;
    obj.save(req).then();

    User.findById(obj.userid)
      .then((user) => {
        var leavecomponents = user.leavecomponents;
        leavecomponents.forEach(leavecomponent => {
          if (leavecomponent.leavecomponentid._id.toString() == obj.leavetype._id.toString()){
            leavecomponent.balance -= obj.noofleave
            user.leavecomponents = leavecomponents;
            User.findByIdAndUpdate(obj.userid, { "$set": { leavecomponents: leavecomponents } }).then()
          }
        })

      })

  }
  else if (schemaname == "leaverequests" && obj.wfstatus == "Declined") {

    if (obj.approveleave && obj.approveleave > 0) {

      var approveleave = obj.approveleave ? obj.approveleave : 0;
      obj.approveleave = 0;
      obj.save(req).then();

      User.findById(obj.userid)
        .then((user) => {
          var leavecomponents = user.leavecomponents;
          leavecomponents.forEach(leavecomponent => {
            if (leavecomponent.leavecomponentid._id.toString() == obj.leavetype._id.toString()) {
              leavecomponent.balance += approveleave
              user.leavecomponents = leavecomponents;
              User.findByIdAndUpdate(obj.userid, { "$set": { leavecomponents: leavecomponents } }).then()
            }
          })

        })
    }
    else {

      obj.approveleave = null;
      obj.save(req).then();

    }

  }

}

function updatestatus(req, res, next) {

  var ids = req.body.ids;
  var schemaname = req.body.schemaname;
  var value = req.body.value;

  MongoClient.connect(url, function (err, client) {

    var db = client.db();
    async.forEachSeries(ids, (id, next) => {
      db.collection(schemaname).findOneAndUpdate({ _id: ObjectID(id) }, { "$set": { "status": value } })
        .then(() => {
          next();
        })
    }, function () {
      if (client) client.close();
      res.json({})
    })
  })
}

function updatefields(req, res, next) {

  var schemaname = req.body.schemaname;
  var id = req.body.id;
  var updatedfields = req.body.updatedfields;
  id = ObjectID(id)
  var query = { _id: id };

  MongoClient.connect(url, function (err, client) {
    var db = client.db();
    db.collection(schemaname).findOne(query, function(err, obj) {
      if (obj){
        if(updatedfields){
          updatedfields.forEach((params)=>{
            if(params.datatype == 'date'){
              obj[params.fieldname] = new Date(params.fieldvalue);
            }else{
              obj[params.fieldname] = params.fieldvalue;
            }
          });
        }
        db.collection(schemaname).updateOne(query , { $set : obj } ,{ upsert: true } , function(err, obj1) {
          if (client) client.close();
          res.json(obj);
        });

      }
      if (client) client.close();
    });

  });
}



function massupdate(req, res, next) {

  var ids = req.body.ids;
  var schemaname = req.body.schemaname;
  var fieldname = req.body.fieldname;
  var action = req.body.action;

  var fieldvalue = req.body.fieldvalue;
  var fieldtype = req.body.fieldtype;
  var updatequery = {}

  if (fieldtype == "ObjectId"){
    var newfieldvalue = [];
    if (!Array.isArray(fieldvalue)){
      fieldvalue = ObjectID(fieldvalue)
    }
    else {
      fieldvalue.forEach(function(e){
        newfieldvalue.push(ObjectID(e));
      })
      fieldvalue = newfieldvalue;
    }

  }

  else if (fieldtype == "Date"){
    fieldvalue = new Date(fieldvalue);
  }

  updatequery[fieldname] = fieldvalue;

  MongoClient.connect(url, function (err, client) {
    var db = client.db();

    async.forEachSeries(ids, (id, next) => {
      db.collection(schemaname).findOneAndUpdate({ _id: ObjectID(id) }, { "$set": updatequery })
        .then((updated) => {
          next();
        })
    }, function () {
      if (client) client.close();
      res.json({})
    })
  })
}

async function getmessagetemplate(req, res, next) {

  var message = req.body.message;
  var branchid = req.body.authkey.branchid;
  var template = req.body.template;
  var element = req.body.data;
  var field;
  if (req.body.templateid && !template){
    template = req.body.communication;
    field = template.mappingfields.field[0];
  }
  else {
    field = template.mappingfield;
  }
  message.subject = common.regexrep(template.subject, element, null, branchid);
  var fieldnameforEmail = "property.primaryemail";

  var db_fieldValue = ""

  if (field) {
    if (field == "_id") {
      db_fieldValue = fieldnameforEmail;
    }
    else {
      db_fieldValue = field + "." + fieldnameforEmail;
    }
  }

  var fieldnameSplit = db_fieldValue.split('.');

  if (fieldnameSplit[3]) {
    if (element[fieldnameSplit[0]]) {
      var obj = element[fieldnameSplit[0]][fieldnameSplit[1]]
      db_fieldValue = obj[fieldnameSplit[2]][fieldnameSplit[3]];
    } else {
      db_fieldValue = '';
    }

  } else if (fieldnameSplit[2]) {
    if (element[fieldnameSplit[0]]) {
      var obj = element[fieldnameSplit[0]][fieldnameSplit[1]]
      db_fieldValue = obj[fieldnameSplit[2]];
    } else {
      db_fieldValue = '';
    }

  } else if (fieldnameSplit[1]) {
    if (element[fieldnameSplit[0]]) {
      db_fieldValue = element[fieldnameSplit[0]][fieldnameSplit[1]];
    } else {
      db_fieldValue = '';
    }

  } else if (fieldnameSplit[0]) {
    if (element[fieldnameSplit[0]]) {
      db_fieldValue = element[fieldnameSplit[0]];
    } else {
      db_fieldValue = '';
    }

  } 

  message.to = [ db_fieldValue ]
  message.template = template
  message.receivers = element._id
  message.content = getfullcontent(message.content)  
  message.attachmentblob = await puppetter.generatePdf(message.content); 
  return res.json(message);

}

function getfullcontent(content)
{

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
              <title></title>
              <style type="text/css">
                 
             
                body {
                  margin: 0;
                  color: #000;
                  background-color: #fff;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                  font-family: poppins, arial;
                    font-size: 13px;
                    color: #000000;
                }
                * {
                  box-sizing: border-box;
                }
                .print-page {
                    font-family: poppins, arial;
                    font-size: 13px;
                    color: #000000;
                    background: #ffffff;
                }
                .text-right {
                  text-align: right;
                }
                .text-center {
                  text-align: center;
                }
                .text-left {
                  text-align: left;
                }
  
                .align-top {
                  vertical-align: top;
                }
               .print-company {
                  font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
               }
               .print-text {
                  font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
                  line-height: 1.24;
               }
               address {
                  font-style: normal;
                  line-height: inherit;
  
              }
  
  
               .print-page-item-head {
                  font-family: poppins, arial;
                  font-size: 31px;
                  font-weight: 500;
                  color: #000000;
                  line-height: 1.24;
               }
               .print-item-number {
                  font-family: poppins, arial;
                  font-size: 16px;
                  color: #000000;
                  font-weight: bold;
                  text-transform: uppercase;
              }
  
              .table-print-head-row {
                   height:34px;
              }
              .table-print-head {
                color: #ffffff;
                font-size: 13px;
                background-color: #393837;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
  
              }
  
              @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
                .table-print-head {
                  color: #393837;
                  font-size: 13px;
                  background-color: #ffffff;
                  border-top:1px solid #aaaaaa;
                  border-bottom:1px solid #aaaaaa;
                  font-weight: bold;
  
                }
              }
  
              @supports (-ms-ime-align:auto) {
                .table-print-head {
                  color: #393837;
                  font-size: 13px;
                  background-color: #ffffff;
                  border-top:1px solid #aaaaaa;
                  border-bottom:1px solid #aaaaaa;
                  font-weight: bold;
  
                }
            }
  
            .text-break {
              word-break: break-word !important;
              word-wrap: break-word !important;
           }
  
           .print-table-td {
            color: #000000;
            font-size: 13px;
           }
  
           .break-row-after {
            page-break-after: auto;
            }
            .break-row-inside {
                page-break-inside: avoid;
            }
  
            .align-middle {
              vertical-align: middle;
            }
  
            .d-none {
              display:none;
            }
  
            .d-block {
                display: block;
            }
  
  
            .row {
                display: flex;
                flex-wrap: wrap;
            }
  
            .col-7 {
                flex: 0 0 58.3333333333%;
                max-width: 58.3333333333%;
            }
            .col-5 {
                flex: 0 0 41.6666666667%;
                max-width: 41.6666666667%;
            }
  
  
            .table-bordered {
                border: 1px solid #dee2e6;
            }
  
  
  
              </style>
            </head>
            <body >`
     
            + content + 
          
    `</body>
          </html>`

}

async function generatepdf(req, res, next) {
  var document = req.body.document;
  await puppetter.generatePdf(document, res);
}

async function generatehtml(req, res, next){

  var template = req.body.template;
  // var totalamount = data.totalamount;
  // var inword = numberToText.convertToText(totalamount)
  var content = createHTML.gethtml(template, data, req.body.authkey.branchid)
  if (req.body.formid){
    req.body.message = {
      content: content
    }
    next()
  }
  else {
    return res.json(content)
  }

}

function deepobjectsearch_like(req, res, next){

  let fullArray = req.body.data;
  let filteredArray = [];
  let selectAry = req.body.select?req.body.select:[];
  if(req.body.searchtext){

    fullArray.forEach(function(fullObj,index){
      let readyToPush = false;
      
      selectAry.forEach(function(selectObj,index){

        let splitArray = selectObj.fieldname.split('.');
        let tempRefObj = {};

        for(let i=0;i<splitArray.length;i++){


          if(i==0){
            tempRefObj = {};
            if(fullObj[splitArray[i]]){
              tempRefObj = fullObj[splitArray[i]];

              if(typeof tempRefObj == 'number'){
                tempRefObj = tempRefObj.toString().toUpperCase();
                if(tempRefObj.includes(req.body.searchtext.toUpperCase())){
                  readyToPush = true;
                }else{
                }
              }else if(typeof tempRefObj == 'string'){
                tempRefObj = tempRefObj.toUpperCase();
                if(tempRefObj.includes(req.body.searchtext.toUpperCase())){
                  readyToPush = true;
                }
              }else{
                if(splitArray.length==1){
                  //readyToPush = false;
                }
              }
            }
          }else{
            if(tempRefObj[0]){
              if(tempRefObj[0][splitArray[i]]){
                tempRefObj = tempRefObj[0][splitArray[i]];
              }
            }else{
              if(tempRefObj[splitArray[i]]){
                tempRefObj = tempRefObj[splitArray[i]];
              }
            }

            if((splitArray.length-1) == i){

              if(typeof tempRefObj=='number'){
                tempRefObj = tempRefObj.toString().toUpperCase();
                if(tempRefObj.includes(req.body.searchtext.toUpperCase())){
                  readyToPush = true;
                }
              }else if(typeof tempRefObj=='string'){
                tempRefObj = tempRefObj.toUpperCase();
                if(tempRefObj.includes(req.body.searchtext.toUpperCase())){
                  readyToPush = true;
                }
              }
            }
          }
        }
      });

      if(readyToPush){
        filteredArray.push(fullObj);
      }

    });
    
    var size = req.body.size;
    var totalCount = filteredArray.length;
    var totalPages = Math.ceil(totalCount / size)
    req.header = { "error" : false, "totalCount": totalCount , "totalPages": totalPages};

    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);      
    var start = req.body.pageNo * req.body.size- req.body.size;
    var end = req.body.pageNo * req.body.size;
    filteredArray = filteredArray.slice(start, end);
    return res.json(filteredArray);
  }else{
    return res.json(data);
  }

}


async function exportcsv(req, res, next) {

  var select = Array();
  var final_data = Array();
  var data = req.body.data;
  var branch = req.body.authkey ? req.body.authkey.branchid : undefined;  
  var locale = branch.locale ? branch.locale : "en-US";

  req.body.select.forEach(function (field) {    
    if(field.displayname!=undefined){
      select.push(field.displayname);
    }
  })
  data.forEach(function (schema_data,index) {

    var temp_ary = Object();

    req.body.select.forEach(function (col_heads) {

      var field1 = col_heads.fieldname.split(".");
      if(col_heads.fieldname!=undefined && col_heads.fieldname!='_id'){
        
        if(field1.length > 1 && field1[0] != "property"){

          var objdata = schema_data;
          field1.forEach(function(f1){
            if (objdata) objdata = objdata[f1];
          })          
          
          temp_ary[col_heads.displayname] = objdata;

        } else if(field1.length > 1 && field1[0] == "property"){
          var field = col_heads.fieldname.substring(9);
          var prop = schema_data.property;
          if (prop && prop[field]){
            temp_ary[col_heads.displayname] = prop[field];
          } 
        } else {  
          if (col_heads.fieldtype == "Date" && schema_data[col_heads.fieldname]) {
            var newdate = new Date(schema_data[col_heads.fieldname]);
            var date = Intl.DateTimeFormat(locale, options).format(newdate)
            temp_ary[col_heads.displayname] = date;
          }
          else if (col_heads.fieldtype == "Datetime" && schema_data[col_heads.fieldname]) {
            var options = {
              hour: 'numeric', minute: 'numeric', second: 'numeric',
              day: 'numeric', month: 'numeric', year: 'numeric',
              timeZone: branch.timeZone
            };
            var date = Intl.DateTimeFormat(locale, options).format(schema_data[col_heads.fieldname])
            temp_ary[col_heads.displayname] = date;
          }
          else if (col_heads.fieldtype == "time" && schema_data[col_heads.fieldname]) {
            var options = {
              hour: 'numeric', minute: 'numeric', second: 'numeric',
              timeZone: branch.timeZone
            };
            var date = Intl.DateTimeFormat(locale, options).format(schema_data[col_heads.fieldname])
            temp_ary[col_heads.displayname] = date;
          } else {
            temp_ary[col_heads.displayname] = schema_data[col_heads.fieldname];
          }
        }

      }

    });
    //push here
    final_data.push(temp_ary);

  });
  var rand_filename = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 15; i++) { rand_filename += possible.charAt(Math.floor(Math.random() * possible.length)); }
  rand_filename = rand_filename + '.csv';
  if (!fs.existsSync("./uploads/")) fs.mkdirSync("./uploads/")
  json2csv({ data: final_data, fields: select }, function (err, csv) {
    if (err) console.log(err);

    fs.writeFile('./uploads/' + rand_filename, csv, function (err) {
      if (err) {
        throw err;
      } else {
        var file = './uploads/' + rand_filename;
        res.setHeader('Content-type', 'text/csv');
        res.download(file, rand_filename, function () {
          fs.unlinkSync(file);
        });
      }
    });
  });

}

async function getbycollection(req, res) {
  var schemaname = req.body.refschema;
  var fields = req.body.refselect;
  var formid = req.body.formid;
  var field = {};
  if (Array.isArray(fields)){
    fields.forEach(function(f){
      field[f] = 1;
    })
  }
  else {
    field[fields] = 1;
  }

  if  (!schemaname) {
    return res.json({});
  }

  req.body.formname = req.body.refcollection;
  var search =  {}
  if (req.body.search){
    search = common.generatequery(req.body.search);
  }
  else {
    var param = {}
    param.formname = req.body.refcollection
    param.search = {}
    param.authkey = req.body.authkey;
    search = common.generatequery(param);
  }

  if (formid) {
    search["formid"] = ObjectID(formid);
  }

  // console.log(schemaname)
  // console.log(search)
  // console.log(field)
  MongoClient.connect(url, function (err, client) {

    var db = client.db();
    db.collection(schemaname).find(search)
      .project(field)
      .sort(field)
      .toArray()
      .then(all => {
        if (client) client.close();
        res.json(all)
      });



  });

}

function getpaymentgateway(req, res, next) {

  var bill = req.body.bill;
  var branchid = bill.branchid._id;
  Formdata.find({ "property.paymentgateway": true, branchid: branchid, status: "active" })
    .then((integrations) =>{
      var detail = {
        fullname: bill.customerid ? bill.customerid.fullname :  bill.memberid ? bill.memberid.fullname : '---',
        email: bill.customerid ? bill.customerid.property.email :  bill.memberid ? bill.memberid.property.email : '---',
        mobile: bill.customerid ? bill.customerid.property.mobile :  bill.memberid ? bill.memberid.property.mobile : '---',
        paymentgateways: integrations,
        branchid: bill.branchid,
        bill: req.body.bill
        // message: message,
        // status: status
      }
      res.json(detail)

    })

}

async function viewfiltercount(req, res) {

  var schemaname = req.body.viewname;
  var search = [];

  if (req.body.search && req.body.search.length > 0){
    search = req.body.search
  }

  var client = await MongoClient.connect(url);
  var db = client.db();

  var query = common.generatequery(req.body);

  if (req.body.schemaname=="formdatas"){
      delete query.formid;
  }
  var params = req.body;
  var size = parseInt(params.size);

  var result = await db.collection(schemaname).find(query).count();
  var totalPages = Math.ceil(result / size)
  req.header = { "error" : false, "totalCount": result , "totalPages": totalPages};
  
  //console.log("result", result.length)
  if (client) client.close();
  return result;

}

async function viewfilter(req, res) {

  var schemaname = req.body.viewname;
  var search = [];

  if (req.body.search && req.body.search.length > 0){
    search = req.body.search
  }

  var client = await MongoClient.connect(url);
  var db = client.db();

  var query = common.generatequery(req.body);

  if (req.body.schemaname=="formdatas"){
      delete query.formid;
  }

  var pageNo = parseInt(req.body.pageNo);
  var size = parseInt(req.body.size);
  var limit, skip;

  var sort = req.body.sort;
  if (!sort) {
    sort = {
        "updatedAt" : -1,
        "createdAt" : -1
    }
  }
  if(pageNo < 0 || pageNo === 0) {
    return {"error" : true, "message" : "invalid page number, should start with 1"};
  }

  skip = size * (pageNo - 1)
  limit = size;
  skip = isNaN(skip) ? 0 : skip
  limit = isNaN(limit) ? 0 : limit
  // console.log(skip, limit)
  // console.log(pageNo, size)
  var result = await db.collection(schemaname).find(query)
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .toArray();
  //console.log("result", result.length)
  if (client) client.close();
  return result;

}


async function getobjectbyId(Id, req) {
  var schemaname = req.body.schemaname;
  var subdetail = []
  var obj;  
  switch(schemaname) {
    case 'bills':
      obj = await Bill.findById(Id).populate('branchid');
      req.body.totalamount = obj.totalamount;
      // if (obj.deposit > 0){
      //   subdetail.push({ "Deposite": obj.deposit })
      // }
      subdetail.push({ "Paid amount": obj.paidamount })
      if (obj.balance > 0){
        subdetail.push({ "Balance amount": obj.balance })
      }
        
      break;
    case 'billpayments':
      obj = await Billpayment.findById(Id).populate('branchid');
      req.body.totalamount = obj.paidamount;      
      let paidtext = "Paid amount";
      if (obj.couponamount > 0)
      {
        var coupon = {}
        coupon["Coupon [" + obj.couponcode.couponcode + "]"] = obj.couponamount;
        subdetail.push(coupon);
        paidtext += "+Coupon";
      }
    
      if (obj.billid.balance > 0){
        subdetail.push({ "Balance amount": obj.billid.balance })
      }
      if (obj.billid.deposit > 0){
        subdetail.push({ "Deposit amount": obj.billid.deposit })
      }
      if (obj.walletamount && obj.walletamount > 0)
        subdetail.push({ "Wallet": obj.walletamount })
      
      if (obj.property && obj.property.giftcards && obj.property.giftcards.length > 0){
        obj.property.giftcards.forEach(gc => {
          let giftcard = {};
          giftcard[`Gift Card [${gc.giftcard}]`] = gc.giftcardamount;      
          subdetail.push(giftcard)
        });
        paidtext += "+GC";
      }

      if (obj.property && obj.property.creditnotes  && obj.property.creditnotes.creditnotesid){
           let creditnote = {};
           creditnote[`Credti Notes [${obj.property.creditnotes.document}]`] = obj.property.creditnotes.creditnotesamount;      
           subdetail.push(creditnote);
           paidtext += "+CN";
      }

      if (obj.paidamount > 0 ){
        let paid = {};
        paid[`${paidtext}`] = obj.paidamount;
        subdetail.push(paid);
      }
       
      break;

    case 'appointments':
      obj = await Appointment.findById(Id).populate('branchid');
      obj.totalamount = obj.billid ? obj.billid.totalamount : obj.charges;
      req.body.totalamount = obj.charges;
      break;
    case 'bookings':
      obj = await Booking.findById(Id).populate('branchid');
      obj.totalamount = obj.billid ? obj.billid.totalamount : 0;
      req.body.totalamount = obj.charges;
      break;
    case 'challans':
      obj = await Challan.findById(Id).populate('branchid');;
      req.body.totalamount = obj.totalamount;
      break;
    case 'creditdebitnotes':
      obj = await Creditdebitnote.findById(Id).populate('branchid');
      req.body.totalamount = obj.totalamount;
      subdetail.push({ "Total amount": obj.totalamount });
      let str = "Refund amount" ,newobj = {};
      if(obj.creditdebitdetail && obj.creditdebitdetail.method) str += ` (${obj.creditdebitdetail.method})`;
      newobj[str] =  obj.adjustment;
      subdetail.push(newobj)
      break;
    case 'expenses': 
      obj = await Expense.findById(Id).populate('branchid');
      obj.totalamount = obj.amount; 
      req.body.totalamount = obj.totalamount;
      break;
    case 'facilitybookings':
      obj = await Facilitybooking.findById(Id).populate('branchid');      
      obj.totalamount = obj.billid ? obj.billid.totalamount : obj.charges;
      req.body.totalamount = obj.totalamount;
      break;
    case 'joborders':
      obj = await Joborder.findById(Id).populate('branchid');
      req.body.totalamount = obj.totalcost;
      break;
    case 'leaseorders':
      obj = await Leaseorder.findById(Id).populate('branchid');;
      req.body.totalamount = obj.totalcost;
      break;
    case 'payments':
      obj = await Payment.findById(Id).populate('branchid');;
      req.body.paidamount = obj.paidamount;
      subdetail.push({ "Paid amount": obj.paidamount })
      req.body.totalamount = obj.paidamount;      
      if (obj.item.balance > 0)
        subdetail.push({ "Balance amount": obj.item.balance })
      break;
    case 'paymentschedules':
      obj = await Paymentschedule.findById(Id).populate('branchid');;
      req.body.totalamount = obj.totalamount;
      subdetail.push({ "Paid amount": obj.paidamount })
      if (obj.balance > 0)
        subdetail.push({ "Balance amount": obj.balance })
      break;
    case 'purchaserequests':
      obj = await Purchaserequest.findById(Id).populate('branchid');;
      req.body.totalamount = obj.totalamount;
      break;
    case 'purchaseinvoices':
      obj = await Purchaseinvoice.findById(Id)
                      .populate('branchid')
                      .lean({ virtuals: true, autopopulate: true })
      req.body.totalamount = obj.totalamount;
      break;
    case 'purchaseinvoicepayments':
      obj = await Purchaseinvoicepayment.findById(Id)
                      .populate('branchid')
                      .lean({ virtuals: true, autopopulate: true })
      req.body.totalamount = obj.paidamount;
      break;
    case 'purchaseorders':
      obj = await Purchaseorder.findById(Id).populate('branchid');;
      req.body.totalamount = obj.totalamount;
      break;
    case 'quotations':
      obj = await Quotation.findById(Id).populate('branchid');
      req.body.totalamount = obj.totalamount;
      break;
    case 'packagebookings':
      obj = await Packagebooking.findById(Id).populate('branchid');
      req.body.totalamount = obj.totalamount;
      break;
    case 'tourpackages':
      obj = await Tourpackage.findById(Id).populate('branchid');
      req.body.totalamount = obj.totalamount;
      break;
    case 'salesorders':
      obj = await Salesorder.findById(Id).populate('branchid');
      req.body.totalamount = obj.totalamount;
      break;
    case 'support':
      obj = await Support.findById(Id).populate('branchid');
      break;
    case 'formdatas':
      obj = await Formdata.findById(Id).populate('branchid');
      break;
    default:
      // code block
  }
  if (subdetail.length==0) {
    subdetail.push({ "Total amount": obj && obj.totalamount ? obj.totalamount : obj && obj.paidamount ? obj.paidamount : 0 })
  }
  obj["subdetail"] = subdetail;
  var branch = req.body.authkey.branchid;
  
  obj.items = mergeitems(obj);
  //console.log("obj.items", obj.items)
  obj.totalamount = req.body.totalamount ? req.body.totalamount : obj.totalamount;
  req.body.totalamount  = obj.totalamount;
  return obj;

}

function mergeitems(obj) {

  var services = obj.services ? obj.services : [];
  var assets = obj.assets ? obj.assets : [];
  var packages = obj.packages ? obj.packages : [];
  var items = obj.items ? obj.items : [];
  var refids = obj.refid ? [obj.refid] : null;
  var paymentitem = obj.item ? [obj.item] : null;
  var paymentterms = obj.paymentterms ? [obj.paymentterms] : null;
  var itemcount = 0;
  
  if (obj.billid) {
    services = obj.billid.services ? obj.billid.services : [];
    assets = obj.billid.assets ? obj.billid.assets : [];
    items = obj.billid.items ? obj.billid.items : [];
    packages = obj.billid.packages ? obj.billid.packages : [];
    // for Creditnotes
    if (obj.onModelBill && obj.onModelBill=="Paymentschedule"){
      //items = obj.billid.items ? obj.billid.items : [obj.billid]
      var paymentterm = obj.billid.paymentterms;
      var item = {}
      var itemname = {
        itemname: paymentterm.paymentitem.paymentitemname
      }

      item.item = itemname;
      var discount = paymentterm.discount ? paymentterm.discount : 0;
      var taxes = paymentterm.taxes;
      var taxamount = 0
      if (taxes && taxes.length){
        taxes.forEach((tax)=>{
          taxamount += (paymentterm.amount - discount) * tax.amount / 100
        })
      }
      item['quantity'] = 1;
      item['cost'] = paymentterm.amount;
      item['discount'] = discount;
      item['taxamount'] = taxamount ? taxamount : 0;
      item['totalcost'] = paymentterm.amount - discount + taxamount;
      items.push(item);
    }
  }
  else if (obj.purchasebill) {
    items = obj.purchasebill.items ? obj.purchasebill.items : [];
  }
  else if (refids) {
    refids.forEach((refid) => {
      var item = {}
      var itemname = {
        itemname: refid.title
      }
      item.item = itemname;
      refid.discount = refid.discount ? refid.discount : 0;
      refid.taxamount = refid.taxamount ? refid.taxamount : 0;
      item['quantity'] = 1;
      item['cost'] = refid.charges + refid.discount;
      item['discount'] = refid.discount;
      item['taxamount'] = refid.taxamount ? refid.taxamount : 0;
      item['totalcost'] = refid.charges - refid.discount + refid.taxamount;
      items.push(item);
    })
  }
  else if (paymentitem) {
    paymentitem.forEach((payment) => {
      var item = {}
      var itemname = {
        itemname: payment.paymentterms.paymentitem.paymentitemname
      }

      item.item = itemname;
      var discount = payment.paymentterms.discount ? payment.paymentterms.discount : 0;
      obj.taxamount = obj.taxamount ? obj.taxamount : 0;
      item['quantity'] = 1;
      item['cost'] = obj.amount;
      item['discount'] = discount;
      item['taxamount'] = obj.taxamount;
      item['totalcost'] = obj.amount + obj.taxamount - discount;
      items.push(item);
    })
  }
  else if (paymentterms) {
    paymentterms.forEach((paymentterm) => {
      var item = {}
      var itemname = {
        itemname: paymentterm.paymentitem.paymentitemname
      }

      item.item = itemname;
      var discount = paymentterm.discount ? paymentterm.discount : 0;
      var taxes = paymentterm.taxes;
      var taxamount = 0
      if (taxes && taxes.length){
        taxes.forEach((tax)=>{
          taxamount += (paymentterm.amount - discount) * tax.amount / 100
        })
      }
      item['quantity'] = 1;
      item['cost'] = paymentterm.amount;
      item['discount'] = discount;
      item['taxamount'] = taxamount ? taxamount : 0;
      item['totalcost'] = paymentterm.amount - discount + taxamount;
      items.push(item);
    })
  }
  else if (obj.expenseaccount) {  // EXPENSE
    var paymentterm = {}
    var item = {}
      var itemname = {
        itemname: obj.expenseaccount ? obj.expenseaccount.headname : ''
      }
      item.item = itemname;
      item['quantity'] = 1;
      item['cost'] = obj.amount;
      item['discount'] = 0;
      item['taxamount'] = 0;
      item['totalcost'] = obj.amount;
      items.push(item); 
  }

  if (items && items.length > 0)
    items.forEach((item) => {
      if (item.taxamount && item.taxamount > 0) return;
      var taxes = item.taxes;
      var taxamount = 0
      if (taxes && taxes.length){
        taxes.forEach((tax)=>{
          taxamount += item.cost * item.quantity * tax.amount / 100
        })
      }
      item.taxamount = taxamount
      //item['totalcost'] = item.totalcost - item.taxamount;
    })

  services.forEach((service) => {
    var item = {}
    var itemname = {
      itemname: service.refid ? service.refid.title : ''
    }
    item.item = itemname;
    service.discount = service.discount ? service.discount : 0
    service.taxamount = service.taxamount ? service.taxamount : 0
    item['quantity'] = 1;
    item['cost'] = service.cost;
    item['discount'] = service.discount;
    item['taxamount'] = service.taxamount ? service.taxamount : 0;
    item['totalcost'] = service.cost - service.discount + service.taxamount;
    items.push(item);
  })

  assets.forEach((asset) => {
    var item = {}
    var itemname = {
      itemname: asset.refid ? asset.refid.title : ''
    }
    item.item = itemname;
    asset.discount = asset.discount ? asset.discount : 0
    asset.taxamount = asset.taxamount ? asset.taxamount : 0
    item['quantity'] = 1;
    item['cost'] = asset.cost;
    item['discount'] = asset.discount;
    item['taxamount'] = asset.taxamount ? asset.taxamount : 0;
    item['totalcost'] = asset.cost - asset.discount + asset.taxamount;
    items.push(item);
  })


  packages.forEach((itm) => {
    
    let newitem = {}
    newitem = {
      itemname: itm.packageid.membershipname ? itm.packageid.membershipname : ''
    }
    newitem.item = newitem;
    
    itm.discount = itm.discount ? itm.discount : 0
    itm.taxamount = itm.taxamount ? itm.taxamount : 0
    newitem['quantity'] = 1;
    newitem['cost'] = itm.cost;
    newitem['discount'] = itm.discount;
    newitem['taxamount'] = itm.taxamount ? itm.taxamount : 0;
    newitem['totalcost'] = itm.cost - itm.discount + itm.taxamount;
    newitem['property'] =  { bookingids: itm.bookingids , packageid : itm.packageid };
     
    items.push(newitem);
  })

  if (items)
    items.forEach((item) => {
      itemcount += 1;
      item['srno'] = itemcount;
      //console.log("itemcount", itemcount)
    });
    return items;

}

async function viewcalendar(req, res) {
  var data = req.body.data;
  if (!data) data = [];

  var search = req.body.search;
  var newsearch = []
  search.forEach((el)=>{
    if (el.searchfield != "userid") newsearch.push(el)
  })
  req.body.search = newsearch;

  var holidays = await Holidayeventview.filterview(req.body)
  if (holidays.length > 0) {
    data = data.concat(holidays);
  }
  res.json(data)

}

function removecache(req, res, next){
  cache.clear();
  res.json("Cache clear");
}

async function generatepreview(req, res, next) {

  var template = req.body.template; 
  
  var branch = req.body.authkey.branchid;
  var templateid = req.body.templateid;
  var data = req.body.data;
  var totalamount = req.body.totalamount;
  if (totalamount) {
    var inword = toWords.convert(totalamount)
    data.inword = inword;
  }  
  var content;
  if(req.body.preview == 'small'){    
    content = thermalpreviewhtml.gethtml(template, data, branch);
  }else{
    content = previewhtml.gethtml(template, data, branch);
  }
  
  if (req.body.formid) {
    req.body.message = {
      content: content
    }
    next()
  } else {
    return res.json({content : content , thermal : template.template && template.template.thermalheader && template.template.thermalfooter})
  }

}

async function createrazorpaysubscription(req, res)
{

  var token = "rzp_live_eXYxfenpXamf0Q: hXgj2sgjs76XCEXQOhQizDPm"
  let buff = new Buffer(token);
  let tokenid = buff.toString('base64');
  // axios.defaults.headers = {
  //   'Authorization': `Basic ${tokenid}`
  // };
  var header = { 'Authorization': `Basic ${tokenid}` };
  var postdata = {
    "plan_id":"plan_HEZuTx1JaxravB",
    "total_count":6,
    "quantity":1,
    "start_at":1735689600,
    "expire_by":1893456000,
    "customer_notify":1,
    "notes":{
      "Plan":"Membroz Individual Plan",
      "memberid":"5e954c7b9df11624f81e7859"
    }
  }
  var url = "https://api.razorpay.com/v1/subscriptions";
  const https = require("https");

  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  return axios
    .post(url, {
      "plan_id": "plan_HEZuTx1JaxravB",
      "total_count": 6,
      "quantity": 1,
      "start_at": 1735689600,
      "expire_by": 1893456000,
      "customer_notify": 1,
      "notes": {
        "Plan": "Membroz Individual Plan",
        "memberid": "5e954c7b9df11624f81e7859"
      }
    }, {
      auth: {
        username: "rzp_live_eXYxfenpXamf0Q",
        password: "hXgj2sgjs76XCEXQOhQizDPm"
      }
    })
    .then(processdata => {
      return processdata.data;
    })
}

async function updatethumbnail(template) {

  var guid = new ObjectId();
  var imagepath = './uploads/' + guid + '.png'
  const image = await nodeHtmlToImage({
    output: imagepath,
    html: template.content ? template.content : template.property.content
  });
  if (!template.property) template.property = {}

  cloudinary.config({
    cloud_name: 'dlopjt9le',
    api_key: '568643478894827',
    api_secret: 'f2xMa9UMiGuPV2mhTMAKvhEao8g',
    secure: true
  });

  await cloudinary.uploader.upload(imagepath, function (error, result) {
    if (result && result.secure_url)
      template.property.thumbnail = result.secure_url;
    fs.unlink(imagepath, function (err) {
      // if no error, file has been deleted successfully
      console.log('image deleted');
    });
  });

}

async function generateqrcode(req,res, next) {
  const value = req.body.value;
  QRCode.toDataURL(JSON.stringify(value), (err, src) => {
    if (err) {
      console.log("error occurred!");
    }
    res.json(src);
  });
}

async function generatebarcode(req, res, next) {
  var barcode = require('barcode');
  var code39 = barcode('code39', {
    data: "it works",
    width: 400,
    height: 100,
  });

  code39.saveImage("./uploads/barcode.png", function (err) {
    if (err) throw err;

    console.log('File has been written!');
  });
}