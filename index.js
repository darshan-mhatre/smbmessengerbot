'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

//Example POST method invocation 
var Client = require('node-rest-client').Client;
var client = new Client();

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
    res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    console.log("before for condition = ")
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            if (text === 'Generic') {
                sendGenericMessage(sender)
                continue
            }
            console.log("in if condition = ")
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
        if (event.postback) {
            let text = JSON.stringify(event.postback)
            var args = {
                            data: {},
                            headers: { "Content-Type": "application/json" }
                        };

                        client.post("http://52.3.172.40/facebookbot/api/Book/GetBookCategories", args, function (data, response) {
                            // parsed response body as js object 
                            console.log(data)
                            // raw response 
                            console.log("data.message = ",data.message)
                            sendTextMessage(sender, data.message)
                            sendTextMessageOnResponse(sender, text.substring(0, 200))
                          sendTextMessageOnResponseAPI(sender, text.substring(0, 200))
                        });

                        // sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
            //sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
            //continue
        }
    }
    res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = "EAABuCopCejMBAEEr1uprVLUSzvHCDLgGUrfZCyTy0qdQbs2yjdA2vDjkJUQmvm3EcCiW9fyRgJqs9KfTGZBnxn8ZA0ISyW1Athf7IboqZC8zzT59xOa169BNV0SmNKcOuHL2zDFotVMcw6IM6JQXEVOIt3WH4WgZBvURHd1PPzwZDZD"

function sendTextMessage(sender, text) {
    //let messageData = { text: text }
   // let messageData = { "attachment": { "type": "template", "payload": { "template_type": "button", "text": "What do you want to do next?", "buttons": [{ "type": "postback", "title": "Commic", "payload": { "api": "GetBooks", "param": { "BookCategoryID": "1" } } }, { "type": "postback", "title": "Historical", "payload": { "api": "GetBooks", "param": { "BookCategoryID": "2" } } }, { "type": "postback", "title": "Novel", "payload": { "api": "GetBooks", "param": { "BookCategoryID": "3" } } }] } } }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: text, //text
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTextMessageOnResponse(sender, text) {
    console.log('Message On response: ', text)
    let messageData = { text: text }

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData, //messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTextMessageOnResponseAPI(sender, text) {
    console.log('API response: ', text)

  //  let messageData = { "BookCategoryID": "1" }

    //request({
    //    url: 'https://graph.facebook.com/v2.6/me/messages',
    //    qs: { access_token: token },
    //    method: 'POST',
    //    json: {
    //        recipient: { id: sender },
    //        message: messageData, //messageData
    //    }
    //}, function (error, response, body) {
    //    if (error) {
    //        console.log('Error sending messages: ', error)
    //    } else if (response.body.error) {
    //        console.log('Error: ', response.body.error)
    //    }
    //})
    var args = {
        data: { "BookCategoryID": "2" },
        headers: { "Content-Type": "application/json" }
    };

    client.post("http://52.3.172.40/facebookbot/api/Book/GetBooks", args, function (data, response) {
        // parsed response body as js object 
        console.log(data)
        // raw response 
        console.log("data.message books = ", data.books)
       
       // sendTextMessage(sender, data.message)
        sendTextMessageOnResponse(sender, data.books)
    });

   
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

// spin spin sugar
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})
