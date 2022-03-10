const Paymentschedule = require('../models/paymentschedule.model');
const Payment = require('../models/payment.model');
const Billpayment = require('../models/billpayment.model');
const Bill = require('../models/bill.model');
var crypto = require('crypto')
var Razorpay = require('razorpay')
var checksum = require('../helpers/paytm/checksum');
var path = require("path");
var fs = require("fs");
//import fetch from 'node-fetch';

module.exports = {
  onlinepayment,
  onlinepaymentsuccess,
  onlinepaymentfail,
  stripesuccess  
}

async function onlinepayment(req, res) {

  var email, phone, fullname, productinfo, billid;
  var bill = req.body.bill;
  var amount = bill.balance;
  if (req.body.billid) {
    billid = "Billid" + req.body.billid;
    productinfo = "Bill";
  }
  else if (req.body.paymentscheduleid) {
    billid = "id" + req.body.paymentscheduleid;
    productinfo = "Membership fees";
  }
  
  if (bill.customerid) {
    email = req.body.email ? req.body.email : bill.customerid.property.primaryemail;
    phone = req.body.phone ? req.body.phone : bill.customerid.property.mobile;
    fullname = bill.customerid._id;
  }
  if (bill.memberid) {
    email = req.body.email ? req.body.email : bill.memberid.property.primaryemail;
    phone = req.body.phone ? req.body.phone : bill.memberid.property.mobile;
    fullname = bill.memberid._id;
  }

  var gateway = req.body.gateway;
  var Config = gateway.property;
  var key = Config['key'];
  var secretkey = Config['secretkey'];
  var currency = Config['currency'];
  var salt = Config['salt'];

  var paymentMode = req.body.paymentMode ? req.body.paymentMode : null;
  var protocolStr = "http";
  var successurl = req.body.successApiUrl ? req.body.successApiUrl : null;
  var failurl = req.body.failApiUrl ? req.body.failApiUrl : null;
  var Config = gateway.property;
  var transactionURL = '';
  var poststr = '';

  if (Config.transaction_mode == "Development") {
    transactionURL = Config.development_url;
    protocolStr = "http";
  } else {
    transactionURL = Config.production_url;
    protocolStr = "https";
  }

  var surl = protocolStr + '://' + req.get('host') + successurl;
  var furl = protocolStr + '://' + req.get('host') + failurl;
  console.log("paymentMode", paymentMode)
  switch (paymentMode) {

    case "Paytm":

      var paramarray = {};
      var PAYTM_MERCHANT_KEY = Config.merchant_key;
      paramarray['ORDER_ID'] = billid;
      paramarray['CUST_ID'] = fullname;
      paramarray['INDUSTRY_TYPE_ID'] = Config.industry_type_id;
      paramarray['CHANNEL_ID'] = Config.channel_id;
      paramarray['TXN_AMOUNT'] = amount;
      paramarray['MID'] = Config.mid;
      paramarray['WEBSITE'] = Config.website;
      paramarray['CALLBACK_URL'] = surl;

      checksum.genchecksum(paramarray, PAYTM_MERCHANT_KEY, function (err, result) {

        for (var name in result) {
          //console.log(result)
          poststr += "<br><input type='text' name='" + name + "' value='" + result[name] + "'>";
        }

        res.json({
          "actionvalue": transactionURL,
          "value": poststr
        });

      });

      break;
    case "PayU":

      key = Config['key_id'];
      salt = Config['salt'];

      var sha512 = require('js-sha512').sha512;
      var hash_str = key + '|' + billid + '|' + amount + '|' + productinfo + '|' + fullname + '|' + email + '|||||||||||' + salt;
      var hash = sha512(hash_str);

      poststr += "<input type='hidden' name='key' value='" + key + "' id=' marchentKey' /> <br>";
      poststr += "<input type='hidden' name='txnid' value='" + billid + "' id='txnid' /> <br>";
      poststr += "<input type='hidden' name='salt' value='" + salt + "' id='salt' /> <br>";
      poststr += "<input name='amount' value='" + amount + "' id='amount'  /> <br>";
      poststr += "<input name='phone' value= '" + phone + "' id='phone'  /> <br>";
      poststr += "<input name='firstname' id='firstname' value='" + fullname + "'  /> <br>";
      poststr += "<input name='email' id='email' value='" + email + "'   /> <br>";
      poststr += "<input type='text' id='productinfo' name='productinfo' value='" + productinfo + "'> <br>";
      poststr += "<input type='hidden' name='surl' id='surl' value='" + surl + "' /> <br>";
      poststr += "<input type='hidden' name='furl' id='furl' value='" + furl + "' /> <br>";
      poststr += "<input type='hidden' name='hash' id='hash' value='" + hash + "'/> <br>";
      res.json({
        "actionvalue": transactionURL,
        "value": poststr
      });

      break;
    case "Instamojo":

      var check_api_url = protocolStr + '://' + req.get('host') + "/api/public/onlinepaymentsuccess?orderid=" + billid;
      key = Config['key_id'];
      var token = Config['token'];

      const Insta = require('instamojo-nodejs');
      Insta.setKeys(key, token);
      const data = new Insta.PaymentData();

      if (Config.transaction_mode && Config.transaction_mode == "Development") {
        Insta.isSandboxMode(true);
      }

      data.purpose = billid;
      data.amount = amount;
      data.buyer_name = fullname;
      data.redirect_url = check_api_url;
      data.email = email;
      data.phone = phone;
      data.send_email = false;
      data.webhook = 'http://www.example.com/webhook/';
      data.send_sms = false;
      data.allow_repeated_payments = false;

      Insta.createPayment(data, function (error, response) {

        const responseData = JSON.parse(response);
        if (error) {
          // some error
          console.log("error", error);
        } else if (responseData.success) {
          const redirectUrl = responseData.payment_request.longurl;
          res.status(200).json(redirectUrl);
        }
      });
      break;
    case "Easebuzz":

      key = Config['key_id'];
      salt = Config['salt'];

      var hash_str = key + '|' + billid + "|" + amount + '|' + productinfo + '|' + fullname + '|' + email + '|||||||||||' + salt;
      var hash = crypto.createHash('sha512').update(hash_str).digest("hex");

      var poststr = "";
      poststr += "<input type='hidden' name='key' value='" + key + "' /> <br>";
      poststr += "<input type='hidden' name='txnid' value='" + billid + "' id='txnid' /> <br>";
      poststr += "<input type='hidden' name='firstname' id='firstname' value='" + fullname + "' /> <br>";
      poststr += "<input type='hidden' name='email' id='email' value='" + email + "' /> <br>";
      poststr += "<input type='hidden' name='phone' id='phone' value='" + phone + "' /> <br>";
      poststr += "<input type='hidden' name='amount' id='amount'  value='" + amount + "' /> <br>";
      poststr += "<input type='hidden' id='productinfo' name='productinfo' value='" + productinfo + "'> <br>";
      poststr += "<input type='hidden' name='surl' id='surl' value='" + surl + "' /> <br>";
      poststr += "<input type='hidden' name='furl' id='furl' value='" + furl + "' /> <br>";
      poststr += "<input type='hidden' name='hash' id='hash' value='" + hash + "'/> <br>";

      console.log("poststr", poststr);

      res.json({
        "actionvalue": transactionURL,
        "value": poststr
      });
      break;

    case "Stripe":

      var key = Config['key_id'];

      res.json({
        "actionvalue": "stripe",
        "publishablekey": key,
        "secretkey": secretkey,
        "amount": amount,
        "name": fullname,
        "email": email,
        "productinfo": productinfo,
        "currency": currency,
        "orderid": billid //savedOrder._id
      });
      break;

    case "Razorpay":

      let instance = new Razorpay({
        key_id: Config['key_id'],
        key_secret: Config['key_secret']
      })

      instance.orders.create({
        amount: amount * 100,
        currency: currency,
        receipt: billid,
        payment_capture: true
      }, (error, response) => {
        console.log("error", error, response)
        if ((error)) {
          res.json({ "status": "error", "type": "razorpay", "error": error });
        } else {
          let obj = {
            orderid: billid,
            key: key,
            amount: amount,
            currency: currency,
            name: productinfo,
            description: productinfo,
            image: bill.branchid.branchlogo,
            razorpay_order_id: response.id,
            prefill: {
              name: fullname,
              email: email,
              contact: ""
            },
            notes: {
              address: "note value"
            },
            theme: {
              color: "#9DF44F"
            }
          }
          res.json({ status: "success", type: "razorpay", actionvalue: "razorpay", data: obj });
        }
      });
      break;
    case "WebXPay":
      var toEncrypt = billid + "|" + amount;
      var absolutePath = path.resolve('./uploads/webxpay.pem');
      var publicKey = fs.readFileSync(absolutePath, "utf8");
      var buffer = Buffer.from(toEncrypt);
      var key_id = Config['key_id'];
      var encrypted = crypto.publicEncrypt(publicKey, buffer);
      var payment = encrypted.toString("base64");
      var poststr = "";
      poststr += "<input type='text' name='first_name' value='" + fullname + "' /> <br>";
      poststr += "<input type='text' name='last_name' value='" + fullname + "' /> <br>";
      poststr += "<input type='text' name='email' value='" + email + "' /> <br>";
      poststr += "<input type='text' name='contact_number'  value='" + '774672665' + "' /> <br>";
      poststr += "<input type='hidden' name='secret_key' value='" + key_id + "' /> <br>";
      poststr += "<input type='hidden' name='payment' value='" + payment + "' /> <br>";
      poststr += "<input type='text' name='process_currency'  value='LKR' /> <br>";
      poststr += "<input type='text' name='cms' value='JAVASCRIPT' /><br>";
      console.log("poststr", poststr)
      res.json({
        "actionvalue": transactionURL,
        "value": poststr
      });
      break;

    case "Magpie": 

      const axios = require('axios')  
      var url = `https://pay.magpie.im/api/v2/sessions`
      var publickey = Buffer.from(secretkey + ':').toString('base64');
      surl = surl + "?magpiebillid=" + billid;
      //console.log("surl", surl)
      var description =''
      if (bill.paymentterms && bill.paymentterms.membershipid){
        description = bill.paymentterms.membershipid.membershipname;
      }
      var res1 = await axios.post(url,
        JSON.stringify({
          billing_address_collection: true,
          cancel_url: furl,
          client_reference_id: billid,
          currency: currency,
          line_items: [
            {
              name: productinfo,
              description: description,
              quantity: 1,
              amount: amount * 100,
              currency: currency
            }
          ],
          locale: 'en',
          metadata: {},
          payment_method_types: ['card', 'bpi', 'bdo', 'pnb', 'metrobank', 'unionbank', 'rcbc', 'paymaya', 'gcash', 'alipay', 'wechat', 'unionpay'],
          shipping_address_collection: { allowed_countries: ['PH'] },
          submit_type: 'pay',
          success_url: surl
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + publickey // + Buffer.from('pk_test_6CPvm9uHz2RR39zGmUn0Vj:').toString('base64')
          },
        },
      )
      //console.log("res1.data.payment_url", res1.data.payment_url)
      res.json(res1.data.payment_url);
      break;
    default:
    // code block
  }

}

