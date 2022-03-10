const mongoose = require('mongoose');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');
var Float = require('mongoose-float').loadType(mongoose);

const TourpackageviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  packagetype: String,
  duration: String,
  traveldate : Date,
  capacity : Number,
  schedule : String,
  bookedcapacity : { type: Number, default: 0 },
  cost: Float,
  totaladults: Number,
  totalchildrens: Number,
  image: Object,
  taxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax', autopopulate: { maxDepth: 2 } }],
  itemid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billitem',
    autopopulate: { maxDepth: 2 }
  },
  basetourpackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourpackage',
    autopopulate: { maxDepth: 2 }
  },
  destinations:[
    {
      destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 2 }
      },
      day: String,
      nights: String,
      attachment: [],
      description: String,
    }
  ],
  activity:[
    {
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        autopopulate: { maxDepth: 2 }
      },
      location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 2 }
      },
      day: String,
      duration: String,
      attachment: [],
      description: String,
    }
  ],
  transfer:[
    {
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 2 }
      },
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 2 }
      },
      day: String,
      duration: String,
      transfertype: String,
      nightscover : { type : Boolean , default : false },
      facilities: []
    }
  ],
  flight:[
    {
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 2 }
      },
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resortlocation',
        autopopulate: { maxDepth: 2 }
      },
      day: String,
      duration: String,
      tickettype : String,
      nightscover : { type : Boolean , default : false }
    }
  ],
  property: Object,
  branchid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    autopopulate: { maxDepth: 2 }
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
}, {
  versionKey: false
});

TourpackageviewSchema.plugin(mongooseautopopulate);

TourpackageviewSchema.options.selectPopulatedPaths = false;

TourpackageviewSchema.statics = {

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
      .then((datas) => {
        return datas;
      })

  },


};

module.exports = mongoose.model('Tourpackageview', TourpackageviewSchema);
