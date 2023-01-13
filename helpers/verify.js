require('dotenv').config();
const verify = (req, res, next) => {
  if (req.headers['x-api-key'] === process.env.API_KEY) {
    next()
  } else {
    res.status(401).send();
  }
}

module.exports = verify;