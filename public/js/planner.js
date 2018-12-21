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

var app = angular.module('TareasApp', ['ui.router', 'ui.calendar', 'ui.bootstrap']);
var basedb = firebase.firestore();
const settings = {timestampsInSnapshots: true};
basedb.settings(settings);

app.controller('TareasCtrlPlanner', ['$scope', "$compile", '$http','$window' ,'$location', function($scope, $compile, $http, $window, $location) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();


    $scope.changeTo = 'Dutch';
    /* event source that pulls from google.com */
    $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'Europe/Amsterdam' // an option!
    };
    /* event source that contains custom events on the scope */
    $scope.events = [];
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

        // $scope.visualiseAppointments(); -> do not use; is called to many times
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

    //-----------------------------------------------------
    //-----------------------------------------------------
    //-------------Accommodating functions-----------------
    //-----------------------------------------------------
    //-----------------------------------------------------

    $scope.membersperformingtask = [];
    $scope.selectedMemberToAdd = {};
    $scope.selectedTask = {};

    //Planning array
    $scope.appointments = [];

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
            logg('No tasks to retrieve -> no logged in user');
            //window.location.replace('/index.html');
        } 
    }

    $scope.getPlanning = function () {
      var userName = "";
      var user = firebase.auth().currentUser;

      $scope.appointments.splice(0, $scope.events.length);
      if (user) {
        userName = user.displayName.replace(/\s+/g, '_');
        basedb.collection("clubs").doc(userName).collection("planning").get().then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            //   console.log(doc.id, " => ", doc.data());
              let datum = moment(doc.data()['deadline'].toDate());

              var appointment = {description: doc.data()['task']['description'], startdatum: new Date(datum.year(), datum.month(), datum.day(), doc.data()['deadlineStartTimeHours'], doc.data()['deadlineStartTimeMins']), enddatum: new Date(datum.year(), datum.month(), datum.day(), doc.data()['deadlineEndTimeHours'], doc.data()['deadlineEndTimeMins'])};
              $scope.appointments.push(appointment);
          });
          $scope.visualiseAppointments();
        });
      }
        else {
          logg('No members to retrieve -> no logged in user');
      }
    }

    // $scope.RealtimeUpdates = function() {
    //     var userName = "";
    //     var user = firebase.auth().currentUser;
  
    //     // $scope.appointments.splice(0, $scope.events.length);
    //     if (user) {
    //         userName = user.displayName.replace(/\s+/g, '_');
    //         basedb.collection("clubs").doc(userName).collection("planning")
    //         .onSnapshot(function(querySnapshot) {
    //             alert('realtime ');
    //             querySnapshot.forEach(function(doc) {
    //                 console.log("Current realtime data: ", doc.data());
    //                 let datum = moment(doc.data()['deadline'].toDate());
        
    //                 var appointment = {description: doc.data()['task']['description'], startdatum: new Date(datum.year(), datum.month(), datum.day(), doc.data()['deadlineStartTimeHours'], doc.data()['deadlineStartTimeMins']), enddatum: new Date(datum.year(), datum.month(), datum.day(), doc.data()['deadlineEndTimeHours'], doc.data()['deadlineEndTimeMins'])};
    //                 $scope.appointments.push(appointment);
    //             });
    //             $scope.visualiseAppointments();
    //         });
    //     }
    //     else {
    //         logg('No members to retrieve -> no logged in user');
    //     }
    // }

    $scope.visualiseAppointments = function()
    {
        $scope.events.splice(0, $scope.events.length);
        for (var i = 0;i < $scope.appointments.length; i++)
        {
            // logg('sadfsdfs ' + $scope.appointments[i].description + '    ' + $scope.appointments[i].startdatum);
            $scope.events.push({title: $scope.appointments[i].description ,start: $scope.appointments[i].startdatum, end: $scope.appointments[i].enddatum});
        }
      
    } 

    // Show add user modal
    $scope.searchMemberToAddTask = function () {
        $('#addUserModal').modal('show');
    }

    //Add selected user from retrieved members to membersperformingtask
    $scope.addMemberToTask = function ()
    {
        //logg("$scope.selectedMemberToAdd: " + JSON.stringify($scope.selectedMemberToAdd));
        $scope.membersperformingtask.push($scope.selectedMemberToAdd);
        $('#addUserModal').modal('hide');
    }

    //Search for user
    // TODO: let server search for user? by manually looking for the name?
    $scope.searchForUser = function () {
        let nameToSearch =  $scope.searched_username
        logg('searching for: ' + nameToSearch)
        //Add logged in check etc

        var userName = "";
        var user = firebase.auth().currentUser;

        if (user) {
            userName = user.displayName.replace(/\s+/g, '_');

            basedb.collection("clubs").doc(userName).collection("members").where("last_name", "==", nameToSearch)
            .get()
            .then(function(querySnapshot) {
                $scope.retrievedmembers = [];

                querySnapshot.forEach(function(doc) {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(doc.id, " => ", doc.data());
                    var person = {first_name: doc.data()['first_name'], last_name: doc.data()['last_name'], email: doc.data()['email'], role: doc.data()['role']}; //TODO: update this with the right values for a member record
                    $scope.retrievedmembers.push(person);
                });

                $scope.selectedMemberToAdd = $scope.retrievedmembers[0];

                var scope = angular.element(document.getElementById("searched_usernames")).scope();
                scope.$apply(function() {});
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
            });
        }
        else {
            logg('No members to retrieve -> no logged in user');
        }
    }

    $scope.assigntask = function()
    {
      var userName = "";
      var user = firebase.auth().currentUser;

      //form data:
      var task = $scope.selectedTask;
      //membersperformingtask
      var deadline = $scope.PlannedTask.deadline;
      var deadlineStartTimeHours = $scope.PlannedTask.deadlineStartTimeHours;
      var deadlineStartTimeMins = $scope.PlannedTask.deadlineStartTimeMins;
      var deadlineEndTimeHours = $scope.PlannedTask.deadlineEndTimeHours;
      var deadlineEndTimeMins = $scope.PlannedTask.deadlineEndTimeMins;
      var membersperformingtask = $scope.membersperformingtask;

      logg('appointment: ' + task + ' ' + JSON.stringify($scope.membersperformingtask) + ' ' + deadline + ' ' + deadlineStartTimeHours + ' ' + deadlineStartTimeMins + ' ' + deadlineEndTimeHours + ' ' + deadlineEndTimeMins);
      for (var i = 0; i < $scope.membersperformingtask.length; i++)
      {
        logg(JSON.stringify($scope.membersperformingtask[i]));
      }

      if (user) {
          userName = user.displayName.replace(/\s+/g, '_');

          basedb.collection("clubs").doc(userName).collection("planning").doc(JSON.stringify(deadline)).set({
              task: task,
              deadline: deadline,
              deadlineStartTimeHours: deadlineStartTimeHours,
              deadlineStartTimeMins: deadlineStartTimeMins,
              deadlineEndTimeHours: deadlineEndTimeHours,
              deadlineEndTimeMins: deadlineEndTimeMins,
              membersperformingtask: membersperformingtask
          })
          .then(function() {
            //After assiging a task to one or more users, the task should be updated to reflect the fact that it is now assigned.

            var taskRef = basedb.collection("clubs").doc(userName).collection("tasks").doc($scope.selectedTask.title);

            taskRef.update({
                assigned: true
            })
            .then(function() {
                console.log("Document successfully written! (both planning and task)");
                $('#assignTaskModal').modal('hide');
                $scope.getPlanning();
            })
            .catch(function(error) {
                // The document probably doesn't exist.
                console.error("Error updating document (task): ", error);
            });  
          })
          .catch(function(error) {
              console.error("Error writing document (planning): ", error);
          });
        
    
      }
      else {
          logg('No user to assign task for -> no logged in user');
      }
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

                $scope.getPlanning();
                // $scope.RealtimeUpdates();
                $scope.getOpenTasks();

            } else {
                logg('still logged out');
                window.location.replace('/index.html');
                
            }
          });
    });
}]);
