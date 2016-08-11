require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var app = require("./application");

               
var prediction = function($scope) {
  
  $scope.games = window.games;
  var person = "user";

  var restore = function(source) {
    source.games.forEach(function(f) {
      $scope.games.forEach(function(g) {
        if (f.id == g.id) {
          console.log("yes");
          g.win = f.win;
          g.spread = f.spread;
        }
      });
    });
  }
  
  var saved = null;
  
  var save = function() {
    saved = $scope.games.map(function(g) {
      return {
        win: g.win,
        spread: g.spread,
        id: g.id
      }
    })
  };
  
  $scope.switchView = function(name) {
  
        $scope.msg = 'clicked';

    if (person == "user") {
      save();
      console.log('we are on user');
    }
    if (name == "user") {
      restore(saved);
            console.log('we want to restore user');

    } else {
      //load preset
            console.log('bob preset');

    }
  }
  
  var hash = window.location.hash.replace(/^#/, "");
  if (hash) {
        console.log("yes hash");

    var fromURL = JSON.parse(decodeURIComponent(hash));
    if (fromURL.games) restore(fromURL);
  } else {
    console.log("no hash");
    var fromLocal = localStorage.getItem("hawks-prediction");
    if (fromLocal) {
      fromLocal = fromLocal.replace(/^#/, "");
      fromLocal = JSON.parse(decodeURIComponent(fromLocal));
      restore(fromLocal);
    }
  }
  
  $scope.$watch(function() {
    //if (person != "user") return;
    var filtered = $scope.games.map(function(entry) {
      return {
        id: entry.id,
        win: entry.win,
        spread: entry.spread * 1
      }
    });
    
    var json = JSON.stringify({ games: filtered });
    var encoded = "#" + encodeURIComponent(json);
    history.replaceState(encoded, encoded, encoded);
    //I think the problem is here at local storage. It thinks 0 is valid. Would a submit button solve this?
    localStorage.setItem("hawks-prediction", encoded);
  });

}
prediction.$inject = ["$scope"];

app.controller("prediction", prediction);

