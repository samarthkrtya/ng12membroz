const express = require('express');
const asyncHandler = require('express-async-handler');
const importCtrl = require('../controllers/import.controller');
const formCtrl = require('../controllers/form.controller');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/import-excel')
.post(importCtrl.downloadfile, asyncHandler(importCtrl.getjoivalidator), importCtrl.importdata);

router.route('/check-excel')
  .post(importCtrl.downloadfile, asyncHandler(importCtrl.getjoivalidator), importCtrl.validatedata);

  //, asyncHandler(importCtrl.validatedata)

router.route('/get-headings')
  .post(importCtrl.downloadfile, asyncHandler(formCtrl.getformschema), importCtrl.getheadings);

router.route('/get-alldata')
  .post(importCtrl.downloadfile, asyncHandler(importCtrl.getalldata));

