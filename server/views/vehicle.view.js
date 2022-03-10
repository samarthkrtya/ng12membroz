const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const VehicleviewSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  customerid:  { /// For Workshop and Renting
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onCustomerModel',
    autopopulate: { maxDepth: 1 }
  },
  onCustomerModel: {
    type: String,
    enum: ['Member', 'Enquiry', 'User', 'Prospect']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
  },
  bookings: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  inspections: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Formdata",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  estimations: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quotation",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  joborders: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Joborder",
        autopopulate: { maxDepth: 2 }
      }
    }
  ],
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  property: Object,
  status: { type: String, default: "active" }
}, {
  versionKey: false
});

VehicleviewSchema.plugin(mongooseautopopulate);

VehicleviewSchema.options.selectPopulatedPaths = false;

VehicleviewSchema.statics = {


  getfilterview(params) {

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

    return this.find(query)
    .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true, autopopulate: { maxDepth: 2 } })
      .exec()
      .then((vehicles) => {
        return vehicles;
      })
      .catch((e) => console.log(e))

  },


};

module.exports = mongoose.model('Vehicleview', VehicleviewSchema, 'vehicleviews');
