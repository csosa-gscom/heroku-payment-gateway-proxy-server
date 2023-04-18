//Ekyash + Digiwallet Proxy Server

const express = require("express");
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');
const bodyParser = require('body-parser');
const CryptoJS = require("crypto-js");

const app = express();

const digiWalletUserName = '501203278252';
const digiWalletPassword = '052004';
const digiWalletBrandID = '977'
const digiWalletDestinationAccount = '5012235128';

const ekyashAppKey = 'APPKEY17-07A8-4BAF-AA0F-B1568C5017A3'
const ekyashPinHash = '62baa44d7cf5b1359f19b1f536512dbe5713a94b04aeda70bf64456d3615eb64';
const ekyashSID = '4951091037';

const allowedOrigins = ['https://gs-com.bz', 'https://digiwallet-payment-enabled.myshopify.com','https://digiwallet-script-test.myshopify.com']
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST']
};

app.use(cors(corsOptions)); 

// Create a root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to Ekyash + Digiwallet Proxy Server');
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

app.post('/authorization', bodyParser.json(), (req, res) => {
  const mobileNumber = req.body.mobile;
  const jwtToken = generateJwtToken(mobileNumber);

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
    url: 'https://mw-api-preprod.e-kyash.com/api/qrpos-app/authorization',
    responseType: 'json',
  };

  // send the request and return the response to the client
  axios(requestOptions)
    .then(response => {
      res.status(200).send(response.data);
    })
    .catch(error => {
      console.log('error', error);
      res.status(500).send('An error occurred');
    });
});

function generateJwtToken(mobileNumber) {

  var header = {
    "alg": "HS256",
    "typ": "JWT"
  };
  var stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
  var encodedHeader = CryptoJS.enc.Base64.stringify(stringifiedHeader);
  var data = {
    "mobile": mobileNumber
  };
  var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
  var encodedData = CryptoJS.enc.Base64.stringify(stringifiedData);
  var token = encodedHeader + "." + encodedData;
  var signature = CryptoJS.HmacSHA256(token, ekyashAppKey);
  signature = CryptoJS.enc.Base64.stringify(signature);
  var jwtToken = token + "." + signature;
  return jwtToken;
}

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});