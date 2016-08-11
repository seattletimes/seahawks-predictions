require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var app = require("./application");
var ascii = require("./arrayCode");
var aKeys = "win h a".split(" ");

var parseQuery = function(qs) {
  var out = {};
  var parts = qs.split("&");
  parts.forEach(function(p) {
    var [key, value] = p.split("=");
    out[key] = value;
  });
  return out;
}

var encodeQuery = function(data) {
  var qs = [];
  for (var k in data) {
    qs.push(k + "=" + data[k]);
  }
  return qs.join("&");
}

               
var prediction = function($scope) {
  
  $scope.games = window.games;
  var person = "user";

  var restore = function(source) {
    source.forEach(function(g, i) {
      for (var k in g) {
        $scope.games[i][k] = g[k];
      }
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
  var query = parseQuery(hash);
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
      //limit scores to 99 at highest
      if (entry.a > 99) entry.a = 99;
      if (entry.h > 99) entry.h = 99;
      return {
        id: entry.id,
        win: entry.win,
        //home score and away score
        h: entry.h,
        a: entry.a
      }
    });

    var encoded = "#" + encodeQuery({
      games: ascii.pack(aKeys, filtered),
      timestamp: Date.now()
    });
    history.replaceState(encoded, encoded, encoded);
    localStorage.setItem("hawks-prediction", JSON.stringify(filtered));
  });

}
prediction.$inject = ["$scope"];

app.controller("prediction", prediction);

