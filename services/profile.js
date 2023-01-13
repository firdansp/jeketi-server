require('dotenv').config();
const Model = require('../models');
const cookieDB = Model.user_cookie;
const Promise = require('bluebird');
const tough = require('tough-cookie');
const r = require('request');
const MYPAGE = 'mypage?lang=id';
const cheerio = require('cheerio');
const apm = require('./apm');


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

const getProfileSummary = async lineId => {
  const user = await getCookie(lineId);
  apm.setUserContext({
    id: lineId,
    email: user.email
  })
  const mypage = await getMypage(user.cookie);
  const profileSummary = parse(mypage);
  return profileSummary;
}

const getMypage = async cookie => {
  const kue = cookie.split(';');
  const toughCookieJar = new tough.CookieJar(undefined, {
    looseMode: true
  });
  kue.forEach(cookieValue => {
    toughCookieJar.setCookieSync(cookieValue, 'https://jkt48.com')
  });
  const jar = r.jar();
  jar._jar = toughCookieJar;
  const mypage = (await get(MYPAGE, {
    jar
  })).body;

  return mypage
}

const getCookie = (id) => {
  return cookieDB.findOne({
    where: {
      id
    }
  })
}

const parse = (page) => {
  const summary = {};
  const $ = cheerio.load(page);
  const $mypage = $('.mypageInfo').html();
  const length = $('.mypageWrap').length;
  const $nameHtml = $('.hello').html();
  const $hello = cheerio.load($nameHtml);
  summary['Nama'] = $hello('.pinx').text();
  $('.mypageWrap', $mypage).each( (i, el) => {
    let propname;
    let propval;
    if (length > 10 && i < 9) {
      const $a = cheerio.load(el);
      propname = $a('.profileleft').text();
      propval = $a('.profileright').text().trim();
      const regex = /.*?(?=\()/;
      if (propname === 'Barcode') {
        const img = $a('img').attr('src');
        propval = `https://jkt48.com${img}`;
      }
      if (propval.includes('(')) {
        propval = propval.match(regex)[0];
      }
    } else if (i < 7){
      const $a = cheerio.load(el);
      propname = $a('.profileleft').text();
      propval = $a('.profileright').text().trim();
      const regex = /.*?(?=\()/;
      if (propname === 'Barcode') {
        const img = $a('img').attr('src');
        propval = `https://jkt48.com${img}`;
      }
      if (propval.includes('(')) {
        propval = propval.match(regex)[0];
      }
    }
    propname ? summary[propname] = propval : '';
  })

  return summary;
}

module.exports = {
  getProfileSummary
}