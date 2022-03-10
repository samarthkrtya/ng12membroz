const Paymentschedule = require('../models/paymentschedule.model');
const Payment = require('../models/payment.model');
const Billpayment = require('../models/billpayment.model');
const Bill = require('../models/bill.model');
const Member = require('../models/member.model');
var crypto = require('crypto')
var Razorpay = require('razorpay')
var checksum = require('../helpers/paytm/checksum');
var path = require("path");
var fs = require("fs");
//import fetch from 'node-fetch';

module.exports = { 
  createmagpiesource,
  chargecard,
  createmagpiecustomer,
  retrieveCustByEmail,
  attachsource,
  createcheckout,
  deletemagpietoken
}


async function retrieveCustByEmail(req, res, next) {  
 
  var email = req.body.email;
  const axios = require('axios')
  var url = `https://api.magpie.im/v2/customers/by_email/${email}`;
  var secret = Buffer.from('sk_live_bNX3TvxvImXQhbu5xcnTM9:').toString('base64');
  console.log("url", url);  
  axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + secret // + Buffer.from('pk_test_6CPvm9uHz2RR39zGmUn0Vj:').toString('base64')
      },
      data: {
        
      }
    })
    .then((res1) => {      
      if (res1.data.id){
        req.body.customerid = res1.data.id;
      }      
      next();
    })
    .catch((error) => {
      console.log("error 0",error)
      next();
      // res.status(error.response.status).json({
      //   message: error.response.data.detail
      // });
      // throw error;
    })  
    
} 

async function deletemagpietoken(req, res, next) {  
 
  var sourceid = req.body.sourceid;
  var custid = req.body.magpiecustomerid;

  const axios = require('axios')
  var url = `https://api.magpie.im/v2/customers/`+ custid + `/sources/` + sourceid  
  var secret = Buffer.from('sk_live_bNX3TvxvImXQhbu5xcnTM9:').toString('base64');
  console.log("url", url);  
  axios.delete(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + secret // + Buffer.from('pk_test_6CPvm9uHz2RR39zGmUn0Vj:').toString('base64')
      },
      data: {
        
      }
    })
    .then((res1) => {
      console.log("res1", res1)
      Member.findByIdAndUpdate(req.body.memberid, { 
        "property.sourceid": null, 
        "property.magpiecustomerid": null,
        "property.name_on_account": null, 
        "property.credit_card_no": null, 
        "property.exp_month": null,
        "property.exp_year": null
      }).then((result)=>{
        console.log("result",result);
        res.json(result);
      },(e)=>{
        console.log("error",e);
        res.status(error.status).json({ message: error.message });
      });

    })
    .catch((error) => {
      console.log("error 0",error)
      res.status(error.response.status).json({
        message: error.response.data.detail
      });
      // throw error;
    })  
    
} 

async function createmagpiesource(req, res, next) {

  const axios = require('axios')
  var url = `https://api.magpie.im/v2/sources`
  var publickey = Buffer.from('pk_live_BPNVK98yiXpA8sxiPQuPaU:').toString('base64');
  var sourceid = req.body.sourceid;
  //console.log("req.body.sourceid", req.body.sourceid);  
  axios.post(url,
    JSON.stringify({
      "type": "card",
      "card": {
        "name": req.body.card_name,
        "number": req.body.number,
        "exp_month": parseInt(req.body.exp_month),
        "exp_year": parseInt(req.body.exp_year),
        "cvc": req.body.cvv
      },
      "redirect": {
        "success": "https://magpie.im/?status=success",
        "fail": "https://magpie.im/?status=fail"
      }
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + publickey // + Buffer.from('pk_test_6CPvm9uHz2RR39zGmUn0Vj:').toString('base64')
      },
    },
  )
    .then((res1) => {
      console.log(`statusCode: ${res1.statusCode}`)
      req.body.sourceid = res1.data.id;
      console.log("req.body.sourceid", req.body.sourceid)
      next()
    })
    .catch((error) => {
      console.log("error 0",error)
      res.status(error.response.status).json({
        message: error.response.data.detail
      });
      // throw error;
    })
} 

async function chargecard(req, res, next) {

  const axios = require('axios')
  var sourceid = req.body.sourceid;
  console.log("sourceid", sourceid)
  var url = `https://api.magpie.im/v2/charges`
  var secret = Buffer.from('sk_live_bNX3TvxvImXQhbu5xcnTM9:').toString('base64');
  //console.log("secret", secret)
  axios.post(url,
    JSON.stringify({
      "amount": 2500, // req.body.amount
      "currency": "PHP",
      "source": sourceid,
      "description": "1 hour surf lesson",
      "statement_descriptor": "Surf Rack",
      "capture": true
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + secret
      },
    },
  )
    .then((res1) => {
      console.log(`statusCode: ${res1.statusCode}`)
      console.log(res1.data);
      res.json(res1.data);
    })
    .catch((error) => {
      //console.log("error 1", JSON.stringify(error.response.data))
      res.status(error.response.status).json({
        message: error.response.data.detail
      });
    })
}

