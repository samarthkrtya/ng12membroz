const Joi = require('joi');
const Branch = require('../models/branch.model');
const User = require('../models/user.model');
const Formdata = require('../models/formdata.model');
const Branchview = require('../views/branch.view');
const Membrozsubscriptionview = require('../views/membrozsubscription.view');
const clm = require('country-locale-map');
var getCountry = require("country-currency-map").getCountry;

import sendinblue from '../helpers/sendinblue';
import countryTimezone from 'country-timezone';

const QRCode = require('qrcode')

const branchSchema = Joi.object({
  branchname: Joi.string().required(),
  branchlogo: Joi.string().allow(null),
  startingnumber: Joi.string(),
  startingusernumber: Joi.string(),
  support: Joi.object(),
  currency: Joi.string(),
  workinghours: Joi.object(),
  iswalletenable: Joi.boolean(),
  isqrenable: Joi.boolean(),
  qrcode: Joi.string(),
  iswebqrenable: Joi.boolean(),
  webqrcode: Joi.string(),
  vatnumber: Joi.string(),
  companyphone: Joi.string(),
  contactperson: Joi.string(),
  supportemail: Joi.string(),
  supportnumber: Joi.number(),
  paymentmethods: Joi.array(),
  address: Joi.string(),
  postcode: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string(),
  locale: Joi.string(),
  dateformat: Joi.string(),
  timezone: Joi.string(),
  loyalitysettings: Joi.object(),
  property: Joi.object(),
  cancellationpolicy: Joi.object(),
  appointmentsetting: Joi.object(),
  paymentsetting: Joi.object(),
})

module.exports = {
  insert,
  update,
  patch,
  remove,
  filter,
  filterview,
  membrozsubscriptionview,
  createcontact,
  findcount,
  findbyId,
  exportdata,
  freeplansetup,
  generateqrcode,
  generatewebqrcode
}

async function findbyId(Id) {
  return await Branch.findById(Id);
}

async function insert(req) {

  var startingusernumber = req.body.branchname;
  if (startingusernumber.length >= 5)
    startingusernumber = startingusernumber.substring(0, 5).toUpperCase() + 10001
  else
    startingusernumber = startingusernumber.toUpperCase() + 10001

  if (req.body.branchlogo && Array.isArray(req.body.branchlogo) && req.body.branchlogo[0]) {
    req.body.branchlogo = req.body.branchlogo[0].attachment ? req.body.branchlogo[0].attachment : null
  }
  else req.body.branchlogo = null;
  var branch = {
    branchname: req.body.branchname,
    branchlogo: req.body.branchlogo,
    startingnumber: req.body.startingnumber ? req.body.startingnumber : startingusernumber,
    startingusernumber: startingusernumber,
    support: req.body.support,
    currency: req.body.currency,
    workinghours: req.body.workinghours,
    iswalletenable: req.body.iswalletenable,
    isqrenable: req.body.isqrenable,
    qrcode: req.body.qrcode,
    iswebqrenable: req.body.iswebqrenable,
    webqrcode: req.body.webqrcode,
    vatnumber: req.body.vatnumber,
    dateformat: req.body.dateformat,
    companyphone: req.body.companyphone,
    contactperson: req.body.contactperson,
    supportemail: req.body.supportemail,
    supportnumber: req.body.supportnumber,
    address: req.body.address,
    postcode: req.body.postcode,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    locale: req.body.locale,
    timezone: req.body.timezone,
    property: req.body.property,
    cancellationpolicy: req.body.cancellationpolicy,
    appointmentsetting: req.body.appointmentsetting,
    paymentsetting: req.body.paymentsetting
  }
  branch = await Joi.validate(branch, branchSchema, { abortEarly: false });
  return await new Branch(branch).save(req);

}

