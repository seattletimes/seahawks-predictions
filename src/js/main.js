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
          g.h = f.h;
          g.a = f.a;
        }
      });
    });
  }
  
  var saved = null;
  
  var save = function() {
    saved = $scope.games.map(function(g) {
      return {
        id: g.id,
        win: g.win,
        //home score and away score
        h: g.h,
        a: g.a
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
    var filtered = $scope.games.map(function(entry) {
      return {
        id: entry.id,
        win: entry.win,
        //home score and away score
        h: entry.h,
        a: entry.a
      }
    });
    
    var json = JSON.stringify({ games: filtered });
    var encoded = "#" + encodeURIComponent(json);
    history.replaceState(encoded, encoded, encoded);
    localStorage.setItem("hawks-prediction", encoded);
  });

}
prediction.$inject = ["$scope"];

app.controller("prediction", prediction);

