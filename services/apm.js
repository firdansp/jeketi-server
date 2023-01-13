require('dotenv').config();
const apm = require('elastic-apm-node').start({
  serviceName: process.env.SERVICE_NAME,
  secretToken: process.env.SECRET_TOKEN,
  serverUrl: process.env.APM_SERVER
})

module.exports = apm;