const express = require('express');
const asyncHandler = require('express-async-handler');
const formdataCtrl = require('../controllers/formdata.controller');
const commonCtrl = require('../controllers/common.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const appointmentCtrl = require('../controllers/appointment.controller');
const templateCtrl = require('../controllers/template.controller');
const formfieldCtrl = require('../controllers/formfield.controller');
const billitemCtrl = require('../controllers/billitem.controller');
const quotationCtrl = require('../controllers/quotation.controller');
const joborderCtrl = require('../controllers/joborder.controller');
const createHTML = require('../helpers/createHTML');
const router = express.Router();
module.exports = router;
import async from "async";

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(
    asyncHandler(validateuniquefieldvalue),
    asyncHandler(validatedata), 
    asyncHandler(formdataCtrl.convertdatatype), 
    asyncHandler(insert),
    asyncHandler(formdataCtrl.workshopupdate)
  )

router.route('/workflow/:Id')
  .post(asyncHandler(populateobject), asyncHandler(updateobject))

router.route('/:Id')
  .put(asyncHandler(validateuniquefieldvalue), asyncHandler(validatedata), asyncHandler(formdataCtrl.convertdatatype), asyncHandler(update))
  .patch(asyncHandler(formdataCtrl.convertdatatype), asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), asyncHandler(populatefield), commonCtrl.exportcsv)

router.route('/search/')
  .post(asyncHandler(filter), commonCtrl.deepobjectsearch_like);

router.route('/view/filter')
  .post(asyncHandler(findcount), asyncHandler(viewfilter), commonCtrl.exportcsv)

router.route('/generatehtml')
  .post(asyncHandler(populateobject), asyncHandler(populatefield), createHTML.getworkshophtml)

router.route('/converttoquotation/:Id')
  .post(
    asyncHandler(formdataCtrl.convertdatatype), 
    asyncHandler(update), 
    asyncHandler(populateproductandservices), 
    asyncHandler(quotationCtrl.getnextdocnumber), 
    asyncHandler(quotationCtrl.converttoquotation), 
    asyncHandler(formdataCtrl.workshopupdate)
  )

router.route('/converttojoborder/:Id')
  .post(
    asyncHandler(formdataCtrl.convertdatatype), 
    asyncHandler(update),  
    asyncHandler(populateproductandservices), 
    asyncHandler(joborderCtrl.getnextdocnumber), 
    asyncHandler(joborderCtrl.converttojoborder), 
    asyncHandler(formdataCtrl.workshopupdate)
  )

router.route('/workshopupdate')
  .post(asyncHandler(formdataCtrl.workshopupdate));


router.route('/removeall')
  .post(asyncHandler(removeall))

  
router.route('/synsuprauser')
  .post(asyncHandler(synsuprauser))
  
  
async function synsuprauser(req, res, next) {
  let formdata = await formdataCtrl.synsuprauser(req);
  res.json(formdata)
}

async function validateuniquefieldvalue(req, res, next) {
  let formdata = await commonCtrl.validateuniquefieldvalue(req);
  if (!formdata) next()
  else {    
    throw new Error(req.body.error)
  }
}

async function findbytype(req, res, next) {


  let formdata;
  let formfield;
  var formname = req.body.formname;
  req.body.search = [{ "searchfield": "templatetype", "searchvalue": formname, "datatype": "text", "criteria": "eq" }];
  req.body.formname = 'template'
  var template = await templateCtrl.filter(req.body);

  if (template && template.length > 0) {
    req.body.template = template[0];
  }

  formdata = await formdataCtrl.findbyId(req.body.id);
  req.body.formdata = formdata;

  formfield = await formfieldCtrl.getworkshopformfields(req, formdata.formid.formname)
  if (formfield && formfield.length > 0) {

    formfield.forEach(element => {
      if (element.fields && element.fields.length > 0) {
        element.fields.forEach(async field => {
          if (field.fieldtype == "product") {

            var productids = formdata['property'][element.fieldname][field.fieldname];
            req.body.search = [];
            req.body.search.push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
            req.body.search.push({ "searchfield": "_id", "searchvalue": productids, "criteria": "in" });

            var productLists = await billitemCtrl.filterview(req.body);

            //console.log("productLists", productLists);

            field.value = "";
            if (productLists && productLists.length > 0) {
              productLists.forEach(elementProduct => {
                // req.body.products.push(elementProduct)
                //console.log(elementProduct)
                field.value += elementProduct.itemname + ','
              });
            }

            // console.log("field", field.value)


          }
        });
      }

    });

  }
  req.body.formfield = formfield;

  next();

}

