const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const UserprofileviewSchema = new mongoose.Schema({
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

UserprofileviewSchema.plugin(mongooseautopopulate);

UserprofileviewSchema.options.selectPopulatedPaths = false;

UserprofileviewSchema.statics = {

  getprofile(Id) {

    return this.findById(Id)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((userprofie) => {
        return userprofie;
      })

  },


};

module.exports = mongoose.model('Userprofileview', UserprofileviewSchema);
