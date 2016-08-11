require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var qs = require("querystring");
var app = require("./application");
var ascii = require("./arrayCode");
var aKeys = "win h a".split(" ");
               
var prediction = function($scope) {
  
  $scope.games = window.games;
  var person = "user";

  var restore = function(source) {
    source.forEach(function(g, i) {
      var game = $scope.games[i];
      if (g.win > 0) {
        game.winner = g.win == 1 ? game.home : game.away;
      }
      
      game.a = g.a;
      game.h = g.h;
    });
  }
  
  var saved = null;
  
  var save = function() {
    saved = $scope.games.slice();
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
    person = name;
  }
  
  var hash = window.location.hash.replace(/^#/, "");
  var query = qs.decode(hash);
  if (query.games) {
    var fromURL = ascii.unpack(aKeys, query.games);
    if (fromURL) restore(fromURL);
  } else {
    var fromLocal = localStorage.getItem("hawks-prediction");
    if (fromLocal) {
      fromLocal = JSON.parse(fromLocal);
      restore(fromLocal);
    }
  }
  
  $scope.$watch(function() {
    var filtered = $scope.games.map(function(entry) {
      return {
        id: entry.id,
        // home is 1, away is 2, tie is 0
        win: entry.winner ? entry.winner == entry.home ? 1 : 2 : 0,
        //home score and away score
        h: entry.h,
        a: entry.a
      }
    });

    // remove trailing items with no data
    for (var i = filtered.length - 1; i >= 0; i--) {
      var item = filtered[i];
      if (!item.win && !item.h && !item.a) {
        filtered.pop();
      }
    }

    var encoded = "#" + qs.encode({
      games: ascii.pack(aKeys, filtered),
      timestamp: Date.now()
    });
    history.replaceState(encoded, encoded, encoded);
    localStorage.setItem("hawks-prediction", JSON.stringify(filtered));
  });

}
prediction.$inject = ["$scope"];

app.controller("prediction", prediction);

