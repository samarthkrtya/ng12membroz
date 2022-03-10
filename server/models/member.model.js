const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

var optionsFunction = function() {
  var value = typeof this.projection;  
  if (value == "function" && this.projection()) {
    var arr = []
    for (const property in this.getOptions()) {
      var prop  = property.split(".");
      if (prop.length > 1 && prop[0] == "membershipid")
      {
        arr.push(prop[1])
      }
    }    
    return { select: arr, maxDepth: 2 }
  }
  else 
  return { maxDepth: 2 }
};

const MemberSchema = new mongoose.Schema({
  wallets: [{
    cardnumber: String,
    principal: Boolean,
    holder: String,
    expirydate: Date,
    status: String
  }],
  membernumber: {
    type: String,
    required: true,
  },
  membershipid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership",
    autopopulate: optionsFunction
  },
  anroiddevices: [
    {
      deviceid: String,
      registrationid: String,
    },
  ],
  iosdevices: [
    {
      deviceid: String,
      registrationid: String,
    },
  ],
  membershipstart: {
    type: Date,
  },
  membershipend: Date,
  password: {
    type: String,
    required: true,
    bcrypt: true,
  },
  firsttimelogin: { type: Boolean, default: true },
  forcelogin: { type: Boolean, default: false },
  profilepic: String,
  fullname: String,
  paymentterms: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Paymentterm", autopopulate: { maxDepth: 2 } },
  ],
  addons: [
    {
      membershipid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership",
        autopopulate: false
      },
      paymentterms: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Paymentterm", autopopulate: false },
      ],
      membershipstart: Date,
      membershipend: Date,
      status: { type: String, default: "active" }
    },
  ],
  property: Object,
  attachments: [],
  campaignid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    autopopulate: { maxDepth: 2 }
  },
  handlerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 2 }
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
    autopopulate: true
  },
  status: { type: String, default: "active" },
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    autopopulate: { maxDepth: 2 }
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
}, {
  versionKey: false,
  timestamps: true
});

MemberSchema.plugin(mongooseautopopulate);

MemberSchema.options.selectPopulatedPaths = false;

var options = {customCollectionName: "histories", diffOnly: true, metadata: [{key: 'schemaname', value: 'members'} ]}

MemberSchema.plugin(mongooseHistory, options)

MemberSchema.plugin(require("mongoose-bcrypt"));

MemberSchema.pre("save", function (next) {
  if (this.property) {
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
    if (this.property.surname && this.property.surname != "") {
      name += this.property.surname + " ";
    }
    if (this.property.full_name && this.property.full_name != "") {
      name += this.property.full_name + " ";
    }
    if (this.property.fullname && this.property.fullname != "") {
      name += this.property.fullname + " ";
    }
    this.fullname = name.trim();

  }

  next();
});

MemberSchema.statics = {


  getbyfilter(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var fields2 = common.generateselect2(params.select);
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
    // console.log(params.search)
    // console.log(params.select)
    return this.find(query)
      .select(fields)      
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .setOptions(fields2)
      .exec()
      .then((members) => {
        return members;
      })
      .catch((e) => console.log(e))

  },

  getLastMember(query) {
    return this.findOne(query)
      .sort({ membernumber: -1 })
      .exec()
      .then((member) => {
        if (member) {
          return member.membernumber;
        } else return; //"return STARTINGNUMBER";
      });
  },

  getbyUsername(query, pwd) {

    return this.findOne(query)
      .exec()
      .then((member) => {
        if (member) {

          var valid = member.verifyPasswordSync(pwd);

          if (valid) {
            ////console.log('Valid (sync)');
            return member;
          } else {
            return null;
          }
        }
      });
  },

  findcount(req) {

    var params = req.body;
    var size = parseInt(params.size);
    var query = common.generatequery(params);
    return this.countDocuments(query).exec().then((totalCount) =>{
        var totalPages = Math.ceil(totalCount / size)
        req.header = { "error" : false, "totalCount": totalCount , "totalPages": totalPages};
    })

  },

  exportdata(params) {

    var query = common.generatequery(params);
    var fields = common.generateselect(params.select);
    var sort = params.sort;
    if (!sort) {
      sort = {
          "updatedAt" : -1,
          "createdAt" : -1
      }
    }

    return this.find(query)
    .select(fields)
      .sort(sort)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((members) => {
        return members;
      })

  },


  validateuserpassword(userid, pwd) {
    ////console.log(userid);
    return this.findOne({ membernumber: userid, status: "active" })
      .exec()
      .then((member) => {
        if (member) {
         // Verify password synchronously => Invalid (sync)
         // ////console.log(member);
         ////console.log(member);
         var valid = member.verifyPasswordSync(pwd);

         if (valid) {
           ////console.log('Valid (sync)');
           return member;
         } else {
          throw Error("Invalid login");
         }
        } else throw Error("Invalid login");

      });
  }


};

module.exports = mongoose.model('Member', MemberSchema);