async function onlinepaymentsuccess(req, res, next) {

  var txnid, billid, paymentmode
  // PayTM
  if (req.body.ORDERID && req.body.TXNID) {
    txnid = req.body.TXNID
    billid = req.body.ORDERID
  }
  // PayU
  if (req.body.txnid && req.body.mihpayid) {
    txnid = req.body.mihpayid
    billid = req.body.txnid
  }
  // Stripe
  if (req.body.txnid && req.body.billid) {
    txnid = req.body.txnid
    billid = req.body.billid,
      paymentmode = "Stripe"
  }
  // EaseBuzz
  if (req.body.txnid && req.body.easepayid) {
    txnid = req.body.easepayid
    billid = req.body.txnid,
      paymentmode = "EaseBuzz"
  }
  // Instamojo
  if (req.query.orderid && req.query.payment_id) {
    txnid = req.query.payment_id
    billid = req.query.orderid,
      paymentmode = "Instamojo"
  }
  // Razorpay
  if (req.body.razorpay_payment_id && req.body.razorpay_order_id) {
    txnid = req.body.razorpay_payment_id
    //order_id = req.body.razorpay_order_id
    billid = req.body.orderid,
      paymentmode = "Razorpay"
  }
  // Magpie
  if (req.query.magpiebillid) {
    billid = req.query.magpiebillid,
    paymentmode = "Magpie"
  }
  // WebXPay
  if (req.body.payment && req.body.signature) {
    var payment = req.body.payment
    var signature = req.body.signature

    var absolutePath = path.resolve('./server/integrations/webxpay.pem');
    var publicKey = fs.readFileSync(absolutePath, "utf8");

    let buff = new Buffer(payment, 'base64');
    var buffer = buff.toString('ascii');
    var decrypted = crypto.publicDecrypt(publicKey, buffer);
    //var toEncrypt = billid + "|" + amount;
    var split = decrypted.split("|");
    if (split.length > 1)
      billid = split[0];
    paymentmode = "WebXPay"
  }
  var docnumber;
  if (req.body.STATUS && req.body.STATUS != "TXN_SUCCESS") {
    res.status(301).redirect("https://pay.membroz.com/#/payment-fail")
  }
  else {

    if (billid && billid.indexOf("Billid") > -1) {

      var billid = billid.substring(6)
      var bill = await Bill.findById(billid);
      docnumber = bill.docnumber;
      var branch = bill.branchid;
      var prefix;
      if (DATABASETYPE == "branchwise") {
        var docformat = branch.docformat;
        prefix = docformat.poformat ? docformat.poformat["prefix"] : "BP";
      } else {
        var docformat = BILLFORMAT;
        if (docformat)
          prefix = docformat.poformat ? docformat.poformat["prefix"] : "BP";
      }
      Billpayment.getnextdocnumber(prefix, branch._id)
        .then((receiptnumber) => {
          var billpayment = {
            receiptnumber: receiptnumber,
            prefix: prefix,
            billid: bill._id,
            customerid: bill.customerid._id,
            onModel: bill.onModel,
            paymentdate: new Date(),
            branchid: branch._id,
            paidamount: bill.balance
          }

          Billpayment(billpayment).save(req).then(billpayment => {
            bill.paidamount += bill.balance
            bill.balance = 0;
            bill.status = "Paid";
            bill.save(req).then();
          })

        });

    }
    if (billid && billid.indexOf("id") > -1) {

      var paymentscheduleid = billid.substring(2)
      var paymentschedule = await Paymentschedule.findById(paymentscheduleid);
      docnumber = paymentschedule.docnumber;
      var branch = paymentschedule.branchid;

      var prefix = "";

      if (DATABASETYPE == "branchwise") {
        var docformat = branch.docformat;
        prefix = docformat.receipt ? docformat.receipt["prefix"] : "RE";
      } else {
        var docformat = BILLFORMAT;
        if (docformat)
          prefix = docformat.receipt ? docformat.receipt["prefix"] : "RE";
      }

      Payment.getnextdocnumber(prefix, branch._id)
        .then((receiptnumber) => {

          var payment = {
            receiptnumber: receiptnumber,
            prefix: prefix,
            item: paymentschedule._id,
            memberid: paymentschedule.memberid._id,
            paymentdate: new Date(),
            branchid: branch._id,
            paidamount: paymentschedule.balance,
            totalamount: paymentschedule.balance,
            amount: paymentschedule.balance
          }

          Payment(payment).save(req).then(payment => {
            paymentschedule.paidamount += paymentschedule.balance
            paymentschedule.balance = 0;
            paymentschedule.status = "Paid";
            paymentschedule.save(req).then();
          })

        });

    }

    if (paymentmode == 'Stripe') {
      res.json({
        "redirectUrl": "https://pay.membroz.com/#/payment-succ?id=" + txnid + "&doc=" + docnumber
      });
    } else if (paymentmode == 'Razorpay') {
      res.json({
        "redirectUrl": "https://pay.membroz.com/#/payment-succ?id=" + txnid + "&doc=" + docnumber
      });
    }
    else {
      res.writeHead(302, {
        'Location': "https://pay.membroz.com/#/payment-succ?id=" + txnid + "&doc=" + docnumber
      });
      res.end();
    }

  }
}

async function onlinepaymentfail(req, res) {
  res.status(301).redirect("https://pay.membroz.com/#/payment-fail");
  //console.log("req.body", req.body)
  // res.writeHead(301, {
  //   'Location': "https://pay.membroz.com/#/payment-fail"
  // });
  res.end();
}

async function stripesuccess(req, res, next) {

  if (req.body.orderid) {

    var txnid;
    var billid;
    var secretkey = req.body.secretkey;
    const stripe = require("stripe")(secretkey);
    billid = req.body.orderid

    stripe.charges.create({
      amount: req.body.amount,
      currency: req.body.currency,
      source: req.body.source
    }, (err, charge) => {

      txnid = charge.id
      if (err) {
        //console.log("errror", err);
        throw err;
      }
      req.body.txnid = txnid
      req.body.billid = billid
      next();

    })
  }

}

