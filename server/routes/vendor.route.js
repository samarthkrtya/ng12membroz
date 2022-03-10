const express = require('express');
const asyncHandler = require('express-async-handler');
const vendorCtrl = require('../controllers/vendor.controller');
const commonCtrl = require('../controllers/common.controller');
const router = express.Router();
module.exports = router;

router.route('/')
    .post(asyncHandler(insert))

router.route('/:Id')
    .put(asyncHandler(update))
    .patch(asyncHandler(patch))
    .delete(asyncHandler(remove))
    .get(asyncHandler(findbyId))

router.route('/filter')
    .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/search/')
    .post(asyncHandler(filter), commonCtrl.deepobjectsearch_like);

router.route('/view/filter')
    .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/filter/activity/view')
    .post(asyncHandler(acivityfilterview))

router.route('/filter/communication/view')
    .post(asyncHandler(communicationfilterview))

router.route('/filter/timeline/view')
    .post(asyncHandler(timelinefilterview))

async function findbyId(req, res) {
    let saleschannelteam = await vendorCtrl.findbyId(req.params.Id);
    res.json(saleschannelteam);
}

async function insert(req, res) {
    let saleschannelteam = await vendorCtrl.insert(req);
    res.json(saleschannelteam);
}

async function patch(req, res, next) {
    let vendor = await vendorCtrl.patch(req.params.Id, req);
    res.json(vendor);
}

async function update(req, res) {
    let saleschannelteam = await vendorCtrl.update(req.params.Id, req);
    res.json(saleschannelteam);
}

async function remove(req, res) {
    let saleschannelteam = await vendorCtrl.remove(req.params.Id, req);
    res.json(saleschannelteam);
}

async function findcount(req, res, next) {
    if (req.body.size) {

        await vendorCtrl.findcount(req);
        res.header("access-control-expose-headers", "error, totalPages, totalCount");
        res.setHeader("error", req.header.error);
        res.setHeader("totalPages", req.header.totalPages);
        res.setHeader("totalCount", req.header.totalCount);
        next();
    }
    else next()
}

async function filter(req, res, next) {
    req.body.formname = req.body.formname ? req.body.formname : "vendor";
    let vendors = await vendorCtrl.filter(req.body);
    if (req.body.export) {
        req.body.data = vendors
        next()
    }
    else if (req.body.search && !Array.isArray(req.body.search)) {
        req.body.data = vendors
        next()
    }
    else res.json(vendors);
}

async function viewfilter(req, res, next) {
    req.body.formname = req.body.formname ? req.body.formname : "vendor";
    var viewname = req.body.viewname;
    let vendors;
    if (viewname) {
        vendors = await commonCtrl.viewfilter(req, res);
    }
    else {
        vendors = await vendorCtrl.viewfilter(req.body);
    }

    if (req.body.export) {
        req.body.data = vendors
        next()
    }
    else if (req.body.searchtext && !Array.isArray(req.body.searchtext)) {
        req.body.data = vendors
        next()
    }
    else res.json(vendors);
}

async function acivityfilterview(req, res, next) {
    let timelines = await vendorCtrl.acivityfilterview(req.body);
    res.json(timelines);
}

async function communicationfilterview(req, res, next) {
    let logs = await vendorCtrl.communicationfilterview(req.body);
    res.json(logs);
}

async function timelinefilterview(req, res, next) {
    let timelines = await vendorCtrl.timelinefilterview(req.body);
    res.json(timelines);
}