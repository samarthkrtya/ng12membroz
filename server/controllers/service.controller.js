const Joi = require('joi');
const Service = require('../models/service.model');
var ObjectID = require('mongodb').ObjectID;
const serviceSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null),
  category: Joi.string().hex().required(),
  duration: Joi.number(),
  charges: Joi.number().required(),
  type : Joi.string(),
  rooms: Joi.array().allow(null),
  taxes: Joi.array().allow(null),
  commission: Joi.number().allow(null),
  assistantcommission : Joi.number().allow(null),
  staffcommission: Joi.array(),
  availability: Joi.object(),
  staffavailability: Joi.array(),
  breaktime: Joi.array(),
  staff: Joi.array(),
  items: Joi.array(),
  assets: Joi.array(),
  gallery: Joi.array(),
  property: Joi.object(),
})


module.exports = {
  insert,
  update,
  remove,
  filter,
  findcount,
  findbyId,
  exportdata,
  updateserviceavailability
}

async function findbyId(Id) {
  return await Service.findById(Id);
}

async function insert(req) {
  var service = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    duration: req.body.duration,
    charges: req.body.charges,
    type: req.body.type,
    taxes: req.body.taxes,
    commission: req.body.commission,
    assistantcommission : req.body.assistantcommission,
    staffcommission: req.body.staffcommission,
    availability: req.body.availability,
    staffavailability: req.body.staffavailability,
    staff: req.body.staff,
    rooms: req.body.rooms,
    breaktime: req.body.breaktime,
    gallery: req.body.gallery,
    property: req.body.property
  }
  service = await Joi.validate(service, serviceSchema, { abortEarly: false });
  return await new Service(service).save(req);
}

async function update(Id, req) {
  var body = req.body;
  var service = await Service.findById(Id);
  service._original = service.toObject();
  service.title = body.title,
  service.description = body.description,
  service.category = body.category,
  service.duration = body.duration,
  service.charges = body.charges,
  service.type = body.type,
  service.taxes = body.taxes,
  service.commission = body.commission,
  service.assistantcommission = body.assistantcommission,
  service.staffcommission = body.staffcommission,
  service.availability = body.availability,
  service.staffavailability = body.staffavailability,
  service.staff = body.staff,
  service.supportstaff = body.supportstaff,
  service.rooms = body.rooms,
  service.items = body.items,  
  service.assets = body.assets,
  service.gallery = body.gallery,
  service.breaktime = body.breaktime,
  service.property= body.property
  return await service.save(req);
}

async function remove(Id, req) {
  var service = await Service.findById(Id);
  service.status = "deleted"
  return await service.save(req);
}

async function filter(params) {
  return await Service.getbyfilter(params)
}

async function findcount(req) {
  return await Service.findcount(req)
}

async function exportdata(params) {
  return await Service.exportdata(params)
}

async function updateserviceavailability(req) {

  var user = req.body.user;
  req.body.formname = req.body.formname? req.body.formname: "service";
  var results = await Service.getbyfilter(req.body);

  results.forEach(service => {
    var staff;
    if(service.staff){
      staff  = service.staff.find(staff =>{
        return staff._id.toString() == user._id.toString();
      })
    }

    if (staff) {

      var staffavailability = service.staffavailability;
      staffavailability = staffavailability.filter(availability => {
        return availability.userid._id.toString() != user._id.toString();
      });

      if (user && Array.isArray(user.availability))
        user.availability.forEach(element => {

          var availability = {
            "days": [
              element.day
            ],
            "userid": user._id,
            "starttime": element.starttime,
            "endtime": element.endtime
          }

          staffavailability.push(availability)
        })

      service.staffavailability = staffavailability;
      Service.findByIdAndUpdate(service._id, service).then();

    }

  });

  return user;

}
