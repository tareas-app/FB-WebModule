var config = {
    apiKey: "AIzaSyBjZg-CeRd05z7mGW9CzEjmmPjVqMJ6hN0",
    authDomain: "tareas-d98b3.firebaseapp.com",
    databaseURL: "https://tareas-d98b3.firebaseio.com",
    projectId: "tareas-d98b3",
    storageBucket: "tareas-d98b3.appspot.com",
    messagingSenderId: "740957850942"
  };
  firebase.initializeApp(config);

var app = angular.module('TareasApp', ['ui.router', 'ui.calendar', 'ui.bootstrap']);
var basedb = firebase.firestore();
const settings = {timestampsInSnapshots: true};
basedb.settings(settings);

app.controller('TareasCtrlLogin', ['$scope', '$http','$window' ,'$location', function($scope, $http, $window, $location) {
        //console.log(md5("value"));

        $scope.loginuser = function(user) {
            logg('Trying to log in')
            firebase.auth().signInWithEmailAndPassword(user.email, md5(user.password)).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorMessage);
                //TODO: show error message
                
              });

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

app.controller('TareasCtrlDashboard', function($scope, $http) {
    $scope.LoggedInUser = "user.emaiedl";
    firebase.auth().onAuthStateChanged(function(user) {
        window.user = user; // user is undefined if no user signed in
    
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {

                logg('still logged in');
                $scope.LoggedInUser = "";

                var scope = angular.element(document.getElementById("loggedInuserString")).scope();
                scope.$apply(function() {
                    scope.LoggedInUser = user.email;
            });

            } else {
                logg('still logged out');
                //tODO: check if below function works
                window.location.replace('/index.html');
                
            }
          });
    });


    $http.get("https://jsonplaceholder.typicode.com/todos/1")
    .then(function(response) {
        $scope.myWelcome = response.data;
        console.log(response.data);
        logg('------------------------------------');
        logg(response.data);
        
    });
});

app.controller('TareasCtrlMembers', function($scope, $http, $timeout) {
    $scope.passwordIsGenerated = false;
    $scope.generatePassword = function() {
        $scope.passwordIsGenerated = true;
        //TODO: generate password and set it to $scope.password & $scope.passwordconfirm or $scope.member.password & $scope.member.passwordconfirm
        let randomLength =  Math.floor(Math.random() * Math.floor(3)) + 7;
        let generatedpassword = $scope.randomPassword(randomLength);
logg('generated password: ' + generatedpassword);
        $scope.password = generatedpassword;
        $scope.passwordconfirm = generatedpassword;

        // $scope.member = {passwordconfirm: generatedpassword};
        // $scope.member = {password: generatedpassword};
        //$scope.member = {passwordconfirm: generatedpassword};
        logg(JSON.stringify($scope.member));
    }

    $scope.randomPassword = function (length) {
        var chars = "abcdefghijklmnopqrstuvwxyz!@#$ABCDEFGHIJKLMNOP1234567890";
        var pass = "";
        for (var x = 0; x < length; x++) {
            var i = Math.floor(Math.random() * chars.length);
            pass += chars.charAt(i);
        }
        return pass;
    }

    $scope.getMembers = function()
    {

        var userName = "";
        var user = firebase.auth().currentUser;

        

        if (user) {
        // User is signed in.
         logg(user.displayName.replace(/\s+/g, '_'));
         userName = user.displayName.replace(/\s+/g, '_');


            basedb.collection("clubs").doc(userName).collection("members").get().then(function(querySnapshot) {
                $scope.members = [];

                querySnapshot.forEach(function(doc) {

                    console.log(doc.id, " => ", doc.data());
                    var person = {first_name: doc.data()['first_name'], last_name: doc.data()['last_name'], email: doc.data()['email'], role: "lid"}; //TODO: update this with the right values for a member record
                    $scope.members.push(person);

                });

                //displaying in view
                var scope = angular.element(document.getElementById("memberTable")).scope();
                scope.$apply(function() {});

            });

        } else {
        // No user is signed in.
            //TODO: response to no logged in user
            //tODO: check if below function works
            logg('No members to retrive -> no logged in user')
            //window.location.replace('/index.html');
        }        
    }
    
    //TODO: form validation
    $scope.addmemberMaster = {};
    $scope.addmember = function(member) {
        logg('Adding member to DB');
        var userName = "";
        $scope.addmemberMaster = angular.copy(member);

        logg($scope.addmemberMaster); //Log data received from form
        logg(JSON.stringify($scope.addmemberMaster)); //Log data received from form
        logg($scope.addmemberMaster.firstname);


        var user = firebase.auth().currentUser;

        if (user) {
        // // User is signed in.
        logg(user.displayName.replace(/\s+/g, '_'));
        userName = user.displayName.replace(/\s+/g, '_');
        
        var data = {
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
              'Content-Type': "Content-Type: application/json"
            },
            data: data
           }
           
           $http(req).then(function(data, status, headers, config){
               logg("sent to server");
               logg('Success data: ' + JSON.stringify(data));
               $('#addMemberModal').modal('hide');
   
               $scope.getMembers(); //Retrieve members to show newly added member

           }, function(data, status, header, config){
               logg('Error data: ' + data + " JSON: " + JSON.stringify(data));
           });

        } else {
        // No user is signed in.
            //TODO: response to no logged in user
            //tODO: check if below function works
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
                logg('stilll logged out');
                //tODO: check if below function works
                window.location.replace('/index.html');
                
            }
          });
    });
});

