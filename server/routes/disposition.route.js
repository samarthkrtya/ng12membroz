const express = require('express');
const asyncHandler = require('express-async-handler');
const dispositionCtrl = require('../controllers/disposition.controller');
const commonCtrl = require('../controllers/common.controller');
const roleCtrl = require('../controllers/role.controller');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(update))
  .patch(asyncHandler(patch))
  .get(asyncHandler(findbyId))
  .delete(asyncHandler(remove))

router.route('/filter')
.post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

async function findbyId(req, res) {
  let disposition = await dispositionCtrl.findbyId(req.params.Id);
  res.json(disposition);
}

async function insert(req, res, next) {
  let disposition = await dispositionCtrl.insert(req);
  res.json(disposition);
  // req.body.disposition = disposition;
  // next();
}

async function updatepermission(req, res) {
  req.body.dispositionpermission = req.body.disposition._id;
  var roleid = req.body.authkey.role._id
  await roleCtrl.patch(roleid, req);
  res.json(req.body.disposition);
}

async function removepermission(req, res) {
  var roleid = req.body.authkey.role._id
  var dispositionpermissions = req.body.authkey.role.dispositionpermissions
  var filtered = dispositionpermissions.filter(dispositionpermission => {
    return dispositionpermission._id.toString() !== req.params.Id.toString();
  });
  req.body.dispositionpermissions = filtered;
  await roleCtrl.patch(roleid, req);
  res.json(req.body.disposition);
}

async function update(req, res) {
  let disposition = await dispositionCtrl.update(req.params.Id, req);
  res.json(disposition);
}

async function patch(req, res) {
  let disposition = await dispositionCtrl.patch(req.params.Id, req);
  res.json(disposition);
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "disposition";
  let dispositions = await dispositionCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = dispositions
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = dispositions
    next()
  }
  else res.json(dispositions);
}

async function remove(req, res, next) {
  let disposition = await dispositionCtrl.remove(req.params.Id, req);
  res.json(disposition);
  // req.body.disposition = disposition;
  // next();
}

async function findcount(req, res, next) {
  if (req.body.size){
    await dispositionCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

