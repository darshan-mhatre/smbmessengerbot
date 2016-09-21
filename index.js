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
                var apiRes;
                sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
                callApi("Book/GetBookCategories", "", function (data) {                  // call get catergory api
                    console.log('get response: ', data.message)
                    sendFormat(sender, data.message)             // send response of api to display lis of category
                });
            }
            else
            {
                sendTextMessage(sender, "Colud not recognised..Please enter valid #tag")
            }
        }

        if (event.postback) {
            let text = JSON.stringify(event.postback) // {"payload":"1"}
            var txtype = event.postback;              // { payload: '1' }    
            var param = { "BookCategoryID": event.postback.payload }
            console.log("JSON stringify = ", text)
            console.log("txtype = ", event.postback.payload)
            console.log("param = ", param)
            callApi("Book/GetBooks", param, function (data) {                  // call get book api
                console.log('get response book: ', data.books)
                testFunc(sender, "")
            });
        }
    }
    res.sendStatus(200)
})


var callApi = function (apiName, apiParam, apiRes) {
    var args = {
        data: apiParam,
        headers: { "Content-Type": "application/json" }
    };

    client.post("http://52.3.172.40/facebookbot/api/" + apiName, args, function (data, response) {
        console.log('Api Response in function: ', data.message)
       return apiRes(data)
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

function sendFormat(sender, messageData) {
    
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
            console.log('Error: ', response.body.error)
        }
    })
}

function testFunc(sender, text) {          // testFunction
   
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: { "attachment": { "type": "template", "payload": { "template_type": "generic", "elements": [{ "title": "pqr", "subtitle": "test  2 description 1", "image_url": "", "buttons": { "type": "postback", "title": "Order book", "payload": "3" } }, { "title": "hgfshd", "subtitle": "nabdmsnfd", "image_url": "", "buttons": { "type": "postback", "title": "Order book", "payload": "5" } }] } } } 
        }
    }, function (error, response, body) {
        if (error) {
            console.log('test func Error: ', error)
        } else if (response.body.error) {
            console.log('test func body Error: ', response.body.error)
        }
    })
}

const token = "EAABuCopCejMBAEEr1uprVLUSzvHCDLgGUrfZCyTy0qdQbs2yjdA2vDjkJUQmvm3EcCiW9fyRgJqs9KfTGZBnxn8ZA0ISyW1Athf7IboqZC8zzT59xOa169BNV0SmNKcOuHL2zDFotVMcw6IM6JQXEVOIt3WH4WgZBvURHd1PPzwZDZD"

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

