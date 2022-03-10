const express = require('express');
const asyncHandler = require('express-async-handler');
const memberCtrl = require('../controllers/member.controller');
const formfieldCtrl = require('../controllers/formfield.controller');
const paymentscheduleCtrl = require('../controllers/paymentschedule.controller');
const commonCtrl = require('../controllers/common.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const formdataCtrl = require('../controllers/formdata.controller');
const formlistCtrl = require('../controllers/formlist.controller');
const prospectCtrl = require('../controllers/prospect.controller');
const enquiryCtrl = require('../controllers/enquiry.controller');
const paymentCtrl = require('../controllers/payment.controller');
const preprocess = require('../middleware/preprocess');
const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
  .post(asyncHandler(convertdatatype), asyncHandler(validatedata), asyncHandler(preprocess.processMember), asyncHandler(insert))

router.route('/:Id')
  .put(asyncHandler(convertdatatype), asyncHandler(update))
  .patch(asyncHandler(patch))
  .delete(asyncHandler(remove))
  .get(asyncHandler(findbyId))

// router.route('/viewprofile/:Id')
//   .get(asyncHandler(viewprofile))

router.route('/filter')
  .post(asyncHandler(findcount), asyncHandler(filter), commonCtrl.exportcsv)

router.route('/filter/view')
  .post(asyncHandler(filterformlist), asyncHandler(filterview))

router.route('/filter/activity/view')
  .post(asyncHandler(acivityfilterview))

router.route('/filter/communication/view')
  .post(asyncHandler(communicationfilterview))

router.route('/filter/timeline/view')
  .post(asyncHandler(timelinefilterview))

router.route('/filter/wallet/view')
  .post(asyncHandler(walletfilterview), commonCtrl.exportcsv)

router.route('/filter/usagesummary/view')
  .post(asyncHandler(usagesummaryview))

router.route('/viewcalendar/filter')
  .post(asyncHandler(viewcalendar), asyncHandler(commonCtrl.viewcalendar))

router.route('/viewprofile/:formname/:Id')
.get(asyncHandler(viewprofile), asyncHandler(getformfields))


router.route('/search/')
  .post(asyncHandler(filter),  commonCtrl.deepobjectsearch_like);

router.route('/paymentterms')
//, asyncHandler(paymentscheduleCtrl.checkpaidterms), asyncHandler(paymentscheduleCtrl.createpaymentschedule), asyncHandler(paymentscheduleCtrl.cleanschedule)
  .post(asyncHandler(memberCtrl.updatepaymentterms), asyncHandler(paymentscheduleCtrl.getnextdocnumber), asyncHandler(paymentscheduleCtrl.createpaymentschedule));

router.route('/updatemembership')
  //, asyncHandler(paymentscheduleCtrl.checkpaidterms), asyncHandler(paymentscheduleCtrl.createpaymentschedule), asyncHandler(paymentscheduleCtrl.cleanschedule)
    .post(asyncHandler(memberCtrl.updatepaymentterms), asyncHandler(paymentscheduleCtrl.getnextdocnumber), asyncHandler(paymentscheduleCtrl.createpaymentschedule));

router.route('/updatepackages')
  //, asyncHandler(paymentscheduleCtrl.checkpaidterms), asyncHandler(paymentscheduleCtrl.createpaymentschedule), asyncHandler(paymentscheduleCtrl.cleanschedule)
    .post(asyncHandler(memberCtrl.updatepackages), asyncHandler(paymentscheduleCtrl.getnextdocnumber), asyncHandler(paymentscheduleCtrl.createpaymentschedule));

router.route('/payment')
  .post(asyncHandler(
    memberCtrl.createpaymentterms), 
    asyncHandler(paymentscheduleCtrl.getnextdocnumber), 
    asyncHandler(paymentscheduleCtrl.createpaymentschedule)
  );

router.route('/changepassword')
    .post(memberCtrl.updateuserpassword);

router.route('/updatemembers')
    .post(memberCtrl.updatemembers);

router.route('/converttomember/:prospectid')
  .put(asyncHandler(preprocess.processMember), asyncHandler(prospectCtrl.getprospect), 
    asyncHandler(memberCtrl.converttomember), asyncHandler(paymentscheduleCtrl.getnextdocnumber), asyncHandler(paymentscheduleCtrl.createpaymentschedule));

router.route('/enquiryconverttomember/:enquiryid')
  .put(
    asyncHandler(preprocess.processMember), 
    asyncHandler(enquiryCtrl.getEnquiry), 
    asyncHandler(memberCtrl.enquiryconverttomember)
  );
  

async function getformfields(req, res) {
  var formname = req.params.formname;
  let fields = await formfieldCtrl.getformfields(req, formname);
  res.json(fields);
}

async function viewprofile(req, res, next) {
  let member = await memberCtrl.viewprofile(req.params.Id);
  req.body.profile = member;
  next()
}

async function findbyId(req, res) {
  let member = await memberCtrl.findbyId(req.params.Id);
  res.json(member);
}

async function validatedata(req, res, next) {
  req.body.formid = "599673a925f548d7dbbd7c86";
  await formdataCtrl.validatedata(req, res, next);
}

async function convertdatatype(req, res, next) {
  req.body.formid = "599673a925f548d7dbbd7c86";
  await formdataCtrl.convertdatatype(req, res, next);
}

async function insert(req, res) {
  let member = await memberCtrl.insert(req);
  res.json(member);
}

async function update(req, res) {
  let member = await memberCtrl.update(req.params.Id, req);
  res.json(member);
}

async function patch(req, res) {
  let member = await memberCtrl.patch(req.params.Id, req);
  res.json(member);
}

async function remove(req, res) {
  let member = await memberCtrl.remove(req.params.Id, req);
  res.json(member);
}

async function findcount(req, res, next) {
  if (req.body.size){
    if (req.body.webpartid) {
      let ids = await dashboardCtrl.webpartfilter(req);
      req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
    }
    await memberCtrl.findcount(req);
    res.header("access-control-expose-headers", "error, totalPages, totalCount");
    res.setHeader("error", req.header.error);
    res.setHeader("totalPages", req.header.totalPages);
    res.setHeader("totalCount", req.header.totalCount);
    next();
  }
  else next()
}

async function filter(req, res, next) {

  if (req.body.webpartid) {
    let ids = await dashboardCtrl.webpartfilter(req);
    req.body.search = [{ "searchfield": "_id", "searchvalue": ids, "datatype": "ObjectId", "criteria": "in" }]
  }

  req.body.formname = req.body.formname? req.body.formname: "member";
  let members = await memberCtrl.filter(req.body);
  if (req.body.export) {
    req.body.data = members;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = members;
    next()
  }
  else res.json(members);
}

async function filterview(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "member";
  let members = await memberCtrl.filterview(req.body);

  members.forEach(element => {

    // ADDING DYNAMIC FORMDATA into array like measurement, lab reports
    var dynamicforms = element.dynamicforms;
    var formlists = req.body.formlist;
    dynamicforms.forEach(function (form) {

      var formlist = formlists.find((e) => e.formname == form.formname)

      if (formlist && formlist.selectfields && formlist.selectfields.length > 0) {

        var fields = formlist.selectfields;
        var columns = [], newdata = []
        var data = form.data;

        fields.forEach(function (el) {
          columns.push(el.displayname)
        });

        data.forEach(function (dataobj) {
          var obj = {
            _id: dataobj._id
          }
          fields.forEach(function (el) {
            var fieldname = el.fieldname.split(".")
            if (fieldname[1])
            obj[el.displayname] = dataobj.property[fieldname[1]];
            else
            obj[el.displayname] = dataobj[fieldname[0]];
          });
          newdata.push(obj)
        })

        columns.push("Action");
        form["columns"] = columns;
        form.data = newdata
      }

    })

  });
  res.json(members);
}

async function filterformlist(req, res, next) {
  let formlist = await formlistCtrl.filterformlist(req.body);
  req.body.formlist = formlist
  next();
}


async function viewcalendar(req, res, next) {
  req.body.formname = req.body.formname? req.body.formname: "member";
  let appointments = await memberCtrl.viewcalendar(req.body);
  req.body.data = appointments;
  next();
}

async function walletfilterview(req, res, next) {
  let wallet = await memberCtrl.walletfilterview(req.body);
  if (req.body.export) {
    req.body.data = wallet;
    next()
  }
  else if (req.body.searchtext && !Array.isArray(req.body.searchtext)){
    req.body.data = wallet;
    next()
  }
  else res.json(wallet);
}

async function acivityfilterview(req, res, next) {
  let timelines = await memberCtrl.acivityfilterview(req.body);
  res.json(timelines);
}

async function communicationfilterview(req, res, next) {
  let logs = await memberCtrl.communicationfilterview(req.body);
  res.json(logs);
}

async function timelinefilterview(req, res, next) {
  let timelines = await memberCtrl.timelinefilterview(req.body);
  res.json(timelines);
}

async function usagesummaryview(req, res, next) {
  let usagesummary = await memberCtrl.usagesummaryview(req.body);
  res.json(usagesummary);
}
