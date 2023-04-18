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
const express = require("express"); // http framework
const cors = require('cors'); //CORS Policy
const axios = require('axios'); //HTTP client for JavaScript.
const xml2js = require('xml2js'); //xml parser
const bodyParser = require('body-parser'); 
const CryptoJS = require("crypto-js");

const app = express();
const parser = new xml2js.Parser();

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
app.use(bodyParser.raw({ type: 'text/xml' }));

app.post('/send-xml', (req, res) => {
  const data = req.body;

  // Parse XML data into a JavaScript object
  xml2js.parseString(data, (err, result) => {
    if (err) {
      res.status(500).send('An error occurred while parsing the request.');
    } else {
      // Modify the object properties as desired
      if (result.TCSRequest.Function[0].$.name === 'SALESREQUESTEXECTOSELF'){
        result.TCSRequest.UserName = '501203278252';
        result.TCSRequest.Password = '052004';
      } else if (result.TCSRequest.Function[0].$.name === 'SALESREQUESTMERCHANT_OTP') {
        result.TCSRequest.UserName = '501203278252';
        result.TCSRequest.Password = '052004';
        result.TCSRequest.Function[0].Param1 = '977';
        result.TCSRequest.Function[0].Param6 = '5012235128';
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

app.post('/authorization', (req, res) => {
  console.log('working');
});



let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});