async function patch(Id, req) {
  var branch = await Branch.findById(Id);
  branch._original = branch.toObject();
  if (req.body.license) branch.license = req.body.license;
  if (req.body.dateformat) branch.dateformat = req.body.dateformat;
  if (req.body.workinghours) branch.workinghours = req.body.workinghours;
  if (req.body.contactperson) branch.contactperson = req.body.contactperson;
  if (req.body.branchname) branch.branchname = req.body.branchname;
  if (req.body.billingemail) branch.billingemail = req.body.billingemail;
  if (req.body.address) branch.address = req.body.address;
  if (req.body.postcode) branch.postcode = req.body.postcode;
  if (req.body.city) branch.city = req.body.city;
  if (req.body.country) branch.country = req.body.country;
  if (req.body.locale) branch.locale = req.body.locale;
  if (req.body.paymentmethod) branch.paymentmethods.push(req.body.paymentmethod);
  if (req.body.paymentmethods) branch.paymentmethods = req.body.paymentmethods;
  if (req.body.loyalitysettings) branch.loyalitysettings = req.body.loyalitysettings;
  if (req.body.property) branch.property = req.body.property;

  if (req.body.cancellationpolicy) branch.cancellationpolicy = req.body.cancellationpolicy;
  if (req.body.appointmentsetting) branch.appointmentsetting = req.body.appointmentsetting;
  if (req.body.paymentsetting) branch.paymentsetting = req.body.paymentsetting;

  return await branch.save(req);
}

async function update(Id, req) {
  var branch = await Branch.findById(Id);
  branch._original = branch.toObject();
  if (req.body.branchlogo && Array.isArray(req.body.branchlogo)) {
    req.body.branchlogo = req.body.branchlogo[0] && req.body.branchlogo[0].attachment ? req.body.branchlogo[0].attachment : null
  }

  branch.branchname = req.body.branchname,
    branch.branchlogo = req.body.branchlogo,
    branch.startingnumber = req.body.startingnumber,
    branch.support = req.body.support,
    branch.currency = req.body.currency,
    branch.workinghours = req.body.workinghours,
    branch.iswalletenable = req.body.iswalletenable,
    branch.dateformat = req.body.dateformat,
    branch.isqrenable = req.body.isqrenable,
    branch.qrcode = req.body.qrcode,
    branch.iswebqrenable = req.body.iswebqrenable,
    branch.webqrcode = req.body.webqrcode,
    branch.vatnumber = req.body.vatnumber,
    branch.companyphone = req.body.companyphone,
    branch.contactperson = req.body.contactperson,
    branch.supportemail = req.body.supportemail,
    branch.supportnumber = req.body.supportnumber,
    branch.address = req.body.address,
    branch.postcode = req.body.postcode,
    branch.city = req.body.city,
    branch.state = req.body.state,
    branch.country = req.body.country,
    branch.locale = req.body.locale,
    branch.timezone = req.body.timezone,
    branch.breaktime = req.body.breaktime,
    branch.property = req.body.property,
    branch.cancellationpolicy = req.body.cancellationpolicy,
    branch.appointmentsetting = req.body.appointmentsetting
    branch.paymentsetting = req.body.paymentsetting

  return await branch.save(req);
}

async function remove(Id, req) {
  var branch = await Branch.findById(Id);
  branch.status = "deleted"
  return await branch.save(req);
}

async function filter(params) {
  return await Branch.getbyfilter(params)
}

async function filterview(params) {
  return await Branchview.getfilterview(params)
}

async function findcount(req) {
  return await Branch.findcount(req)
}

async function exportdata(params) {
  return await Branch.exportdata(params)
}

async function membrozsubscriptionview(params) {
  return await Membrozsubscriptionview.getfilterview(params)
}

async function createcontact(req, res, next) {
  getUserrole(req);
  var contact = req.body.contact;
  var prop = contact.property;
  prop['listid'] = req.body.listid;
  contact.property = prop;
  sendinblue.createContact(contact);
  res.json(contact);
}

