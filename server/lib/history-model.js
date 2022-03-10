"use strict";

var mongoose = require('mongoose')
  , historyModels = {};

/**
 * Create and cache a history mongoose model
 * @param {string} collectionName Name of history collection
 * @return {mongoose.Model} History Model
 */
module.exports.HistoryModel = function(collectionName, options) {
  var indexes = options && options.indexes,
      historyConnection = options && options.historyConnection,
      metadata = options && options.metadata;

  // var property = {
  //   WEBURL: WEBURL
  // }

  if (!(collectionName in historyModels)) {
    var schema = new mongoose.Schema({
      t: {type: Date, required: true},
      o: {type: String, required: true},
      d: {type: mongoose.Schema.Types.Mixed, required: true},
      m: { type: String },
      schemaname: {type: String, required: true},
    //  property: {type: Object, default: property },
      status: {type: String, default: 'active' },
      updatedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      branchid: { type: mongoose.Schema.Types.ObjectId },
      workflowstatus: {type: String, default: 'active' }
    },{ versionKey: false, timestamps : true });

    if (metadata){
      metadata.forEach((m) =>{
        schema[m.key] = m.schema || {type: mongoose.Schema.Types.Mixed}
      })
    }

    if(indexes){
      indexes.forEach(function(idx) {
        schema.index(idx);
      });
    }

    if(historyConnection) {
      historyModels[collectionName] = historyConnection.model(collectionName, schema, collectionName);
    } else {
      historyModels[collectionName] = mongoose.model(collectionName, schema, collectionName);
    }

  }

  return historyModels[collectionName];
};

/**
 * Set name of history collection
 * @param {string} collectionName history collection name
 * @param {string} customCollectionName history collection name defined by user
 * @return {string} Collection name of history
 */
module.exports.historyCollectionName = function(collectionName, customCollectionName) {
  if(customCollectionName !== undefined) {
    return customCollectionName;
  } else {
    return collectionName + '_history';
  }


};
