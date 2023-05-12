//Ekyash + Digiwallet Proxy Server

const express = require("express");
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');
const bodyParser = require('body-parser');
const CryptoJS = require("crypto-js");

const port = process.env.PORT || 3000;
const app = express();

const digiWalletUserName = '501203278252';
const digiWalletPassword = '052004';
const digiWalletBrandID = '977'
const digiWalletDestinationAccount = '5012235128';

const ekyashAppKey = 'APPKEY17-07A8-4BAF-AA0F-B1568C5017A3'
const ekyashPinHash = '38e7de029369de8343bfb7b196bf4c0cf5f2f10caa71fa73965831d8b8e4cda0';
const ekyashSID = '4981612327';
const jwtToken = generateJwtToken();

const allowedOrigins = ['https://gs-com.bz', 'https://digiwallet-payment-enabled.myshopify.com', 'https://ekyash-integration-site.myshopify.com']
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST']
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('GS-COM Proxy Server; Up and Running');
});

app.post('/send-xml', bodyParser.raw({ type: 'text/xml' }), (req, res) => {
  const data = req.body;

  // Parse XML data into a JavaScript object
  xml2js.parseString(data, (err, result) => {
    if (err) {
      res.status(500).send('An error occurred while parsing the request.');
    } else {
      // Modify the object properties as desired
      if (result.TCSRequest.Function[0].$.name === 'SALESREQUESTEXECTOSELF') {
        result.TCSRequest.UserName = digiWalletUserName;
        result.TCSRequest.Password = digiWalletPassword;
      } else if (result.TCSRequest.Function[0].$.name === 'SALESREQUESTMERCHANT_OTP') {
        result.TCSRequest.UserName = digiWalletUserName;
        result.TCSRequest.Password = digiWalletPassword;
        result.TCSRequest.Function[0].Param1 = digiWalletBrandID;
        result.TCSRequest.Function[0].Param6 = digiWalletDestinationAccount;
      }

      // Convert the object back into XML
      const builder = new xml2js.Builder();
      const updatedData = builder.buildObject(result);

      // Send the updated data to the API
      axios.post('https://merchantapi.digiwallet.bz/Telepin', updatedData, { headers: { 'Content-Type': 'text/xml' } })
        .then(response => {
          xml2js.parseString(response.data, (err, result) => {
            if (err) {
              res.status(500).send('An error occurred while parsing the response.');
            } else {
              res.set('Content-Type', 'text/xml');
              res.send(response.data);
            }
          });
        })
        .catch(error => {
          console.log(error);
          res.status(500).send('An error occurred while making the request.');
        });
    }
  });
});

app.post('/create-new-invoice', bodyParser.json(), (req, res) => {
  console.log('create new incoice endpoint started');
  const invoiceData = req.body;
  console.log('invoice Data: ', invoiceData);
  makeAuthApiCall((error, session)=>{
    console.log('makeAuthApiCall started');
    if (error) {
      // Handle the error in some way, e.g. send an error response to the client
      return res.status(500).json({ error: "Failed to authenticate with e-kyash API" });
    }

    makeInvoiceApiCall(session.session,(error, invoice)=>{
      console.log('make Invoice Api Call started');
      if (error) {
        // Handle the error in some way, e.g. send an error response to the client
        return res.status(500).json({ error: "Failed to create new invoice with e-kyash API" });
      }
      console.log(invoice);
      // Send the invoice data back to the client
      res.json(invoice);
    });
  });
});