async function freeplansetup(req, res, next) {

  var solutiontype = req.body.solutiontype;
  var prefix = req.body.branchname;
  prefix = prefix.replace(/ /g, "");
  if (prefix.length > 5) prefix = prefix.substring(0, 5);
  var threedigitsrandom = Math.floor(100 + Math.random() * 900);
  prefix += "-" + threedigitsrandom;

  var docformat = {
    "appointment": {
      "prefix": prefix
    },
    "bill": {
      "prefix": prefix
    },
    "billpayment": {
      "prefix": prefix
    },
    "booking": {
      "prefix": prefix
    },
    "challan": {
      "prefix": prefix
    },
    "creditnote": {
      "prefix": prefix
    },
    "expense": {
      "prefix": prefix
    },
    "facility": {
      "prefix": prefix
    },
    "joborder": {
      "prefix": prefix
    },
    "journal": {
      "prefix": prefix
    },
    "journalledger": {
      "prefix": prefix
    },
    "leaseorder": {
      "prefix": prefix
    },
    "payment": {
      "prefix": prefix
    },
    "invoice": {
      "prefix": prefix
    },
    "purchaseinvoice": {
      "prefix": prefix
    },
    "popayment": {
      "prefix": prefix
    },
    "purchaseorder": {
      "prefix": prefix
    },
    "purchaserequest": {
      "prefix": prefix
    },
    "quotation": {
      "prefix": prefix
    },
    "salesorder": {
      "prefix": prefix
    },
    "support": {
      "prefix": prefix
    }

  }
  // Academy, Preschool & Daycare
  // Apartment, Equipment & Car Rental
  // Club, Resort & Hotel
  // Community, Association & Society
  // Housing & Commercial Complex
  // Consulting & Coaching Service
  // Dietician & Nutritionist
  // Doctor Clinic & Polyclinic
  // Finance, Insurance & Law
  // Gym, Yoga & Fitness Center
  // Restaurant, Pubs & Bar
  // Service, Workshop & Maintenance
  // Spa, Salon & Wellness Center
  // Tour & Travel
  // Tour, Travel & Timeshare
  // Venue & Facility Booking

  getUserrole(req);
  var country = req.body.property.country;
  var timezonesWithCountryName = countryTimezone.getTimezones(country);
  var localeWithCountryName = clm.getLocaleByName(country);
  localeWithCountryName = localeWithCountryName.replace("_", "-");
  var currency = getCountry(country);

  //console.log("req.body.listid", req.body.listid)
  var prop = {
    fullname: req.body.property.fullname,
    country: req.body.property.country,
    primaryemail: req.body.property.email,
    mobile: req.body.property.mobile_number,
    listid: req.body.listid
  }
  var validateuser = await User.findOne({ "property.primaryemail": prop.primaryemail });
  if (validateuser) return res.json("Email is already register with us. Please login with your userid");

  const branch = new Branch({
    branchname: req.body.branchname,
    supportemail: prop.primaryemail,
    supportnumber: prop.mobile,
    startingnumber: prefix.toUpperCase() + "10000",
    startingusernumber: prefix.toUpperCase() + "10000",
    workinghours: {
      "starttime": "08:00:00",
      "endtime": "18:00:00",
      "days": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ]
    },
    //branchlogo: "https://www.membroz.com/wp-content/uploads/2020/01/membroz-logo-1.png",
    property: { "country": country, contact: req.body.property.fullname },
    docformat: docformat,
    solutiontype: solutiontype,
    currency: currency.currency ? currency.currency : "USD",
    locale: localeWithCountryName ? localeWithCountryName : "en-US",
    qrcode: "",
    timezone: timezonesWithCountryName && timezonesWithCountryName.length > 0 ? timezonesWithCountryName[0] : "America/New_York",
    walletsetting: {
      "paymentType": [
        "card",
        "mobile"
      ],
      "iswalletotpenable": false,
    }
  });

  branch.save(req)
    .then(savedBranch => {

      req.body.branch = savedBranch;
      const user = new User({
        fullname: req.body.username,
        username: savedBranch.startingnumber,
        password: "MEMBROZFREEPLAN",
        role: req.body.role,
        designationid: "5c9a0e1112b3f913dc5ab3ba",
        branchid: savedBranch._id,
        property: prop
      });
      sendinblue.createContact(user);
      user.save(req)
        .then(savedUser => {
          var membershipstart = new Date()
          var membershipend = new Date()
          req.body.property = prop;
          membershipend.setDate(membershipend.getDate() + 30);
          req.body.membershipstart = membershipstart;
          req.body.membershipend = membershipend;
          req.body.membershipid = "5ef1a70999e17f09d0a3f8f5";

          //
          const formdata = new Formdata({
            formid: "60a25a5e99e17f50f8b59a38",
            property: {
              frequency: "daily",
              userid: [
                savedUser._id
              ]
            },
            branchid: savedBranch._id,
            onModel: "User"
          });
          formdata.save(req).then();
          //
          next();
        })
        .catch(e => {
          savedBranch.remove().then();
          console.log(e)
          next(e)
        });

    })
    .catch(e => {
      res.json(e)
    });
}


