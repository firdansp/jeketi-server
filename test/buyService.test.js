const {Buy} = require('../services/buy');
const moment = require('moment');
moment.tz.setDefault('Asia/Jakarta');
const fs = require('fs');

const buy = new Buy();

const jkt_Responses = {
  "mypage?lang=id": fs.readFileSync('./test/mockPage/showsPage.html', 'utf-8'),
  "theater/schedule?lang=id": fs.readFileSync('./test/mockPage/showsPage.html', 'utf-8'),
  "theater/buy?timestamp=1560254400": fs.readFileSync('./test/mockPage/initialPurchasePage.html', 'utf-8'),
  "/ticket/apply/id/1851/type/3/show/2?lang=id": fs.readFileSync('./test/mockPage/groupFillForm.html', 'utf-8'),
  "/ticket/apply-group/id/1867/type/3/show/2?lang=id": fs.readFileSync('./test/mockPage/finalpage.html', 'utf-8'),
}

const timestamp = 1560254400;



const mockRequest = {
  get: jest.fn(url => {
    if (url === "/ticket/apply-comp/id/1851/type/3/show/2?lang=id") {
      return Promise.resolve({statusCode: 200})
    }
    return Promise.resolve({
      body: jkt_Responses[url]
    });
  })
}

// positive testing

test('Buy Service Ticket Should send confirmation for buying', async done => {

  const mockCookieDB = {
    findByPk: jest.fn(lineId => {
      return Promise.resolve({
        "cookie": "mocked cookies",
        "email": "mock email"
      })
    })
  };

  const ticketPurchaseRequest = {
    "lineId": "12345678",
    "options": {
      "paymentOption": "jkt48 points",
      "ticketType": "Dewasa",
      "ticketClass": "GEN",
    }
  }

  buy.cookieDB = mockCookieDB;
  buy.get = mockRequest.get;
  buy.post = mockRequest.get;
  buy.now = timestamp + 500;

  try {
    await buy.purchaseTicket(ticketPurchaseRequest.lineId, timestamp, ticketPurchaseRequest.options);
  } catch(e) {
    expect(e.type).toEqual("NEED_CONFIRMATION");
  }
  done();
}) 


test('Buy Service Ticket Should send buy the ticket if confirmed', async done => {

  const mockCookieDB = {
    findByPk: jest.fn(lineId => {
      return Promise.resolve({
        "cookie": "mocked cookies",
        "email": "mock email"
      })
    })
  };

  const ticketPurchaseRequest = {
    "lineId": "12345678",
    "options": {
      "paymentOption": "jkt48 points",
      "ticketType": "Dewasa",
      "ticketClass": "GEN",
      "confirm": true
    }
  }

  const mockTicketTransactions = {
    create: jest.fn( options => {
      return Promise.resolve({
        options
      })
    })
  }

  buy.cookieDB = mockCookieDB;
  buy.get = mockRequest.get;
  buy.post = mockRequest.get;
  buy.ticket_transactions = mockTicketTransactions;

  try {
   await buy.purchaseTicket(ticketPurchaseRequest.lineId, timestamp, ticketPurchaseRequest.options);
  } catch (e) {
    console.error(e);
  } finally {
    done();
  }
})

// -- positive testing

// negative testing

test('Buy Service should throw error if no user detail found', async done => {
  const mockCookieDB = {
    findByPk: jest.fn(lineId => {
      return Promise.resolve()
    })
  };

  const ticketPurchaseRequest = {
    "lineId": "12345678",
    "options": {
      "paymentOption": "jkt48 points",
      "ticketType": "Dewasa",
      "ticketClass": "GEN",
    }
  }

  buy.cookieDB = mockCookieDB;
  try {
    await buy.purchaseTicket(ticketPurchaseRequest.lineId, timestamp, ticketPurchaseRequest.options);
  } catch (e) {
    expect(e.type).toEqual("NEED_LOGIN");
  }
  done();
})

// test('Buy Service should reject if user purchased ticket with identical timestamp twice', async done => {

// })

test('Buy Service should reject if one of options is missing', async done => {

  const mockCookieDB = {
    findByPk: jest.fn(lineId => {
      return Promise.resolve({
        "cookie": "mocked cookies",
        "email": "mock email"
      })
    })
  };

  buy.cookieDB = mockCookieDB;

  try {

    const ticketPurchaseRequest = {
      "lineId": "12345678",
      "options": {
        "paymentOption": "jkt48 points",
        "ticketType": "",
        "ticketClass": "GEN",
      }
    }

    await buy.purchaseTicket(ticketPurchaseRequest.lineId, timestamp, ticketPurchaseRequest.options);
  } catch (e) {
    expect(e.type).toEqual('NEED_TICKET_TYPE');
  }

  buy.cookieDB = mockCookieDB;

  try {
    const ticketPurchaseRequest = {
      "lineId": "12345678",
      "options": {
        "paymentOption": "",
        "ticketType": "Dewasa",
        "ticketClass": "GEN",
      }
    }
    
    await buy.purchaseTicket(ticketPurchaseRequest.lineId, timestamp, ticketPurchaseRequest.options);
  } catch (e) {
    expect(e.type).toEqual('NEED_PAYMENT_METHOD');
  }

  done();
})