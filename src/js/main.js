var social = require("./lib/social");
//require("./lib/ads");
// var track = require("./lib/tracking");

var qs = require("querystring");
var app = require("./application");
var ascii = require("./arrayCode");
var aKeys = "winner h a".split(" ");

var prediction = function($scope) {

  $scope.games = window.games.schedule;

  console.log($scope.games);

  $scope.share="submit";

  $scope.clear = function() {
    $scope.games.forEach(function(g) {
      g.winner = 0;
    });
  }

  $scope.results="See your results below";


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
    });
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

    //create a coded version of the scores
    var filtered = $scope.games.map(function(entry) {
      return {
        id: entry.id,
        // home is 1, away is 2, tie is 0
        winner: entry.winner ? entry.winner == entry.home ? 1 : 2 : 0
      }

    });

    var seaWins = 0;
    for (var i = 0; i < $scope.games.length; i++) {
      if ($scope.games[i].winner === "seahawks") {
        seaWins++;
      }
    }
    
      var counter = 0;
      filtered.forEach(function(f) {
        counter += f.winner;
        console.log(f);
        if (counter > 15) {
    $scope.seahawks = seaWins;
        };
        
      });

    $scope.submit = function() {

      $scope.results = "You think the Seahawks will win " + seaWins + " out of 16 games this season!";

      $scope.share = "share your results";
      

    };

    // remove trailing items with no data
    /*    for (var i = filtered.length - 1; i >= 0; i--) {
      var item = filtered[i];
      if (!item.winner) {
        filtered.pop();
      }
    }*/

    //encode this into a URL hash and set it
    var encoded = "#" + qs.encode({
      games: ascii.pack(aKeys, filtered)
    });
    history.replaceState(encoded, encoded, encoded);
    //update the social buttons on the page
    social.update(social.buttons, window.location.href);
    //store in localStorage, no encoding needed
    localStorage.setItem("hawks-prediction", JSON.stringify(filtered));
  });
}

app.controller("prediction", prediction);