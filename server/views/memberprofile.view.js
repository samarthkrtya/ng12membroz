const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const MemberprofileviewSchema = new mongoose.Schema({
  branchname: String,
  users: [],
  timezone: String,
  property: Object,
  branchid: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch'},
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

MemberprofileviewSchema.plugin(mongooseautopopulate);

MemberprofileviewSchema.options.selectPopulatedPaths = false;

MemberprofileviewSchema.statics = {

  getprofile(Id) {

    return this.findById(Id)
      .lean()
      .exec()
      .then((userprofie) => {        
        return userprofie;
      })

  },


};

module.exports = mongoose.model('Memberprofileview', MemberprofileviewSchema);
