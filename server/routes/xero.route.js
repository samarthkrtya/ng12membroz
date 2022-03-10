const express = require('express');
const asyncHandler = require('express-async-handler');
const xeroCtrl = require('../controllers/xero.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

// Get Requests
router.get("/connect/url", xeroCtrl.getConnectURL);
router.get("/xerocallback", xeroCtrl.xerocallback);
router.post("/checktoken", xeroCtrl.checkToken);
router.post("/savetoken", xeroCtrl.saveToken);
//router.post("/create/employee", xeroCtrl.createEmployee);
router.post("/create/timesheet", xeroCtrl.createTimesheet);
router.post("/create/payrollcalendar", xeroCtrl.createPayrollCalendar);
router.get("/disconnect/", xeroCtrl.disConnect);

//router.use(errCtrl.customError);
//module.exports = { xeroRoute };
