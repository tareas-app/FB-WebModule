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


app.controller('TareasCtrlDashboard', function($scope, $http) {

    // display currently logged in user in navbar
    $scope.LoggedInUser = "user.emaiedl";
    firebase.auth().onAuthStateChanged(function(user) {
        window.user = user; // user is undefined if no user signed in
    
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {

                $scope.LoggedInUser = "";
                var scope = angular.element(document.getElementById("loggedInuserString")).scope();
                scope.$apply(function() {
                    scope.LoggedInUser = user.email;
            });

            } else {
                logg('No user logged in');
                window.location.replace('/index.html');
                
            }
          });
    });

});