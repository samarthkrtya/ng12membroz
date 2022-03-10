const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');
var Float = require('mongoose-float').loadType(mongoose);

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true,
    bcrypt: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    autopopulate: true
  },
  anroiddevices: [{
    deviceid: String,
    registrationid: String
  }],
  iosdevices: [{
    deviceid: String,
    registrationid: String
  }],
  designationid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designation',
    autopopulate: { maxDepth: 2 }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 2 }
  },
  salarycomponents: [
    {
      salarycomponentid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salarycomponent'
      },
      amount: Float,
      amountannualy: Float,
      percentage: Number
    }
  ],
  leavecomponents: [{
    leavecomponentid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leavetype',
      autopopulate: { maxDepth: 1 }
    },
    effectivedate: Date,
    balance: Float
  }],
  netsalary: Float,
  fullname: String,
  firsttimelogin: { type: Boolean, default: true },
  forcelogin: { type: Boolean, default: false },
  property: Object,
  profilepic: String,
  hourlyrate: Number,
  duration: Number,
  availability: {
    days: [],
    starttime: String,
    endtime: String,
    notavailibility : Boolean,
    availibilitydate : Date,
  },
  breaktime: [{
    title: String,
    days: [],
    starttime: String,
    endtime: String
  }],
  servicecharges: [{
    serviceid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      autopopulate: { maxDepth: 2 }
    },
    charges: { type: Float, default: 0 },
    chargesmethod: { type: String, default: 'Percentage' },
    commission: { type: Float, default: 0 },
  }],
  wfstatus: { type: String },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    autopopulate: { maxDepth: 2 }
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "active" }
}, {
  versionKey: false,
  timestamps: true
});

UserSchema.plugin(mongooseautopopulate);

UserSchema.options.selectPopulatedPaths = false;

var options = { customCollectionName: "histories", diffOnly: true, metadata: [{ key: 'schemaname', value: 'users' }] }

UserSchema.plugin(mongooseHistory, options)

UserSchema.plugin(uniqueValidator);

UserSchema.plugin(require('mongoose-bcrypt'));

UserSchema.pre("save", function (next) {
  if (this.property && (this.property.first_name || this.property.fullname)) {
    var name = "";
    if (this.property.first_name && this.property.first_name != "") {
      name = this.property.first_name + " ";
    }
    if (this.property.middle_name && this.property.middle_name != "") {
      name += this.property.middle_name + " ";
    }
    if (this.property.last_name && this.property.last_name != "") {
      name += this.property.last_name + " ";
    }
    if (this.property.full_name && this.property.full_name != "") {
      name += this.property.full_name + " ";
    }
    if (this.property.fullname && this.property.fullname != "") {
      name += this.property.fullname + " ";
    }
    this.fullname = name;

  }

  next();
});

UserSchema.statics = {


  getbyfilter(params) {
    //console.log("params", params)
    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    //var reffields = common.generaterefselect('-role -branchid -designationid', params.select);
    var pageNo = parseInt(params.pageNo);
    var size = parseInt(params.size);
    var limit, skip;

    var sort = params.sort;
    if (!sort) {
      sort = {
        "updatedAt": -1,
        "createdAt": -1
      }
    }

    if (pageNo < 0 || pageNo === 0) {
      return { "error": true, "message": "invalid page number, should start with 1" };
    }

    skip = size * (pageNo - 1)
    limit = size;
    if (params.searchtext && !Array.isArray(params.searchtext)) {
      skip = 0;
      limit = 0;
    }
    //console.log("query", query)
    return this.find(query)
      .select(fields)
      // .select(reffields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((users) => {
        return users;
      })
      .catch((e) => console.log(e))

  },

  findcount(req) {

    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) => {
      var totalPages = Math.ceil(totalCount / size)
      req.header = { "error": false, "totalCount": totalCount, "totalPages": totalPages };
    })

  },

  exportdata(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var sort = params.sort;
    if (!sort) {
      sort = {
        "updatedAt": -1,
        "createdAt": -1
      }
    }

    return this.find(query)
      .select(fields)
      .sort(sort)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((users) => {
        return users;
      })

  },

  getLastUser(query) {
    return this.findOne(query)
      .sort({ username: -1 })
      .exec()
      .then((user) => {
        if (user) {
          return user.username;
        } else return; //"return STARTINGNUMBER";
      });
  },

  getbyUsername(query, pwd) {

    return this.findOne(query)
      .then((user) => {
        if (user) {

          var valid = user.verifyPasswordSync(pwd);
          
          if (valid) {
            ////console.log('Valid Pass (sync)', pwd);
            return user;
          } else {
            return null;
          }
        }
      });
  },

  validateuserpassword(userid, pwd) {
    ////console.log(userid);
    return this.findOne({ username: userid, status: "active" })
      .exec()
      .then((user) => {
        if (user) {
          // Verify password synchronously => Invalid (sync)
          // ////console.log(member);
          ////console.log(user);
          var valid = user.verifyPasswordSync(pwd);

          if (valid) {
            ////console.log('Valid (sync)');
            return user;
          } else {
            throw Error("Invalid login");
          }
        }
        else throw Error("Invalid login");

      });
  }

}


module.exports = mongoose.model('User', UserSchema);
