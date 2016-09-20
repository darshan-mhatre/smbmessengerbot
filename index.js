'use strict'
//Constants
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

//Example POST method invocation 
var Client = require('node-rest-client').Client;
var client = new Client();

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
        if (event.message && event.message.text && sender) {
            let text = event.message.text
            console.log('Text Message: ', text)
            if (text == '#book') {
                sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
                let apiRes = callApi("Book/GetBookCategories", "")
                console.log('Api Response: ', apiRes)
            }
            else
            {
                sendTextMessage(sender, "Colud not recognised..Please enter valid #tag")
            }
        }
    }
    res.sendStatus(200)
})

function callApi(apiName, apiParam) {
    var args = {
        data: apiParam,
        headers: { "Content-Type": "application/json" }
    };

    client.post("http://52.3.172.40/facebookbot/api/" + apiName, args, function (data, response) {
        console.log('Api Response in function: ', apiRes)
       return data.message
    });
}

function sendTextMessage(sender, text) {
    let messageData = { text: text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error send text: ', response.body.error)
        }
    })
}

function sendFormat(sender, text) {
    let messageData = { text: text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": "What do you want to do next?",
                        "buttons": [
                        {
                            "type": "web_url",
                            "url": "https://petersapparel.parseapp.com",
                            "title": "Show Website"
                        },
                        {
                            "type": "postback",
                            "title": "Start Chatting",
                            "payload": "USER_DEFINED_PAYLOAD"
                        }
                        ]
                    }
                }
            }
        }
    }, function (error, response, body) {
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

