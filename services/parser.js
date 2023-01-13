const cheerio = require('cheerio');
const fs = require('fs');
const _ = require('lodash');

/**
 * 
 * @param {Object} page 
 * @param {String} date 
 * @param {String} hour 
 * @param {String} type 
 * @return {String}
 */
const getPurchaseLink = (page, date, hour, type) => {
  const showsPage = page || fs.readFileSync('./showsPageWithLogin.html', 'utf-8')
  let $ = cheerio.load(page || showsPage);
  const dates = date.split('.');
  const time = hour.split(':');

  const post = $('.post').html();
  $ = cheerio.load(post);
  const schedule = $('table').html();

  let link
  $('tr', schedule).each((i, el) => {
    const schedule = $(el).children('td').first().text();
    const regexString = `(${Number(dates[0])}\.${dates[1]}\.${dates[2]}\\n\\s*Show ${time[0]}\\:${time[1]}).*`
    const regex = new RegExp(regexString, 'gm');
    if (regex.test(schedule)) {
      if (type === 'VIP') {
        const a = $(el).html();
        link = $(a).children('a').attr('href');
      } else if (type === 'OFC') {
        const a = $(el).next().html();
        link = $(a).children('a').attr('href')
      } else {
        const a = $(el).next().next().html();
        link = $(a).children('a').attr('href')
      }
    }
  })
  return link
}

const getCompletionLink = (page) => {
  const parsed = page || fs.readFileSync('./a.html', 'utf-8');
  const $ = cheerio.load(parsed);

  return $('.submitHolder').children('a').attr('href')
}

module.exports = {
  getPurchaseLink,
  getCompletionLink
};