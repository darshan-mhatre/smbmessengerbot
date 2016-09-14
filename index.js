'use strict'
//Constants
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
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
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            var args = {
                data: {},
                headers: { "Content-Type": "application/json" }
            };

            client.post("http://52.3.172.40/facebookbot/api/Book/GetBookCategories", args, function (data, response) {
                // parsed response body as js object
                console.log("data.message = ", data.message)
                sendTextMessage(sender, data.message) //Creates category buttons
                //sendTextMessageOnResponse(sender, text.substring(0, 200)) //text message 
            });
           // sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})

function sendTextMessage(sender, text) {
    // let messageData = { text:text }
    let messageData = text
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData
            //    {
            //            "attachment":{
            //            "type":"template",
            //            "payload":{
            //                "template_type":"button",
            //                "text":"What do you want to do next?",
            //                "buttons":[
            //                {
            //                    "type":"web_url",
            //                    "url":"https://petersapparel.parseapp.com",
            //                    "title":"Show Website"
            //                },
            //                {
            //                    "type":"postback",
            //                    "title":"Start Chatting",
            //                    "payload":"USER_DEFINED_PAYLOAD"
            //                }
            //                ]
            //            }
            //            }
            //}
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

const token = "EAABuCopCejMBAEEr1uprVLUSzvHCDLgGUrfZCyTy0qdQbs2yjdA2vDjkJUQmvm3EcCiW9fyRgJqs9KfTGZBnxn8ZA0ISyW1Athf7IboqZC8zzT59xOa169BNV0SmNKcOuHL2zDFotVMcw6IM6JQXEVOIt3WH4WgZBvURHd1PPzwZDZD"

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

