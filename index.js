'use strict'
//Constants
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

//Example POST method invocation 
var Client = require('node-rest-client').Client;
var client = new Client();
var requestId;
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
    var userId = null;
    let text = JSON.stringify(messaging_events);
    console.log('messging event: ', text);
    for (let i = 0; i < messaging_events.length; i++) {

        let event = req.body.entry[0].messaging[i]
        console.log('req.body.entry[0]: ', req.body.entry[0])
        let sender = event.sender.id
      
        if (event.message && event.message.text && sender) {

            let text = event.message.text
            console.log('sender Id: ', sender)
           
            if (sender != '805370696266097') {

                var param = { "fbId": sender, "message": text.substring(0, 200) }
                console.log('param Id: ', param)

                callApi("Book/SaveUserMessage", param, function (data) {                  // call to save user message
                    console.log('get response: ', data.message)
                    console.log('request Id: ', data.requestId)
                    requestId = data.requestId;
                });

                if (text == '#book') {

                    var param = { "fbId": sender }
                    console.log('param Id: ', param)
                    callApi("Book/CheckRegisteredUser", param, function (data) { 
                        console.log('isRegistered response: ', data.isRegistered)
                        userId = data.userId;
                        console.log('userId: ', userId)
                        if (data.isRegistered == true) {
                            var apiRes;
                            console.log('in get category response: ', data.isRegistered)
                            //sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
                            callApi("Book/GetBookCategories", "", function (data1) {                  // call get catergory api
                                console.log('get response of cat: ', data1.message)
                                sendFormat(sender, data1.message)             // send response of api to display lis of category
                            });
                        }
                        else if (data.isRegistered == false) {
                            sendTextMessage(sender, "You are not registered for #banking")
                        }
                    });


                }
                else {
                    sendTextMessage(sender, "Colud not recognised..Please enter valid #tag")
                }
            }
            else
            {
                var param = { "requestId": requestId, "fbId": sender, "message": text.substring(0, 200) }
                console.log('param Id: ', param)
                callApi("Book/SavebotResponeMessage", param, function (data) {                  // call to save bot response message
                    console.log('get response: ', data.message)
                    console.log('response Id: ', data.response)
                });
            }

            console.log('Text Message: ', text)
            
        }

        if (event.postback) {
           
            var param = { "fbId": event.sender.id, "message": event.postback.payload }
            callApi("Book/SaveUserMessage", param, function (data) {                  // call to save user message
                console.log('get response: ', data.message)
                console.log('request Id: ', data.requestId)
                requestId = data.requestId;
            });
            
            let text = JSON.stringify(event.postback) // {"payload":"1"}
            var txtype = event.postback;              // { payload: '1' }    
            var str = event.postback.payload;
            console.log("event = ", event)
            console.log("JSON stringify = ", text)
            console.log("txtype = ", event.postback.payload)
            console.log("param = ", param)
            if (str.length > 7 && str.substring(0, 6) == "bookId") {
                var id = str.slice(7);
                var message
                console.log("slice id = ", id)
                var param = { "UserID": event.sender.id, "BookID": id }
                console.log("Save order param: ",param)
                callApi("Book/SaveBookOrder", param, function (data) {                  // call get book api
                    console.log('get response book: ', data.message + data.OrderID)
                    //testFunc(sender,"")
                    var message = data.message + data.OrderID
                    sendTextMessage(sender, data.message + " Order No:" + data.OrderID)
                });

                var param = { "requestId": requestId, "fbId": event.sender.id, "message": message }
                console.log('param Id: ', param)
                callApi("Book/SavebotResponeMessage", param, function (data) {                  // call to save bot response message
                    console.log('get response: ', data.message)
                    console.log('response Id: ', data.response)
                });
            }
           
            else
            {
                var message
                var param = { "BookCategoryID": str }
                callApi("Book/GetBooks", param, function (data) {                  // call get book api
                    console.log('get response book: ', data.message)
                    //testFunc(sender,"")
                    message = data.message
                    sendFormat(sender, data.message)
                });

                var param = { "requestId": requestId, "fbId": event.sender.id, "message": "book list" }
                console.log('param Id: ', param)
                callApi("Book/SavebotResponeMessage", param, function (data) {                  // call to save bot response message
                    console.log('get response: ', data.message)
                    console.log('response Id: ', data.response)
                });
            }
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
            message: {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Welcome to MyShop",
                            "image_url": "http://www.example.com/images/m-bank.png",
                            "buttons": [{
                                "type": "account_link",
                                "url": "https://www.example.com/oauth/authorize"
                            }]
                        }]
                    }
                }
            }
        }
    }, function (error, response, body) {
        if (error) {
            console.log('test func Error: ', error)
        } else if (response.body.error) {
            console.log('test func body Error: ', response.body.error)
        }
    })
}

//const token = "EAACaf1SOER0BABIZAg5nTDEnglzcd7oCZC5m4ZAo8AtcsTwELwrrdg8o2pARvJ8e3IbnLAqeRl8yd5ZBLbHXBX5Xtj7S51QQMK3rn1HMoQkN2EcCE5tBlpaEwe55lhZARO0XNmm4l8Tge5x20AqC9EQUZBZA28B5ZC5s1xfQEpI1nwZDZD"
const token = "EAABuCopCejMBAEEr1uprVLUSzvHCDLgGUrfZCyTy0qdQbs2yjdA2vDjkJUQmvm3EcCiW9fyRgJqs9KfTGZBnxn8ZA0ISyW1Athf7IboqZC8zzT59xOa169BNV0SmNKcOuHL2zDFotVMcw6IM6JQXEVOIt3WH4WgZBvURHd1PPzwZDZD"

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

