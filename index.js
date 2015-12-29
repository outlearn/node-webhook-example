"use strict"

let express = require('express');
let bodyParser = require('body-parser')
let crypto = require('crypto');

// NOTE: This secret should NOT be hardcoded into the application. We recommend
//       using a library like (dotenv)[https://www.npmjs.com/package/dotenv]
//       to manage your secret key as an environment variable.
const SHARED_SECRET = "sup3rs3cr3t!!";


let app = express();

app.use(bodyParser.json({verify: verifyOutlearnSignature}));

app.post('/webhook-test', function (req, res) {
  console.log(req.body);
  res.send('All good!');
});

// NOTE: This is not necessary for bare-minimum example. The default Express
//       errorHandler returns a 500 for any thrown error, which is enough for
//       the webhook handler in Nest.
app.use(function(err, req, res, next) {
  console.error(err.stack);

  let status = err.status || 500;
  res.status(status).send(err.message);
});



let server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


function verifyOutlearnSignature(req, res, buf, encoding) {
  let hmac = crypto.createHmac('sha256', SHARED_SECRET);
	hmac.update(buf);

  let calculatedSignature = hmac.digest('base64');
  let providedSignature = req.get('X-Outlearn-Signature');

  if (providedSignature != calculatedSignature) {
    console.log("Wrong signature - providedSignature: %s, calculatedSignature: %s",
                providedSignature, calculatedSignature);
    let error = new Error("Invalid signature");
    error.status = 400;

    throw error;
  }
}
