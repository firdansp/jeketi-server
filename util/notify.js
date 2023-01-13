require('dotenv').config();
const axios = require('axios');
const notifyURL = process.env.NOTIFY_URL;

const notify = data => {
  return axios.post(`${notifyURL}-notification`, data);
}

module.exports = notify;