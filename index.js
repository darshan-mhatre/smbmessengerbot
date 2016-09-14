var app = require('express')();
var bodyParser  = require('body-parser');
var request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var port = process.env.PORT || 8080;

var token = "EAABuCopCejMBAHqFn3lvKbH3FcHV8KMFBKTNPETuE1ZABN4BA2zzhMCoI4oAEKSVkpODzsJJdK0DOjHeL0rZCl8MWg4nZBiRoMoGNwLPZC2l6fuhp67ZCuV1YfNcX1S1Op2EY9JY3MHaBl817YdMwZBmGO2CfNgrTfWtttfMhiYAZDZD";

app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'test smb bot') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      //Do whatever you want with the text
    }
  }
  res.sendStatus(200);
});

app.get('/', function (req, res) {
  res.sendStatus(200);
});

app.listen(port, function () {
  console.log('The webhook is running on port ' + port);
});