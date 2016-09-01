'use strict'
//Constants
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

//Example POST method invocation 
var Client = require('node-rest-client').Client; 
var client = new Client();

const app = express()
app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})


app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    console.log("before for = " + messaging_events);
    for (let i = 0; i < messaging_events.length; i++) {
        console.log("in for = ");
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            console.log("in if = " + event.message.text);
            let text = event.message.text

            // set content-type header and data as json in args parameter 
          
            var args = {
                data: {},
                headers: { "Content-Type": "application/json" }
            };

            client.post("http://52.3.172.40/facebookbot/api/Book/GetBookCategories", args, function (data, response) {
                // parsed response body as js object 
                console.log(data);
                // raw response 
                console.log(response);
                sendTextMessage(sender, data.message);
            });

            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})


function sendTextMessage(sender, text) {

    console.log("started func sender" +sender);
    console.log("started text" + text);
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: text
        //{
            //    "attachment": {
            //        "type": "template",
            //        "payload": {
            //            "template_type": "button",
            //            "text": "What do you want to do next?",
            //            "buttons": [
            //            {
            //                "type": "web_url",
            //                "url": "https://petersapparel.parseapp.com",
            //                "title": "Show Website"
            //            },
            //            {
            //                "type": "postback",
            //                "title": "Start Chatting",
            //                "payload": "USER_DEFINED_PAYLOAD"
            //            }
            //            ]
            //        }
            //    }
            //}
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

//function sendTextMessage(sender, text) {

//    client.post("http://52.3.172.40/facebookbot/api/Book/GetBookCategories", args, function (data, response) {
//        bookCategory = response;
//    });
//    let messageData = { text:text }
//    request({
//        url: 'https://graph.facebook.com/v2.6/me/messages',
//        qs: {access_token:token},
//        method: 'POST',
//        json: {
//            recipient: {id:sender},
//            message: bookCategory
//        }
//    }, function(error, response, body) {
//        if (error) {
//            console.log('Error sending messages: ', error)
//        } else if (response.body.error) {
//            console.log('Error: ', response.body.error)
//        }
//    })
//}

const token = "EAABuCopCejMBAEEr1uprVLUSzvHCDLgGUrfZCyTy0qdQbs2yjdA2vDjkJUQmvm3EcCiW9fyRgJqs9KfTGZBnxn8ZA0ISyW1Athf7IboqZC8zzT59xOa169BNV0SmNKcOuHL2zDFotVMcw6IM6JQXEVOIt3WH4WgZBvURHd1PPzwZDZD"

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

