function logg(text){var today = new Date().toJSON().replace(/-/g,'/'); console.log(today + ": " + text);}
var config = {
    apiKey: "AIzaSyBjZg-CeRd05z7mGW9CzEjmmPjVqMJ6hN0",
    authDomain: "tareas-d98b3.firebaseapp.com",
    databaseURL: "https://tareas-d98b3.firebaseio.com",
    projectId: "tareas-d98b3",
    storageBucket: "tareas-d98b3.appspot.com",
    messagingSenderId: "740957850942"
  };
  firebase.initializeApp(config);

var app = angular.module('TareasApp', ['ui.router']);
var basedb = firebase.firestore();
const settings = {timestampsInSnapshots: true};
basedb.settings(settings);

app.controller('TareasCtrlLogin', ['$scope', '$http','$window' ,'$location', function($scope, $http, $window, $location) {

        $scope.loginuser = function(user) {
            logg('Trying to log in')
            firebase.auth().signInWithEmailAndPassword(user.email, md5(user.password)).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorMessage);
                //TODO: show error message
                
              });

//Test function, use to logout current user -> to test login funciton
            // firebase.auth().signOut().then(function() {
            //     // Sign-out successful.
            //     console.log('loggedout')
            //      //TODO: Redirect to login (index.html)
            //   }).catch(function(error) {
            //     // An error happened.
            //     console.log('Log out error: ' + error);
            //   });
        }

        firebase.auth().onAuthStateChanged(function(user) {
            window.user = user; // user is undefined if no user signed in
        
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {

                    logg('loggedin');
                    window.location.replace('/home.html');

                } else {
                    logg('loggedout');
                    
                }
              });
        });


}]);
