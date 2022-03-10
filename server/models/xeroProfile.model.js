const mongoose = require('mongoose');
const mongooseHistory = require('../lib/mongoose-history');
const mongooseautopopulate = require('mongoose-autopopulate');
const common = require('../helpers/common');

const { Schema } = mongoose;

const XeroProfileSchema = new Schema(
  {    
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizationsetting'
    },
    companyId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    idToken: String,
    expiresAt: String,
    xRefreshTokenExpiresIn: String,
    tokenType: String,
    companyName: String,
    legalName: String,
    companyAddress: String,
    companyEmailAddress: String,
    mobile: String,
    city: String,
    region: String,
    country: String,
    countryCode: String,
    baseCurrency: String,
    postalCode: String,
    createTime: String,
    companyInfo: Object,
    payItems: Object,
    payrollCalendars: Object,
    payrollCalendarId: String,
    ordinaryEarningsRateID: String,
    isConnected: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('xeroProfile', XeroProfileSchema);
