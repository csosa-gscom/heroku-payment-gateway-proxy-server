// const express = require("express"); // http framework
// const cors = require('cors'); //CORS Policy
// const axios = require('axios'); //HTTP client for JavaScript.
// const xml2js = require('xml2js'); //xml parser
// const bodyParser = require('body-parser'); //


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
//       result.TCSRequest.UserName = '501203278252';
//       result.TCSRequest.Password = '052004';
//       result.TCSRequest.Function[0].Param1 = '977';
//       result.TCSRequest.Function[0].Param6 = '5012235128';

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

const express = require("express"); // http framework
const cors = require('cors'); //CORS Policy
const axios = require('axios'); //HTTP client for JavaScript.
const xml2js = require('xml2js'); //xml parser
const bodyParser = require('body-parser'); //


const app = express();
const parser = new xml2js.Parser();

let port = process.env.PORT || 3000;

// const corsOptions = {
//   origin: ['*'],
//   methods: ['GET', 'POST']
// };

// app.use(cors(corsOptions));

app.use(cors());

app.get("/", (req, res) => {
  res.send("GS-COM Payment Gateway Proxy Server");
});

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

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});