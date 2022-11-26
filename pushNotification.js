var admin = require('firebase-admin');
var webpush = require('web-push');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var serviceAccount = require('./stmsnotifications.json');

webpush.setVapidDetails(
    'mailto:basu.singh.16.144@gmail.com',
    'BM4a89VUc_CTN7tguFe1QVPYlcKcb2qVgNmVfTcI4JfxLTJWdbOmjiwjcZAwyN7r95vBbBI2FPLBwDfFcQ8Kk4w',
    'GW1b5-dJ-IM3DJtM6LHl85ZN8hL89Cs3V1k9ummRO7Q'
  );

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://stmsnotifications-default-rtdb.firebaseio.com/'
  });

  app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// REST endpoint for sending push notifications
app.get('/push', function(req, res) {
  // Get the 'notifications' module from Firebase
  admin.database().ref('notifications').once('value')
    .then(function(subscriptions) {
      // Iterate through all subscriptions
      subscriptions.forEach(function(subscription) {
        // Get the end point and keys for each subscription
        var pushConfig = {
          endpoint: subscription.val().endpoint,
          keys: {
            auth: subscription.val().keys.auth,
            p256dh: subscription.val().keys.p256dh
          }
        };

        // Send a push notification for this subscription
        webpush.sendNotification(pushConfig, JSON.stringify({
            title: req.query.title,
            body: req.query.body,
            icon: req.query.icon,
            badge: req.query.badge
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
  console.log("APEX PWA Push Notification Server Running on Port", server.address().port);
});
