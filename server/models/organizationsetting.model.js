const mongoose = require('mongoose');
const common = require('../helpers/common');

const OrganizationsettingSchema = new mongoose.Schema({

  // Logo/Background & Portal Setting
  organizationname:String,
  logo: String,
  adminloginimage: String,
  memberloginimage: String,
  weburl: String,
  webtitle: String,
  loginheader: String,
  loginsubheader: String,
  copyright: { type: String, default: "Krtya Technologies Pvt Ltd" },
  supportedlanguage: [],
  
  // hidden
  membershipidformat: String,
  startingnumber: String,
  memberusername: String,
  usernameformat: String,
  usernameformat: String,
  calendarweek: String,
  docformat: [],
  memberloginproperty: [], //Mobile No, EMAIL, CUSTOM
  userloginproperty: [], //Mobile No, EMAIL, CUSTOM
  lastvouchersno: Number,
  memberrole: String,

  // Integration setting
  whatsappconfig: Object,
  androidPushNotificationAuthorizationKey: String,
  iosPushNotificationOptions: Object,
  iosPushNotificationtopic: String,
  cloud_name: String,

  // Email & Support Setting
  support: {  contactnumber: String, email: String, officetime: String, dayopen : String },
  fromemail: String,
  replyemail: String,
  sendgridkey: String,
  smsgateway: String,

  // System Setting
  allowmemberlogin: { type: Boolean, default: true },
  autologout:  { type: Boolean, default: false },
  autologouttimeout: Number,
  globalsearch: [],
  quickadd: Boolean,
  settingmenu: Boolean,
  calendarmenu: Boolean,
  databasetype: String, // branchwise
  dateformat: String,
  systemsecurity : Object,
  property: Object

}, {
  versionKey: false
});

OrganizationsettingSchema.statics = {

  getbyfilter(params) {
    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);

    var pageNo = parseInt(params.pageNo);
    var size = parseInt(params.size);
    var limit, skip;
    var sort = params.sort;

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
    if (params.searchtext && !Array.isArray(params.searchtext)) {
      skip = 0;
      limit = 0;
    }
    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((organizationsettings) => {
        return organizationsettings;
      })

  }

};

module.exports = mongoose.model('Organizationsetting', OrganizationsettingSchema);
