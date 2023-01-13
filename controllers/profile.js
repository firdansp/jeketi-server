const profile = require('../services/profile');

const getProfileSummary = async (req, res) => {
  try {
    const { lineId } = req.params;
    const profileSummary = await profile.getProfileSummary(lineId);
    res.send(profileSummary);
  } catch (e) {
    console.log(e);
    res.status(500).send()
  }
}

module.exports = {
  getProfileSummary
}