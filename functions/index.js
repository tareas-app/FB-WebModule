const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');

var firebase = require('firebase');
var admin = require('firebase-admin');
var auth = require('firebase-auth');
var crypto = require('crypto');
const app = express();

var serviceAccount = require('./tareas-d98b3-firebase-adminsdk-9vdex-47f91be0a5');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tareas-d98b3.firebaseio.com'
})
var baseDB = admin.firestore();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.listen(8888, () => console.log('Tareas app listening on port 8888!')); 

app.get('/', (request, response) => {
    response.send("Hello this home Page.");
});

app.post('/addmember', (request, response) => {
    console.log(request.params);
    console.log(request.body);

    var body = JSON.parse(request.body);
    var club = body["club"]
    var first_name = body["first_name"];
    var last_name = body["last_name"];
    var email = body["email"];
    var date_of_birth = body["date_of_birth"];
    var password = body["password"];
    var role = body["role"];
    

    var data = {
        club: club,
        first_name:first_name.toLowerCase(),
        last_name: last_name.toLowerCase(),
        email: email.toLowerCase(),
        date_of_birth: date_of_birth,
        password: password,
        role: role
      };

    admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: password,
        displayName: email,
        disabled: false
      })
    .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully created new user:", userRecord.uid);

          // Add a new document in collection "clubs" with ID 'Email'
          console.log('adding to; ' + club)
          var setDoc = baseDB.collection("clubs").doc(club).collection("members").doc(email).set(data);

        console.log('Successfully added member');
        response.status(200).send('Successfully added member');

    })
    .catch(function(error) {
        console.log("Error creating new user:", error);
        response.send("An Error occurred");
    })
});

app.post('/addclub', (request, response) => {
    console.log(request.params);
    console.log(request.body);

    var vname = request.body["v_name"];
    var vaddress = request.body["v_address"];
    var vcity = request.body["v_city"];
    var vpostalcode = request.body["v_postalcode"];
    var vemail = request.body["v_email"];
    var vphonenumber = request.body["v_phone_number"];
	var vpassword = request.body["v_password"];
	var vpassword2 = request.body["v_password2"];

    admin.auth().createUser({
        email: vemail,
        emailVerified: false,
        phoneNumber: vphonenumber,
        password: md5(vpassword),
        displayName: vname,
        disabled: false
      })
    .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully created new user:", userRecord.uid);

          var data = {
            userid: userRecord.uid,
            clubname: vname,
            clubaddress: vaddress,
            clubcity: vcity,
            clubpostalcode: vpostalcode,
            clubemail: vemail,
            clubphonenumber: vphonenumber,
            clubpassword: md5(vpassword)
          };
          
          // Add a new document in collection "clubs" with ID 'Club name'
          var setDoc = baseDB.collection('clubs').doc(vname.replace(/\s+/g, '_')).set(data);

        response.status(200).send(generateSuccessRedirect());

    })
    .catch(function(error) {
        console.log("Error creating new user:", error);
        response.send("An Error occurred");
    })
});

exports.app = functions.https.onRequest(app);
function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}
function generateSuccessRedirect() {
    const html = '<!DOCTYPE html><head>' +
    '<title>Redirect | Success</title>' +
    '<meta property="og:title" content="redirect">' +
    '<meta http-equiv="refresh" content="0; url=/successful.html">' +
    '</head><body>' +
    '<p>processing.. redirecting you</p>' +
    '</body></html>';
  
    return html;
  }