const showsDatastore = require('../services/showService');
const models = require('../models');
const alias = models.alias;

const getAll = async (req, res, next) => {
  res.send(await showsDatastore.findAll())
}

const getBySetlist = async (req, res, next) => {
  const setlists = await showsDatastore.getBySetlist(req.params.setList);
  if (setlists) {
    res.send(setlists);
  } else {
    res.status(404).send('not found')
  }
}

const getMembersByShow = async (req, res, next) => {
  const performers = await showsDatastore.getMembersByShow(req.params.showId);
  if (performers) {
    res.send(performers);
  } else {
    res.status(404).send('not found');
  }
}

module.exports = {
  getAll,
  getBySetlist,
  getMembersByShow
}