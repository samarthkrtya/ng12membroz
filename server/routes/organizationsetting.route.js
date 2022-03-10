const express = require('express');
const asyncHandler = require('express-async-handler');
const organizationsettingCtrl = require('../controllers/organizationsetting.controller');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/:Id')
  .put(asyncHandler(update))

router.route('/')
  .get(asyncHandler(findOne))


async function findOne(req, res) {
  let organizationsetting = await organizationsettingCtrl.findOne();
  res.json(organizationsetting);
}

async function update(req, res) {
  let organizationsetting = await organizationsettingCtrl.update(req.params.Id, req);
  res.json(organizationsetting);
}
