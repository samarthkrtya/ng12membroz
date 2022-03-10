const express = require('express');
const asyncHandler = require('express-async-handler');
const commonCtrl = require('../controllers/common.controller');
const formfieldoptionCtrl = require('../controllers/formfieldoption.controller');
const formfieldCtrl = require('../controllers/formfield.controller');
const templateCtrl = require('../controllers/template.controller');
const communicationCtrl = require('../controllers/communication.controller');
import global from '../config/global';

const router = express.Router();
module.exports = router;

router.route('/')
  .post(asyncHandler(commonCtrl.getbycollection))

router.route('/schemas/:formname')
   .get(asyncHandler(formfieldoptionCtrl.getschema), formfieldCtrlschema)
  // .post(asyncHandler(formfieldoptionCtrl.getschema), formfieldCtrlschema);

router.route('/formfields/:formname')
  .post(asyncHandler(formfieldoptionCtrl.getschema), formfieldCtrlschema);

router.route('/generatepdf')
   .post(asyncHandler(commonCtrl.generatepdf))

router.route('/massupdate')
  .post(commonCtrl.massupdate)

router.route('/rfidmapping')
  .post(commonCtrl.getrfidmapping)

router.route('/contacts/filter')
  .post(asyncHandler(contactfilterview))

router.route('/updatestatus')
  .post(commonCtrl.updatestatus)

router.route('/updatewfstatus')
  .post(commonCtrl.updatewfstatus)

router.route('/generatehtml/:Id')
  .post(asyncHandler(getdoctemplate), commonCtrl.generatepreview, commonCtrl.getmessagetemplate)

router.route('/viewcalendar/filter')
  .post(asyncHandler(commonCtrl.viewcalendar))

router.route('/clone')
  .post(commonCtrl.clone)

router.route('/updatefields')
  .post(commonCtrl.updatefields)
 
router.route('/kickoffworkflow')
  .post(asyncHandler(commonCtrl.kickoffworkflow)) 

router.route('/checkandaddpermissions')
  .post(asyncHandler(commonCtrl.checkandupdatepermissions))

router.route('/generateindexscript')
  .get(asyncHandler(commonCtrl.generateindexscript))

router.route('/generateindex')
  .get(asyncHandler(commonCtrl.generateindex))
  
router.route('/connecttocall')
  .get(asyncHandler(commonCtrl.connecttocall))
  .post(asyncHandler(commonCtrl.connecttocall))

router.route('/loadglobalsetting')
  .get(asyncHandler(loadglobalsetting))

router.route('/generateqrcode')
  .post(asyncHandler(commonCtrl.generateqrcode))

router.route('/generatebarcode')
  .post(asyncHandler(commonCtrl.generatebarcode))

async function loadglobalsetting(req, res, next) {  
  global.loadGlobal();
  res.json({});
}

async function contactfilterview(req, res, next) {
  req.body.formname = 'contact'
  let members = await commonCtrl.contactfilterview(req.body);
  res.json(members);
}

async function formfieldCtrlschema(data, req, res, next){
    let fields = await formfieldCtrl.getschema(data, req);
    res.json(fields)

}

async function getdoctemplate(req, res, next) {

  var formname = req.body.formname;
  req.body.search = [{ "searchfield": "templatetype", "searchvalue": formname, "datatype": "text", "criteria": "eq" }];
  req.body.formname = 'template'
  var template = await templateCtrl.filter(req.body);
  req.body.template = template[0];
  let object = await commonCtrl.getobjectbyId(req.params.Id, req);
  req.body.data = object;
  next()

}
