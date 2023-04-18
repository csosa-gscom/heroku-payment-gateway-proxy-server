//DigiWallet Ready Proxy Server

// const express = require("express"); // http framework
// const cors = require('cors'); //CORS Policy
// const axios = require('axios'); //HTTP client for JavaScript.
// const xml2js = require('xml2js'); //xml parser
// const bodyParser = require('body-parser'); 
// const CryptoJS = require("crypto-js");


// const app = express();
// const parser = new xml2js.Parser();

// let port = process.env.PORT || 3000;

// // const corsOptions = {
// //   origin: ['*'],
// //   methods: ['GET', 'POST']
// // };

// // app.use(cors(corsOptions));

// app.use(cors());

// app.get("/", (req, res) => {
//   res.send("GS-COM Payment Gateway Proxy Server");
// });

// // middleware to parse XML requests
// app.use(bodyParser.raw({ type: 'text/xml' }));

// app.post('/send-xml', (req, res) => {
//   const data = req.body;

//   // Parse XML data into a JavaScript object
//   xml2js.parseString(data, (err, result) => {
//     if (err) {
//       res.status(500).send('An error occurred while parsing the request.');
//     } else {
//       // Modify the object properties as desired
//       if (result.TCSRequest.Function[0].$.name === 'SALESREQUESTEXECTOSELF'){
//         result.TCSRequest.UserName = '501203278252';
//         result.TCSRequest.Password = '052004';
//       } else if (result.TCSRequest.Function[0].$.name === 'SALESREQUESTMERCHANT_OTP') {
//         result.TCSRequest.UserName = '501203278252';
//         result.TCSRequest.Password = '052004';
//         result.TCSRequest.Function[0].Param1 = '977';

//         result.TCSRequest.Function[0].Param6 = '5012235128';
//       }


//       // Convert the object back into XML
//       const builder = new xml2js.Builder();
//       const updatedData = builder.buildObject(result);

//       // Send the updated data to the API
//       axios.post('https://merchantapi.digiwallet.bz/Telepin', updatedData, { headers: { 'Content-Type': 'text/xml' } })
//         .then(response => {
//           xml2js.parseString(response.data, (err, result) => {
//             if (err) {
//               res.status(500).send('An error occurred while parsing the response.');
//             } else {
//               res.set('Content-Type', 'text/xml');
//               res.send(response.data);
//             }
//           });
//         })
//         .catch(error => {
//           console.log(error);
//           res.status(500).send('An error occurred while making the request.');
//         });
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`http://localhost:${port}`);
// });

//Ekyash + Digiwallet Proxy Server
//Server is able to take in both json and xml request 
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

const ekyashPinHash = '62baa44d7cf5b1359f19b1f536512dbe5713a94b04aeda70bf64456d3615eb64';
const ekyashSID = '4951091037';

// Task #2
// Currently cors is enabled by using the cors libraby however
//everything is enabled by default meaning that any origin can be accepted
// and any method aswell, to add security to our proxy server make it so that only 
// gs-com.bz can be accepted and any of our test/dev sits aswell as only the methods
// we use in this API call

// The cors() middleware function sets the Access-Control-Allow-Origin header to * (which allows requests from any origin), 
//and it also sets other headers such as Access-Control-Allow-Methods and Access-Control-Allow-Headers to enable various types of HTTP requests.

app.use(cors()); //used to enable CORS for the Express application, which allows the client-side code to make requests to the server-side code from different domains.

// middleware to parse XML requests
//app.use(bodyParser.raw({ type: 'text/xml' }));

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

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept-Language", "en");
  myHeaders.append("The-Timezone-IANA", "Belize");
  myHeaders.append("WL", "bibi");
  myHeaders.append("IMIE", "APPKEY17-07A8-4BAF-AA0F-B1568C5017A3");
  myHeaders.append("appVersion", "99.1.1");
  myHeaders.append("operatingSystem", "Android");
  myHeaders.append("Authorization", `Bearer ${jwtToken}`);

  const raw = JSON.stringify({
    "sid": "4951091037",
    "pinHash": "62baa44d7cf5b1359f19b1f536512dbe5713a94b04aeda70bf64456d3615eb64",
    "pushkey": ""
  });
  
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  // send the request and return the response to the client
  fetch("https://mw-api-preprod.e-kyash.com/api/qrpos-app/authorization", requestOptions)
    .then(response => response.text())
    .then(result => {
      res.status(200).send(result);
    })
    .catch(error => {
      console.log('error', error);
      res.status(500).send('An error occurred');
    });



});

function generateJwtToken(mobileNumber) {
  var apiKey = "APPKEY17-02A8-4BAF-AA0F-B1258C5067A1";
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
  var signature = CryptoJS.HmacSHA256(token, apiKey);
  signature = CryptoJS.enc.Base64.stringify(signature);
  var jwtToken = token + "." + signature;
  return jwtToken;
}

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});