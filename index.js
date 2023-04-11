const express = require("express"); // http framework
const cors = require('cors'); //CORS Policy
const axios = require('axios'); //HTTP client for JavaScript.
const xml2js = require('xml2js'); //xml parser
const fs = require('fs'); //read write xml data
const bodyParser = require('body-parser'); //


const app = express();
const parser = new xml2js.Parser();

let port = process.env.PORT || 3000;



app.get("/", (req, res)=>{
    res.send("GS-COM Payment Gateway Proxy Server");
});

// middleware to parse XML requests
app.use(bodyParser.raw({type: 'text/xml'}));

app.post('/send-xml', (req, res) => {
    const data = req.body;
    
    axios.post('https://merchantapi.digiwallet.bz/Telepin', data, { headers: { 'Content-Type': 'text/xml' }})
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
  });


app.listen(port, ()=>{
    console.log(`http://localhost:${port}`);
});


//CORS ENABLED

// const express = require("express"); // http framework
// const cors = require('cors'); //CORS Policy
// const axios = require('axios'); //HTTP client for JavaScript.
// const xml2js = require('xml2js'); //xml parser
// const fs = require('fs'); //read write xml data
// const bodyParser = require('body-parser'); //


// const app = express();
// const parser = new xml2js.Parser();

// let port = process.env.PORT || 3000;

// app.use(cors());

// app.get("/", (req, res)=>{
//     res.send("GS-COM Payment Gateway Proxy Server");
// });

// // middleware to parse XML requests
// app.use(bodyParser.raw({type: 'text/xml'}));

// app.post('/send-xml', (req, res) => {
//     const data = req.body;
    
//     axios.post('https://merchantapi.digiwallet.bz/Telepin', data, { headers: { 'Content-Type': 'text/xml' }})
//       .then(response => {
//         xml2js.parseString(response.data, (err, result) => {
//           if (err) {
//             res.status(500).send('An error occurred while parsing the response.');
//           } else {
//             res.set('Content-Type', 'text/xml');
//             res.send(response.data);
//           }
//         });
//       })
//       .catch(error => {
//         console.log(error);
//         res.status(500).send('An error occurred while making the request.');
//       });
//   });


// app.listen(port, ()=>{
//     console.log(`http://localhost:${port}`);
// });

//STRICT CORS ENABLED
// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const xml2js = require("xml2js");
// const fs = require("fs");
// const bodyParser = require("body-parser");

// const app = express();
// const parser = new xml2js.Parser();
// const port = process.env.PORT || 3000;

// const corsOptions = {
//   origin: ['*'],
//   methods: ['GET', 'POST']
// };

// app.use(cors(corsOptions));

  

// app.get("/", (req, res) => {
//   res.send("GS-COM Payment Gateway Proxy Server");
// });

// app.use(bodyParser.raw({ type: "text/xml" }));

// app.post("/send-xml", cors(corsOptions), (req, res) => {
//   const data = req.body;

//   axios
//     .post("https://merchantapi.digiwallet.bz/Telepin", data, {
//       headers: { "Content-Type": "text/xml",
//       'Access-Control-Allow-Origin': '*'},
//     })
//     .then((response) => {
//       xml2js.parseString(response.data, (err, result) => {
//         if (err) {
//           res.status(500).send("An error occurred while parsing the response.");
//         } else {
//           res.set("Content-Type", "text/xml");
//           res.send(response.data);
//         }
//       });
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(500).send("An error occurred while making the request.");
//     });
// });

// app.listen(port, () => {
//   console.log(`http://localhost:${port}`);
// });