async function createmagpiecustomer(req, res, next) {

  const axios = require('axios')
  var url = `https://api.magpie.im/v2/customers`
  var publickey = Buffer.from('sk_live_bNX3TvxvImXQhbu5xcnTM9:').toString('base64');
  var magpiecustomerid = req.body.magpiecustomerid;
  var customerid = req.body.customerid;
  console.log("req.body.memberid", req.body.memberid)
  if (magpiecustomerid) {
    req.body.customerid = magpiecustomerid;
    next();
  }
  else if (customerid) {
    req.body.customerid = customerid;
    Member.findByIdAndUpdate(req.body.memberid, { 
      "property.sourceid": req.body.sourceid, 
      "property.magpiecustomerid": req.body.customerid, 
      "property.name_on_account": req.body.card_name, 
      "property.credit_card_no": req.body.number, 
      "property.exp_month": req.body.exp_month,
      "property.exp_year": req.body.exp_year
    }).then();
    next();
  }
  else
    axios.post(url,
      JSON.stringify({
        email: req.body.email,
        description: req.body.card_name,
        metadata: {
          address: req.body.address
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + publickey // + Buffer.from('pk_test_6CPvm9uHz2RR39zGmUn0Vj:').toString('base64')
        },
      },
    )
      .then((res1) => {
        console.log(`statusCode: ${res1.statusCode}`)
        req.body.customerid = res1.data.id;
        //console.log(req.body.memberid)
        Member.findByIdAndUpdate(req.body.memberid, { 
          "property.sourceid": req.body.sourceid, 
          "property.magpiecustomerid": req.body.customerid, 
          "property.name_on_account": req.body.card_name, 
          "property.credit_card_no": req.body.number, 
          "property.exp_month": req.body.exp_month,
          "property.exp_year": req.body.exp_year
      }).then();
        next()
      })
      .catch((error) => {
        console.log("error 2",error)
        res.status(error.response.status).json({
          message: error.response.data.detail
        });
        // throw error;
      })
}


async function attachsource(req, res, next) {

  const axios = require('axios')
  var custid = req.body.customerid;
  var sourceid = req.body.sourceid;
  var url = `https://api.magpie.im/v2/customers/`+ custid + `/sources`
  var publickey = Buffer.from('sk_live_bNX3TvxvImXQhbu5xcnTM9:').toString('base64');
  //console.log("url", url)
  axios.post(url,
    JSON.stringify({
      source: sourceid
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + publickey // + Buffer.from('pk_test_6CPvm9uHz2RR39zGmUn0Vj:').toString('base64')
      },
    },
  )
    .then((res1) => {
      console.log(`statusCode: ${res1.statusCode}`)      
      console.log("res1", res1)
      res.json(res1.data);
    })
    .catch((error) => {
      res.status(error.response.status).json({
        message: error.response.data.detail
      });
    })
}


async function createcheckout(req, res, next) {

  const axios = require('axios')
  // var custid = req.body.customerid;
  // var sourceid = req.body.sourceid;
  var url = `https://pay.magpie.im/api/v2/sessions`
  var publickey = Buffer.from('sk_live_bNX3TvxvImXQhbu5xcnTM9:').toString('base64');
  
  axios.post(url,
    JSON.stringify({
      billing_address_collection: true,
      // branding: {
      //   icon: 'https://example.com/public/icon.svg',
      //   logo: 'https://example.com/public/logo.svg',
      //   use_logo: true,
      //   primary_color: '#339af5',
      //   secondary_color: '#0074d4'
      // },
      cancel_url: 'https://example.com/cancel?ref_id=e900558b-8919-4984-94ca-330bbd26bb11',
      client_reference_id: 'e900558b-8919-4984-94ca-330bbd26bb11',
      currency: 'php',
      // customer: 'cus_017d4cf830ec00130dc71ec845aab97d',
      // customer_email: 'jariwbh1@krtya.com',
      line_items: [
        {
          name: 'Surf board',
          description: 'Custom surf board, Hawaii',
          quantity: 1,
          amount: 500,
          currency: 'PHP',
          image: 'https://example.com/surf-board/custom_board.jpeg'
        }
      ],
      locale: 'en',
      metadata: {},
      payment_method_types: ['card', 'bpi', 'bdo', 'pnb', 'metrobank', 'unionbank', 'rcbc', 'paymaya', 'gcash', 'alipay', 'wechat', 'unionpay'],
      shipping_address_collection: { allowed_countries: ['PH'] },
      submit_type: 'pay',
      success_url: 'https://example.com/success?ref_id=e900558b-8919-4984-94ca-330bbd26bb11'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + publickey // + Buffer.from('pk_test_6CPvm9uHz2RR39zGmUn0Vj:').toString('base64')
      },
    },
  )
    .then((res1) => {
      console.log(`statusCode: ${res1.statusCode}`)      
      console.log("res1", res1)
      next()
    })
    .catch((error) => {
      console.error(error)
    })
}