async function populatefield(req, res, next) {

  let formdatas = await formdataCtrl.populatefield(req);

  if (req.body.export) {
    req.body.data = formdatas;
    req.body.search = [{ "searchfield": "templatetype", "searchvalue": req.body.formname, "datatype": "text", "criteria": "eq" }];
    req.body.formname = 'template'
    var template = await templateCtrl.filter(req.body);

    if (template && template.length > 0) {
      req.body.template = template[0];
    }
    //console.log("template", template)
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = formdatas;
    next()
  }
  else res.json(formdatas);

}

async function populateobject(req, res, next) {

  var id = req.params.Id ? req.params.Id : req.body.id;
  let formdata = await formdataCtrl.findbyId(id);

  req.body.formdata = formdata;

  if (req.body.export) {
    req.body.data = [formdata];
  } else {
    req.body.data = formdata;
  }

  next();
}

async function populateproductandservices(req, res, next) {
  let formdatas = await formdataCtrl.populateproductandservices(req);
  next()
}

// async function updateInspection(req, res) {

//   let formdata = await formdataCtrl.updateInspetion(req);
//   return res.json(formdata)
// }

async function findbyId(req, res) {
  let formdata = await formdataCtrl.findbyId(req.params.Id);
  res.json(formdata);
}

async function insert(req, res, next) {
  let formdata = await formdataCtrl.insert(req);  
  if (!req.body.convert) return res.json(formdata);
  else {
    req.body.inspectionid = formdata._id;
    next();
  }
}

async function validatedata(req, res, next) {
  req.body.formid = req.body.formid ? req.body.formid : "614c3bdefabdbd1eb81541dc";
  await formdataCtrl.validatedata(req, res, next);
}

async function patch(req, res) {
  let formdata = await formdataCtrl.patch(req.params.Id, req);
  res.json(formdata);
}

async function update(req, res, next) {
  let formdata = await formdataCtrl.update(req.params.Id, req);
  if (!req.body.convert) return res.json(formdata);
  else next();
}

async function remove(req, res) {
  let formdata = await formdataCtrl.remove(req.params.Id, req);
  res.json(formdata);
}

async function removeall(req, res) {
  let formdata = await formdataCtrl.removeall(req.body);
  res.json(formdata);
}

async function findcount(req, res, next) {
  if (req.body.size) {

    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }

    await formdataCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {
  req.body.formname = req.body.formname ? req.body.formname : "formdata";
  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }
  let formdatas = await formdataCtrl.filter(req.body);
  req.body.data = formdatas;
  next()
}

async function viewfilter(req, res, next) {

  req.body.formname = req.body.formname ? req.body.formname : "formdata";
  var viewname = req.body.viewname;
  let formdatas;

  if (viewname) {
    formdatas = await commonCtrl.viewfilter(req, res);
  }
  // else {
  //   formdatas = await formdataCtrl.viewfilter(req.body);
  // }
  if (req.body.export) {
    req.body.data = formdatas
    next()
  }  
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = formdatas;
    next()
  }
  else res.json(formdatas);
}

async function updateobject(req, res, next) {

  var formdata = req.body.formdata;
  var wfstatus = req.body.wfstatus;

  if (wfstatus == "Approved") {
    var object = await commonCtrl.approveupdate(formdata, req)
    res.json(object);
  }
  else if (wfstatus == "Declined") {
    var prop = formdata.property;
    prop["declinereason"] = req.body.declinereason;
    formdata.property = prop;
    formdata.status = "Declined";
    await formdata.save(req)
    res.json(formdata)
  }
}