function makeAuthApiCall(callback){
  const headers = {
    "Content-Type": "application/json",
    "Accept-Language": "en",
    "The-Timezone-IANA": "Belize",
    "WL": "bibi",
    "IMIE": ekyashAppKey,
    "appVersion": "99.1.1",
    "operatingSystem": "Android",
    "Authorization": `Bearer ${jwtToken}`
  };

  const data = {
    "sid": ekyashSID,
    "pinHash": ekyashPinHash,
    "pushkey": ""
  };

  const requestOptions = {
    headers,
    data,
    method: 'post',
    url: 'https://mw-api.e-kyash.com/api/qrpos-app/authorization',
    responseType: 'json',
  };

  axios(requestOptions)
    .then(response => {
      console.log('inside makeAuthApiCall, the response.data.session is:',response.data.session);
      callback(null, response.data.session);
    })
    .catch(error => {
      callback(error);
    });
}

function makeInvoiceApiCall(sessionID, callback){

  const sessionData = {
    "session": sessionID
  }

  const requestData = {
    ...invoiceData,
    ...sessionData
  };

  axios.post('https://mw-api.e-kyash.com/api/qrpos-app/create-new-invoice', requestData, { headers })
    .then(response => {
      // Check if there was an error in the response
      if (response.data.error) {
        // Call the callback function with the error object
        callback(new Error(response.data.error));
      } else {
        console.log('inside makeInvoice call, the response.data.invoice is:',response.data.invoice);
        // Call the callback function with the invoice data
        callback(null, response.data.invoice);
      }
    })
    .catch(error => {
      // Call the callback function with the error object
      callback(error);
    });
}







function generateJwtToken() {

  var header = {
    "alg": "HS256",
    "typ": "JWT"
  };
  var stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
  var encodedHeader = CryptoJS.enc.Base64.stringify(stringifiedHeader);
  var data = {
    "sid": ekyashSID,
    "pinHash": ekyashPinHash,
    "pushkey": "{{pushkey}}"
  };
  var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
  var encodedData = CryptoJS.enc.Base64.stringify(stringifiedData);
  var token = encodedHeader + "." + encodedData;
  var signature = CryptoJS.HmacSHA256(token, ekyashAppKey);
  signature = CryptoJS.enc.Base64.stringify(signature);
  var jwtToken = token + "." + signature;
  return jwtToken;
}

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

//
///
///
/////
//////
///////
///////
var status;
app.post('/payment-status', bodyParser.json(), (req, res) => {
  status = req.body;
  res.sendStatus(200);
  console.log(status);
});

app.get('/get-payment-status', (req, res) => {
  res.send(status);
  console.log(status);
});

app.post('/create-new-invoice', bodyParser.json(), (req, res) => {
  //gets data from client such orderID, amount, and currency
  const invoiceData = req.body;

  //creates appropriate header to be used for /authorization api call to e-kyash.com
  const headers = {
    "Content-Type": "application/json",
    "Accept-Language": "en",
    "The-Timezone-IANA": "Belize",
    "WL": "bibi",
    "IMIE": ekyashAppKey,
    "appVersion": "99.1.1",
    "operatingSystem": "Android",
    "Authorization": `Bearer ${jwtToken}`
  };

  //apporiate data to be sent to /authorization api call to e-kyash
  const data = {
    "sid": ekyashSID,
    "pinHash": ekyashPinHash,
    "pushkey": ""
  };

  const requestOptions = {
    headers,
    data,
    method: 'post',
    url: 'https://mw-api.e-kyash.com/api/qrpos-app/authorization',
    responseType: 'json',
  };

//does api call
  axios(requestOptions)
    .then(response => {
      
      //Authorization api call returns session ID, we store that value
      const sessionData = {
        "session": response.data.session
      }
//create new data using invoice data and adding session ID to it
      const requestData = {
        ...invoiceData,
        ...sessionData
      };
//create-new-invoice api call
      axios.post('https://mw-api.e-kyash.com/api/qrpos-app/create-new-invoice', requestData, { headers })
        .then(response => {
          //returns data back to client which is link to make payment
          res.send(response.data);
        })
        .catch(error => {
          res.status(500).send(error);
        });
    })
    .catch(error => {
      console.log('error', error);
      res.status(500).send('An error occurred');
    });
});