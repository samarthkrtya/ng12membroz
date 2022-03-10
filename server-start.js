process.env.PORT = '3001'
process.env.JWT_SECRET = '0a6b944d-d2fb-46fc-a85e-0295c986cd9f'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = false

//process.env.MONGO_HOST='mongodb://localhost:27017/membroz2'
process.env.MONGO_HOST = 'mongodb://membrozdbuser:Pass1234@membrozdbmumbai-shard-00-00-nagea.mongodb.net:27017,membrozdb-mumbai-shard-00-01-nagea.mongodb.net:27017,membrozdb-mumbai-shard-00-02-nagea.mongodb.net:27017/membroz-qa?ssl=true&replicaSet=MembrozDB-Mumbai-shard-0&authSource=admin&retryWrites=true'



process.env.MONGO_PORT = '27017'


// Xero Credentials
process.env.XERO_CLIENT_ID="3F9A34425F9345EBB6C277BF061DC2F4"
process.env.XERO_CLIENT_SECRET="SIQHXb1nlNEXlDa0vDOF5rl9uNekaFNHCSxNdce4JgChERGp"
process.env.XERO_REDIRECT_URL="https://hr.commercialsafety.com.au/xerocallback"
process.env.XERO_ACCOUNT_CODE=090

require('babel-register');
require("babel-polyfill");
require('./server');
