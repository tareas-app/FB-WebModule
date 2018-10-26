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

app.controller('TareasCtrlMembers', function($scope, $http, $timeout) {

    $scope.getMembers = function()
    {
        var userName = "";
        var user = firebase.auth().currentUser;

        if (user) {
        // User is signed in.
         logg(user.displayName.replace(/\s+/g, '_'));
         userName = user.displayName.replace(/\s+/g, '_');


            basedb.collection("clubs").doc(userName).collection("members").onSnapshot(function(querySnapshot) {
                $scope.members = [];

                querySnapshot.forEach(function(doc) {

                    console.log(doc.id, " => ", doc.data());
                    var person = {first_name: doc.data()['first_name'], last_name: doc.data()['last_name'], email: doc.data()['email'], role: doc.data()['role']};
                    $scope.members.push(person);

                });

                //displaying in view
                var scope = angular.element(document.getElementById("memberTable")).scope();
                scope.$apply(function() {});

            });

        } else {
        // No user is signed in.
            //TODO: response to no logged in user
            logg('No members to retrive -> no logged in user')
            //window.location.replace('/index.html');
        }        
    }
    
    $scope.addmemberMaster = {};
    $scope.addmember = function(member) {
        logg('Adding member to DB');
        var userName = "";
        $scope.addmemberMaster = angular.copy(member);

        logg(JSON.stringify($scope.addmemberMaster)); //Log data received from form
        logg($scope.addmemberMaster.firstname);


        var user = firebase.auth().currentUser;

        if (user) {
        // // User is signed in.
        logg(user.displayName.replace(/\s+/g, '_'));
        userName = user.displayName.replace(/\s+/g, '_');
        
        var dataToSend = {
            club: userName,
            first_name: $scope.member.firstname,
            last_name: $scope.member.lastname,
            email: $scope.member.email,
            role: $scope.member.role,
            date_of_birth: $scope.member.dateofbirth,
            password: md5($scope.member.password)
        };
    
        var req = {
            method: 'POST',
            url: '/addmember',
            headers: {
              'Content-Type': undefined
            },
            data: dataToSend
           }
           
           $http(req).then(function(data, status, headers, config){
               logg("sent to server");
               logg('Success data: ' + JSON.stringify(data));
               $('#addMemberModal').modal('hide');
   
            $("#member_add_success").attr("hidden",false);
            setTimeout(function(){  $("#member_add_success").attr("hidden",true);; }, 3000);

           }, function(data, status, header, config){
               logg('Error data: ' + data + " JSON: " + JSON.stringify(data));
           });

        } else {
        // No user is signed in.
            //TODO: response to no logged in user
            window.location.replace('/index.html');
        }
    };


    firebase.auth().onAuthStateChanged(function(user) {
        window.user = user; // user is undefined if no user signed in
    
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {

                logg('still logged in');
                $scope.LoggedInUser = " ";

                var scope = angular.element(document.getElementById("loggedInuserString")).scope();
                scope.$apply(function() {
                    scope.LoggedInUser = user.email;
            });
            

            $scope.getMembers();
            } else {
                logg('still logged out');
                window.location.replace('/index.html');
                
            }
          });
    });
});