function getUserrole(req) {

  var solutiontype = req.body.solutiontype;
  switch (solutiontype) {

    case "Club, Resort & Hotel":
      req.body.role = "6124d541bfd76017d0f690e3";
      req.body.listid = "41";
      ////req.body.sendgridlist ="1778267f-e739-4c6a-86d6-c3bdc245cc01";
      break;

    case "Vacation & Hospitality Timeshare":
      req.body.role = "5dd7e20180199f0aecd400a9";
      ////req.body.sendgridlist ="191270f0-d043-4ea1-b3b0-2dae60b763f2";
      req.body.listid = "47";
      break;

    case "Tour & Travel":
      req.body.role = "5ee9bc346a427605dd2ec0c0";
      ////req.body.sendgridlist ="70d5f4a4-f03e-4330-8a46-b2fcd93450d0";
      req.body.listid = "55";
      break;

    case "Gym, Yoga & Fitness Center":
      req.body.role = "5dd37f876c98a22df08b9509";
      ////req.body.sendgridlist ="2a2e449c-c156-4b4a-a4cd-dc1e5be17078";
      req.body.listid = "44";
      break;

    case "Spa, Salon & Wellness Center":
      req.body.role = "5dd37f796c98a22df08b9507";
      //req.body.sendgridlist ="6708646f-bdff-450a-8dd4-d5550bb15968";
      req.body.listid = "48";
      break;

    case "Restaurant, Pubs & Bar":
      req.body.role = "5dd7e27680199f0aecd400b1";
      //req.body.sendgridlist ="1cfe6dae-172a-44c0-baca-340d68203112";
      req.body.listid = "51";
      break;

    case "Dietician & Nutritionist":
      req.body.role = "5dedcd5a78ce12225489b82f";
      //req.body.sendgridlist ="9a9770cc-8c65-4724-a5c4-ad42dc11f943";
      req.body.listid = "43";
      break;

    case "Service, Workshop & Maintenance":
      req.body.role = "5dd7e2b080199f0aecd400b5";
      //req.body.sendgridlist ="a375cfd7-36c3-44d0-97db-62a93eb038e7";
      req.body.listid = "50";
      break;

    case "Community, Association & Society":
      req.body.role = "5dd7e21e80199f0aecd400ab";
      //req.body.sendgridlist ="28dcab64-ed86-434e-bb75-e4b13c84ab8e";
      req.body.listid = "34";
      break;

    // case "Housing & Commercial Complex":
    //   req.body.role ="5ee9bc516a427605dd2ec0c2";
    //   ////req.body.sendgridlist ="77023e9d-e641-4965-a44c-a453517bd527";
    //   req.body.listid ="34";
    //   break;

    case "Franchise, Distributor & Agency":
      req.body.role = "5f81a57399e17f3ac0f48cf6";
      //req.body.sendgridlist ="dddea0f7-72b1-4f10-a010-24c5753eaba4";
      req.body.listid = "46";
      break;

    case "Doctor Clinic & Polyclinic":
      req.body.role = "5dd7e32c80199f0aecd400bb";
      //req.body.sendgridlist ="a927d839-c67c-4a0c-8c40-68091e873d47";
      req.body.listid = "17";
      break;

    case "Venue & Facility Booking":
      req.body.role = "5e44fa7ca6d0153e8070ac7b";
      //req.body.sendgridlist ="05fea698-5c40-4402-99bc-27a0a1ebcbd0";
      req.body.listid = "37";
      break;

    case "Consulting & Coaching Service":
      req.body.role = "5dd7e30a80199f0aecd400b9";
      //req.body.sendgridlist ="b1b93e45-36c3-44e0-9095-859251aa43fd";
      req.body.listid = "21";
      break;

    // case "Academy, Preschool & Daycare":
    //   req.body.role ="5dedf38878ce12225489b870";
    //   //req.body.sendgridlist ="a1e40b0c-42f2-4826-9027-a34d77f6960e";
    //   req.body.listid ="21";
    //   break;

    case "Apartment, Equipment & Car Rental":
      req.body.role = "5dd7e28f80199f0aecd400b3";
      //req.body.sendgridlist ="4f9987b5-13bd-429b-af85-c41f2fd97ff0";
      req.body.listid = "39";
      break;

    default:
      req.body.role = "5dd37f876c98a22df08b9509";
      req.body.listid = "54";
  }
}

function generateqrcode(req, res, next) {

  var branch = req.body.branch;

  QRCode.toDataURL(JSON.stringify(branch), (err, src) => {
    if (err) {
      console.log("error occurred!");
    }
    res.json(src)
  })
}

function generatewebqrcode(req, res, next) {
  var url = req.body.url;

  QRCode.toDataURL(JSON.stringify(url), (err, src) => {
    if (err) {
      console.log("error occurred!");
    }
    res.json(src)
  })
}


