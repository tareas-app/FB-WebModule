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

app.controller('TareasCtrlTasks', function($scope, $http) {    
        $scope.getTasks = function () {
            var userName = "";
            var user = firebase.auth().currentUser;
    
            if (user) {
            // User is signed in.
             logg(user.displayName.replace(/\s+/g, '_'));
             userName = user.displayName.replace(/\s+/g, '_');
                basedb.collection("clubs").doc(userName).collection("tasks").onSnapshot(function(querySnapshot) {
                    $scope.tasks = [];
    
                    querySnapshot.forEach(function(doc) {
    
                        console.log(doc.id, " => ", doc.data());
                        let dateTime = doc.data()["deadline"]
                        var task = {title: doc.data()['title'], description: doc.data()['description'], minpeopleneeded: doc.data()['minpeopleneeded'], deadline: dateTime};
                        $scope.tasks.push(task);
    
                    });
    
                    //displaying in view
                    var scope = angular.element(document.getElementById("taskTable")).scope();
                    scope.$apply(function() {});
    
                });
    
            } else {
            // No user is signed in.
                //TODO: response to no logged in user
                logg('No members to retrive -> no logged in user')
                //window.location.replace('/index.html');
            }        
        }
    
        $scope.addtaskMaster = {};
        $scope.addtask = function(task) {
            logg('Adding task to DB');
            var userName = "";
            $scope.addtaskMaster = angular.copy(task);
    
            logg($scope.addtaskMaster); //Log data received from form
    
            //form data:
            var title = $scope.Task.title;
            var description = $scope.Task.description;
            var minpeopleneeded = $scope.Task.minpeopleneeded;
            var deadline = $scope.Task.deadline;
    
            logg("form: " + title + description + minpeopleneeded + deadline);
            var user = firebase.auth().currentUser;
    
            if (user) {
            // User is signed in.
             logg(user.uid);
             logg(user.email);
             logg(user.displayName.replace(/\s+/g, '_'));
    
             userName = user.displayName.replace(/\s+/g, '_');
    
                //Add a new document in collection "cities"
                basedb.collection("clubs").doc(userName).collection("tasks").doc(title).set({
                    title: title,
                    description: description,
                    minpeopleneeded: Number(minpeopleneeded),
                    deadline: deadline
                })
                .then(function() {
                    console.log("Document successfully written!");                
                    $('#addTaskModal').modal('hide');

                    $("#task_add_success").attr("hidden",false);
                    setTimeout(function(){  $("#task_add_success").attr("hidden",true);; }, 3000);
    
                })
                .catch(function(error) {
                    console.error("Error writing document: ", error);
                });
    
            } else {
            // No user is signed in.
            //TODO: response to no logged in user
            }
    
        };
    
    
        firebase.auth().onAuthStateChanged(function(user) {
            window.user = user; // user is undefined if no user signed in
        
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
    
                    logg('still logged in');
                    $scope.LoggedInUser = "user.email";
    
                    var scope = angular.element(document.getElementById("loggedInuserString")).scope();
                    scope.$apply(function() {
                        scope.LoggedInUser = user.email;
                    });
    
                    $scope.getTasks();
    
                } else {
                    logg('still logged out');
                    window.location.replace('/index.html');
                    
                }
              });
        });
    
    });