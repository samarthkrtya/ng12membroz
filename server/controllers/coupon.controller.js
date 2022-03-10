const Joi = require('joi');
const Coupon = require('../models/coupon.model');
const CouponView = require('../views/coupon.view');
const common = require('../helpers/common');

const couponSchema = Joi.object({
  couponcode: Joi.string().required(),
  coupontype: Joi.string(),
  value: Joi.number().required(),
  items : Joi.array(),
  assets: Joi.array(),
  services: Joi.array(),
  giftcards: Joi.array(),
  property: Joi.object()
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
  checkvalidity
}

async function findbyId(Id) {
  return await Coupon.findById(Id);
}

async function insert(req) {
  let property = req.body.property;  
  if(property.applyonbill){
    property['allproducts'] = true;
    property['allservices'] = true;
    property['allgiftcards'] = true;
  }
  var coupon = {
    couponcode: req.body.couponcode,
    coupontype: req.body.coupontype,
    value: req.body.value,
    property: property
  }

  await Joi.validate(coupon, couponSchema, { abortEarly: false });
  return await new Coupon(coupon).save(req);
}

async function update(Id, req) {
  let property = req.body.property;  
  if(property.applyonbill){
    property['allproducts'] = true;
    property['allservices'] = true;
    property['allgiftcards'] = true;
  }
  var coupon = await Coupon.findById(Id);
  coupon._original = coupon.toObject();
  coupon.couponcode = req.body.couponcode,
  coupon.coupontype = req.body.coupontype,
  coupon.items = req.body.items,
  coupon.assets = req.body.assets,
  coupon.services = req.body.services,
  coupon.giftcards = req.body.giftcards,
  coupon.value = req.body.value,
  coupon.property = property
  return await coupon.save(req);
}

async function remove(Id, req) {
  var coupon = await Coupon.findById(Id);
  coupon.status = "deleted"
  return await coupon.save(req);
}

async function filter(params) {
  return await Coupon.getbyfilter(params)
}

async function findcount(req) {
  return await Coupon.findcount(req)
}

async function exportdata(params) {
  return await Coupon.exportdata(params)
}

async function checkvalidity(req,res) {
  const body = req.body; 
  var query = [
    {
      $addFields: {
        "startdate": { $toDate: "$property.start_date"},
        "enddate": { $toDate: "$property.end_date"}
      }
    },
    {
        $match: {
          "status": { "$eq": "active" },
          "availcoupon" : { "$gt": 0},
          "startdate" :  { "$lte": new Date() },
          "enddate" :  { "$gte": new Date() },
        }
    }
  ];
  const coupons = await CouponView.aggregate(query);
  var validcoupons = [];
  coupons.forEach((coupon)=>{
    if(body.type == 'product'){
      if(coupon.property && coupon.property.allproducts){
        validcoupons.push(coupon)
      }else{
        if(!coupon.items) return;
        let valid =  coupon.items.find(a=> a == body._id);
        if (valid){
          validcoupons.push(coupon)
        }
      }
    }else if(body.type == 'service'){
      if(coupon.property && coupon.property.allservices){
        validcoupons.push(coupon)
      }else{
        if(!coupon.services) return;
        let valid =  coupon.services.find(a=> a == body._id);
        if (valid){
          validcoupons.push(coupon)
        }
      }
    }else if(body.type == 'giftcard'){
      if(coupon.property && coupon.property.allgiftcards){
        validcoupons.push(coupon)
      }else{
        if(!coupon.giftcards) return;
        let valid = coupon.giftcards.find(a=> a == body._id);
        if (valid){
          validcoupons.push(coupon)
        }
      }
    }
  });
  return validcoupons;
}



