var app = require('express')();
var bodyParser  = require('body-parser');
var request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var port = process.env.PORT || 8080;

var token = "EAABuCopCejMBAFZCdziD6pFSNQOaGI6wmXUyZBWRXMlETpiPwKVGjVXuecg0J2NqQigSpMnWi4Tts97AWV2qS1riCR0jIpGcrWr2JcLZAll2k3ZAQfJwLYCKI6OYA37eu3bZAm1aiCpS4draDLW6yIDWqjJ0Sh1AmJOvV29wUoAZDZD";

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