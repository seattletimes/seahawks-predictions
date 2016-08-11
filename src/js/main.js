var social = require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var qs = require("querystring");
var app = require("./application");
var ascii = require("./arrayCode");
var aKeys = "winner h a".split(" ");

// set up the preset configs
var presets = window.games.pundits;
window.games.presets.forEach(function(row) {
  var pundit = presets[row.author];
  if (!pundit.games) pundit.games = [];
  pundit.games.push(row);
});

//zero out the scores
window.games.schedule.forEach(function(row) {
  row.h = 0;
  row.a = 0;
});
               
var prediction = function($scope) {
  
  $scope.games = window.games.schedule;
  var person = "user";
  var saved = null;

  //called to clear out data when swapping presets
  var reset = function() {
    $scope.games.forEach(function(g) {
      g.winner = null;
      g.a = 0;
      g.h = 0;
    });
  }

  //assigns data on top of existing data
  var restore = function(source) {
    source.forEach(function(g, i) {
      var game = $scope.games[i];
      if (typeof g.winner == "string") {
        //handle loading the presets
        game.winner = g.winner;
      } else if (g.winner > 0) {
        game.winner = g.winner == 1 ? game.home : game.away;
      }
      
      game.a = g.a;
      game.h = g.h;
    });
  }
  
  $scope.switchView = function(name) {  
    $scope.msg = 'clicked';
    if (person == name) return;

    if (person == "user") {
      //stringify to "freeze" the values
      //this is tied to the way JS references work, don't worry about it.
      saved = JSON.stringify($scope.games.slice());
    }
    reset();
    if (name == "user") {
      restore(JSON.parse(saved));
    } else {
      var p = presets[name];
      if (!p || !p.games) return;
      restore(p.games);
    }
    person = name;
  }
  
  // on startup, check the window hash for a games parameter
  var hash = window.location.hash.replace(/^#/, "");
  var query = qs.decode(hash);
  if (query.games) {
    //hashes are encoded, you must provide the object keys you want to be restored
    var fromURL = ascii.unpack(aKeys, query.games);
    if (fromURL) restore(fromURL);
  } else {
    //if there's no hash, check localStorage
    //this is just saved as JSON
    var fromLocal = localStorage.getItem("hawks-prediction");
    if (fromLocal) {
      fromLocal = JSON.parse(fromLocal);
      restore(fromLocal);
    }
  }
  
  // When any data changes (or for each digest cycle), run this function
  $scope.$watch(function() {
    //only persist user data, ignore the presets
    if (person != "user") return;

    //create a coded version of the scores
    var filtered = $scope.games.map(function(entry) {
      return {
        id: entry.id,
        // home is 1, away is 2, tie is 0
        winner: entry.winner ? entry.winner == entry.home ? 1 : 2 : 0,
        //home score and away score
        h: entry.h,
        a: entry.a
      }
    });

    // remove trailing items with no data
    for (var i = filtered.length - 1; i >= 0; i--) {
      var item = filtered[i];
      if (!item.winner && !item.h && !item.a) {
        filtered.pop();
      }
    }

    //encode this into a URL hash and set it
    var encoded = "#" + qs.encode({
      games: ascii.pack(aKeys, filtered),
      timestamp: Date.now()
    });
    history.replaceState(encoded, encoded, encoded);
    //update the social buttons on the page
    social.update(social.buttons, window.location.href);
    //store in localStorage, no encoding needed
    localStorage.setItem("hawks-prediction", JSON.stringify(filtered));
  });

}
prediction.$inject = ["$scope"];

app.controller("prediction", prediction);