app.controller('TareasCtrlTasks', function($scope, $http) {
//TODO: get data from form and add to DB (currently now data, just username is checked)

    $scope.getTasks = function () {
        var userName = "";
        var user = firebase.auth().currentUser;

        if (user) {
        // User is signed in.
         logg(user.displayName.replace(/\s+/g, '_'));
         userName = user.displayName.replace(/\s+/g, '_');
            basedb.collection("clubs").doc(userName).collection("tasks").get().then(function(querySnapshot) {
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
            //tODO: check if below function works
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
                logg('stilll logged out');
                //tODO: check if below function works
                window.location.replace('/index.html');
                
            }
          });
    });

    $http.get("https://jsonplaceholder.typicode.com/todos/1")
    .then(function(response) {
        $scope.myWelcome = response.data;
        console.log(response.data);
        logg('------------------------------------');
        logg(response.data);
        
    });
});


app.controller('TareasCtrlPlanner', ['$scope', "$compile", '$http','$window' ,'$location', function($scope, $compile, $http, $window, $location) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();


    $scope.changeTo = 'Hungarian';
    /* event source that pulls from google.com */
    $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'Europe/Amsterdam' // an option!
    };
    /* event source that contains custom events on the scope */
    $scope.events = [
      {title: 'All Day Event',start: new Date(y, m, 1)},
      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
      {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
      {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
      var s = new Date(start).getTime() / 1000;
      var e = new Date(end).getTime() / 1000;
      var m = new Date(start).getMonth();
      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
      callback(events);
    };

    $scope.calEventsExt = {
       color: '#f00',
       textColor: 'yellow',
       events: [
          {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
        window.alert(date.title + ' was clicked ');
    };
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
       window.alert('Event Dropped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
       window.alert('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key] === source){
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      if(canAdd === 0){
        sources.push(source);
      }
    };
    /* add custom event*/
    $scope.addEvent = function() {
      $scope.events.push({
        title: 'Open Sesame',
        start: new Date(y, m, 28),
        end: new Date(y, m, 29),
        className: ['openSesame']
      });
    };
    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalendar = function(calendar) {
      $timeout(function() {
        if(uiCalendarConfig.calendars[calendar]){
          uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
      });
    };
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) {
        element.attr({'tooltip': event.title,
                      'tooltip-append-to-body': true});
        $compile(element)($scope);
    };
    /* config object */
    $scope.uiConfig = {
      calendar:{
        timeFormat: 'h:mm',
        height: 1000,
        nowIndicator: true,
        editable: true,
        header:{
          left: 'today prev,next',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        defaultView: 'agendaWeek',
        viewRender: function(view, element) {
            logg("View Changed: ", view.visStart, view.visEnd, view.start, view.end);
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };

    $scope.changeLang = function() {
      if($scope.changeTo === 'Dutch'){
        $scope.uiConfig.calendar.dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
        $scope.uiConfig.calendar.dayNamesShort = ["Zon", "Maa", "Din", "Woe", "Don", "Vri", "Zat"];
        $scope.changeTo= 'English';
      } else {
        $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        $scope.changeTo = 'Dutch';
      }
    };
    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];


    //Other functions:
    $scope.getOpenTasks = function () {
        var userName = "";
        var user = firebase.auth().currentUser;

        if (user) {
        // User is signed in.
         logg(user.displayName.replace(/\s+/g, '_'));
         userName = user.displayName.replace(/\s+/g, '_');
            basedb.collection("clubs").doc(userName).collection("tasks").get().then(function(querySnapshot) {
                $scope.tasks = [];

                querySnapshot.forEach(function(doc) {

                    console.log(doc.id, " => ", doc.data());
                    let dateTime = doc.data()["deadline"];
                    var task = {title: doc.data()['title'], description: doc.data()['description'], minpeopleneeded: doc.data()['minpeopleneeded'], deadline: dateTime};
                    $scope.tasks.push(task);

                });

                //displaying in view
                var scope = angular.element(document.getElementById("taskSelect")).scope();
                scope.$apply(function() {});

            });

        } else {
        // No user is signed in.
            //TODO: response to no logged in user
            //tODO: check if below function works
            logg('No members to retrive -> no logged in user');
            //window.location.replace('/index.html');
        } 
    }

    // Show add user modal
    $scope.addUser = function () {
        $('#addUserModal').modal('show');
    }

    //Search for user
    // TODO: let server search for user? by manually looking for the name?
    $scope.searchForUser = function () {
        let nameToSearch =  $scope.searched_username
        logg('searching for: ' + nameToSearch)
        //Add logged in check etc
        // basedb.collection("clubs").doc(userName).collection("members").where("last_name", "==", nameToSearch)
        // .get()
        // .then(function(querySnapshot) {
        //     querySnapshot.forEach(function(doc) {
        //         // doc.data() is never undefined for query doc snapshots
        //         console.log(doc.id, " => ", doc.data());
        //     });
        // })
        // .catch(function(error) {
        //     console.log("Error getting documents: ", error);
        // });
    }

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

                $scope.getOpenTasks();

            } else {
                logg('stilll logged out');
                //tODO: check if below function works
                window.location.replace('/index.html');
                
            }
          });
    });
}]);


function logg(text){var today = new Date().toJSON().replace(/-/g,'/'); console.log(today + ": " + text);}