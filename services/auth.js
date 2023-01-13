require('dotenv').config();
const Model = require('../models');
const cookieDB = Model.user_cookie;
const axios = require('axios');

const login = async (email, password, lineId) => {
  try {
    const response = await axios.post(process.env.PPTR, {
      email,
      password
    });

    const cookieString = response.data.cookies;

    await cookieDB.create({
      id: lineId,
      cookie: cookieString,
      email
    });
  } catch (e) {
    console.error(e);
    throw e.response.data;
  }
};

const checkLogin = async (lineId) => {
  try {
    const result = await cookieDB.findByPk(lineId);
    console.log(result)
    return result ? true : false;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

const logout = async (id) => {
  try {
    const result = await cookieDB.destroy({
      where: {
        id
      }
    });
    return result ? true : false;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

module.exports = {
  login,
  logout,
  checkLogin
}