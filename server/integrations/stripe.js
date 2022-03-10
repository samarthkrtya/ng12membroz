const express = require('express')
const router = express.Router(); // eslint-disable-line new-cap

var Publishable_Key = 'pk_live_BwgnWy4q3benApLOIKUcMZK200NbAnY0F7'
var Secret_Key = 'sk_live_JYQzdnyzBNRQ9DfROQKTyHlz00fGog9m8I'

const stripe = require('stripe')(Secret_Key)

router.get('/stripe', function(req, res){
    res.render('Home', {
       key: Publishable_Key
    })
})

router.post('/stripe/payment', function(req, res){

    // Moreover you can take more details from user
    // like Address, Name, etc from form
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Gourav Hammad',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '452331',
            city: 'Indore',
            state: 'Madhya Pradesh',
            country: 'India',
        }
    })
    .then((customer) => {

        return stripe.charges.create({
            amount: 7500,     // Charing Rs 25
            description: 'Web Development Product',
            currency: 'INR',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.send("Success")  // If no error occurs
    })
    .catch((err) => {
        res.send(err)       // If some error occurs
    });
})

module.exports = router;
