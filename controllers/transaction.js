const {Buy} = require('../services/buy');

const buyticket = async (req, res) => {
  const {
    timestamp
  } = req.params;
  const {
    lineId,
    options
  } = req.body;
  // ticketClass : ['GEN', 'VIP', 'OFC'];
  // paymentOption : ['POINT', 'BONUS'];
  // ticketType : ['Wanita', 'Siswa', 'Dewasa']
  // cases : NOT_FOUND // IF THERE IS NO SHOWS AVAILABLE
  // ALREADY_BOUGHT // IF THE USER IS ALREADY BUY THE TICKET FOR SPECIFIED TIMESTAMP
  // NOT_OPEN // IF THE TICKET IS NOT YET AVAILABLE TO BUY  // currently mapped to NOT_AVAILABLE
  // SOLD_OUT // IF THERE IS NO TICKET AVAILABLE // currently mapped to NOT_AVAILABLE
  // NEED_TICKET_CLASS // IF THERE IS NO ticketClass available
  // NEED_TICKET_TYPE // IF THERE IS NO ticketType available
  // NEED_PAYMENT_METHOD // IF THERE IS NO paymentMethod available
  // NOT_ENOUGH_BALANCE // IF THE BALANCE IS NOT ENOUGH TO BUY THE TICKET
  // NEED_CONFIRMATION // FINALIZE BUY TRANSACTION
  // SUCCESS // PURCHASE IS DONE

  try {
    const buy = new Buy();
    const purchaseResult = await buy.purchaseTicket(lineId, timestamp, options);
    res.status(200).send(purchaseResult);
  } catch (e) {
    res.status(200).send({
      error: e
    })
  }

}

const getPoint = async (req, res) => {
  const { lineId } = req.params;
  console.log(`getting point for userId ${lineId}`);
  try {
    const points = await buy.getPoint(lineId);
    res.status(200).send(points);
  } catch (e) {
    res.status(400).send({
      error: e
    })
  }
} 



module.exports = {
  buyticket,
  getPoint
}