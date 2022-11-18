var admin = require('firebase-admin');
var webpush = require('web-push');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var serviceAccount = require('./supremetms-pushnotifications.json');// YOUR FIREBASE SERVICE ACCOUNT FILE

webpush.setVapidDetails(
  'mailto:bsingh@supremecourt.gy', // your email address
  'BOF4EaRKelOaQrzBp0nN5BsDYcTbUpGjt346id5WCYdqzFpyk56zfDw2WnnVuOJTyQEb3b3gQz3DfFCB1cxFPrw',//your public key
  'N9nHKIKzBjOa9UYCPW8-wu-ZQjhrNEfYW32N8_hhvcc' // your private key
);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://supremetms-pushnotifications-default-rtdb.firebaseio.com/' //your realtime database url
});

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({
//  extended: true
//}));

// REST endpoint for sending push notifications
app.get('/push', function(req, res) {

  // Get the 'notifications' module from Firebase
  admin.database().ref('notifications').once('value')
    .then(function(subscriptions) {
      // Iterate through all subscriptions
       subscriptions.forEach(function(subscription) {
       var subscriptionID = subscription.val().endpoint.split("/").slice(-1);
       var subsID         = req.query.subscription ;
       if ( (subscriptionID == subsID && subsID !='') || subsID =='' ) {

		   // Get the end point and keys for each subscription
			var pushConfig = {
			  endpoint: subscription.val().endpoint,
			  keys: {
				auth: subscription.val().keys.auth,
				p256dh: subscription.val().keys.p256dh
			  }
			};
       }
       
      // Send a push notification for this subscription
      webpush.sendNotification(pushConfig, JSON.stringify({
            title: req.query.title,
            body : req.query.body,
            icon : req.query.icon,
            badge: req.query.badge,
            data : {
               url : req.query.url
             }
          }))
          .then(function() {
            res.status(200).send({
              message: 'Notifications where sent successfully'
            });
          })
          .catch(function(err) {
            res.status(500).json({
              message: 'Notifications failed',
              error: err
            });
          });
      });
    })
    .catch(function(err) {
      console.log(err);
    });
});

// CHANGE THE PORT BELOW (OPTIONAL)
var server = app.listen(3050, function() {
  console.log("Ticket Management System Jobs Push Notification Listen  ", server.address().port);
});