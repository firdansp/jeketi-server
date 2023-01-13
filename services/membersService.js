require('dotenv').config();
const {Storage} = require('@google-cloud/storage');
const Datastore = require('../classes/datastore');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const datastore = new Datastore();
const Axios = require('axios');
const ONE_HOUR = 1000 * 60 * 60 * 1;
const MEMBERS_SCRAPER_URL = process.env.MEMBERS_SCRAPER_URL;

const storage = new Storage({
  projectId: 'f4-dev-circle',
  keyFilename: './f4_Dev_Circle-173ac7f8346c.json'
})

const bucket = storage.bucket('aurora-bot');

const membersScheduler = async () => {

try {
  const members = await Axios.get(MEMBERS_SCRAPER_URL)
  members.data.map(async member => {
    // console.log(`processing ${member.name}`)
    const result = await datastore.queryDatastore('Member', [
      ['name', '=', member.name]
    ])
    if (result.length !== 0) {
      if (result[0] !== member) {
        if (result[0].imgURL !== member.imgURL) {
          savePhoto(member.imgURL, member.name)
        }
        await datastore.insert('Member', Number(result[0][datastore.KEY].id), member)
      }
    } else {
      // console.log('saving new entry')
      await datastore.insert('Member', null, member)
      await savePhoto(member.imgURL, member.name)
    }
  })
} catch (e) {
  console.error(e.data)
}

  setInterval(async () => {
    try {
      const members = await Axios.get(MEMBERS_SCRAPER_URL)
      members.data.map(async member => {
        // console.log(`processing ${member.name}`)
        const result = await datastore.queryDatastore('Member', [
          ['name', '=', member.name]
        ])
        if (result.length !== 0) {
          if (result[0] !== member) {
            if (result[0].imgURL !== member.imgURL) {
              await savePhoto(member.imgURL, member.name)
            }
            await datastore.insert('Member', Number(result[0][datastore.KEY].id), member)
          }
        } else {
          // console.log('saving new entry')
          await datastore.insert('Member', null, member)
          await savePhoto(member.imgURL, member.name)
        }
      })
    } catch (e) {
      console.error(e.data)
    }
  }, ONE_HOUR)
}

const savePhoto = async (url, memberName) => {
  return new Promise( async (resolve, reject) => {
    // console.log(`uploading ${memberName}`)
    const photo = await Axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    })
    const YEAR = moment().format('YYYY');
    const NOW = moment().format('MM-DD');
  
    const file = bucket.file(`members_photos/${YEAR}/${memberName}_${NOW}.jpg`);
    photo.data.pipe(file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg'
      }
    }))
  
    file.on('finish', () => {
      // console.log(`done uploading ${memberName}`)
      resolve()
    })
  })
}

module.exports = {
  membersScheduler
}