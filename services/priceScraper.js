const Promise = require('bluebird');
const tough = require('tough-cookie');
const r = require('request');
const PRICELIST_URL = 'jktpoints/form?lang=id';
const cheerio = require('cheerio');
const fs = require('fs');
const Model = require('../models');
const cookieDB = Model.user_cookie;


const req = r.defaults({
  baseUrl: 'https://jkt48.com/',
  headers: {
    'Host': 'jkt48.com',
    'Connection': 'Keep-Alive',
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': 1,
    'DNT': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.7,ja;q=0.3',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  gzip: true,
  followAllRedirects: true,
  rejectUnauthorized: false
})

const get = Promise.promisify(req.get);
const post = Promise.promisify(req.post);

const getPricelistPage = async cookie => {
  const kue = cookie.split(';');
  const toughCookieJar = new tough.CookieJar(undefined, {
    looseMode: true
  });
  kue.forEach(cookieValue => {
    toughCookieJar.setCookieSync(cookieValue, 'https://jkt48.com')
  });
  const jar = r.jar();
  jar._jar = toughCookieJar;
  const page = (await get(PRICELIST_URL, {
    jar
  })).body;

  return {jar, page};
}

const getPoints = page => {
  const $page = cheerio.load(page);
  const points = [];

  $page('#buy_points option').each((i, el) => {
    const $el = cheerio(el);
    const text = $el.attr('label');
    if (text && text !== '----') {
      points.push(text);
    }
  });
  return points;
}

const checkPoints = (page, point) => {
  const $page = cheerio.load(page);
  const points = {};

  $page('#buy_points option').each((i, el) => {
    const $el = cheerio(el);
    const text = $el.attr('label');
    const value = $el.attr('value')
    if (text !== '----') {
      points[text] = value;
    }
  });
  return points[point.toUpperCase()] || null;
}

const getConfirmationLink = page => {
  const $page = cheerio.load(page);
  return $page('form').attr('action');
}

const getConfirmationFormLink = page => {
  const $page = cheerio.load(page);
  const $url = $page('.submitHolder');
  const url = $page('a', $url).last().attr('href');
  return url;
}

const getConfirmationPage = (link, form, jar) => {
  return post(link, {form, jar});
}

const getTopupLink = async (link, jar) => {
  const resp = await get(link, {jar});
  console.log(resp.request.href);
  return resp.request.href
}


const buyPoint = async (amount, lineId) => {
  const form = {
    buy_points: amount,
    'payment_method': 3,
    'agree': 1,
    'x': 0,
    'y': 0,
  }
  // get cookie
  const userDetail = await cookieDB.findByPk(lineId);
  const { cookie, email } = userDetail;
  // get points page
  const {jar, page} = await getPricelistPage(cookie);
  // get points available
  const availablePoints = getPoints(page);
  // verify points
  const selectedAmount = checkPoints(page, amount);
  // get confirmation link
  const confirmationLink = getConfirmationLink(page);
  // get confirmation page
  const confirmationPage = (await getConfirmationPage(confirmationLink, form, jar)).body;
  const confirmationForm = getConfirmationForm(confirmationPage);
  const confirmationFormLink = getConfirmationFormLink(confirmationPage);
  // get CC topup link
  const topupLink = getTopupLink(confirmationFormLink, jar);
}

const getConfirmationForm = page => {
  const $page = cheerio.load(page);
  const $pointsConfirmation = $page('.pinktable')[0];
  const $profileDetail = $page('.pinktable')[1];
  const pointsConfirmation = {};
  const profileDetail = {};
  $page('tr', $pointsConfirmation).each( (i, el) => {
    const $el = cheerio.load(el);
    const $row = $el('td');
    const prop = $row[0].children[0].data;
    const val = $row[1].children[0].data;
    pointsConfirmation[prop] = val.trim();
  });
  $page('tr', $profileDetail).each( (i, el) => {
    const $el = cheerio.load(el);
    const $row = $el('td');
    const prop = $row[0].children[0].data;
    const val = $row[1].children[0].data;
    profileDetail[prop] = val.trim();
  });


  return {
    pointsConfirmation,
    profileDetail
  }
}

const getAvailableAmounts = async (lineId) => {
  const { cookie } = await cookieDB.findByPk(lineId);
  const { page } = await getPricelistPage(cookie);
  const amounts = getPoints(page);
  return amounts;
}

const verifyPoints = async (lineId, amount) => {
  const { cookie } = await cookieDB.findByPk(lineId);
  const { page } = await getPricelistPage(cookie);
  const amountnumeral = checkPoints(page, amount);
  return amountnumeral;
}

const getPaymentDetail = async (lineId, amount) => {
  const { cookie } = await cookieDB.findByPk(lineId);
  const { jar, page } = await getPricelistPage(cookie);
  const confirmationLink = getConfirmationLink(page);
  const form = {
    buy_points: amount,
    'payment_method': 3,
    'agree': 1,
    'x': 0,
    'y': 0,
  }
  const confirmationPage = (await getConfirmationPage(confirmationLink, form, jar)).body;
  const confirmation = getConfirmationForm(confirmationPage);
  const confirmationFormLink = getConfirmationFormLink(confirmationPage);
  const topupLink = await getTopupLink(confirmationFormLink, jar);
  return {
    confirmation,
    topupLink
  };
}


module.exports = {
  getAvailableAmounts,
  verifyPoints,
  getPaymentDetail
}
