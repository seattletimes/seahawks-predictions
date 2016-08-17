var social = require("./lib/social");
//require("./lib/ads");
// var track = require("./lib/tracking");

var qs = require("querystring");
var app = require("./application");
var ascii = require("./arrayCode");
var aKeys = "winner h a".split(" ");

var prediction = function($scope) {

  $scope.games = window.games.schedule;
  
  $scope.chatter = "Here is some chatter";

      $scope.results = "Click below to see your results!";

  $scope.share = "Submit";

 var restore = function(source) {
   source.games.forEach(function(g, i) {
      var game = $scope.games[i];
      if (g.winner > 0) {
        game.winner = g.winner == 1 ? game.home : game.away;
      }
    });
  }
  var hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    
    var fromURL = JSON.parse(decodeURIComponent(hash));
    console.log("from", fromURL);
    if (fromURL.games) restore(fromURL);

  } else {
    var fromLocal = localStorage.getItem("hawks-prediction");
    if (fromLocal) {
      fromLocal = fromLocal.replace(/^#/, "");
      fromLocal = JSON.parse(decodeURIComponent(fromLocal));
          console.log(fromLocal);
      restore(fromLocal);

    }
  }

  // When any data changes (or for each digest cycle), run this function
  $scope.$watch(function() {

    //create a coded version of the scores
    var filtered = $scope.games.map(function(entry) {
      return {
        id: entry.id,
        // home is 1, away is 2, empty is 0
        winner: entry.winner ? entry.winner == entry.home ? 1 : 2 : 0
        //submit: true/false
      }
      
    });
    
    var seaWins = 0;
    for (var i = 0; i < $scope.games.length; i++) {
     if ($scope.games[i].winner === "seahawks") {
       seaWins++;
     }
    }
      $scope.seahawks = seaWins;
    

    $scope.submit = function() {

      $scope.results = "You think the Seahawks will win " + seaWins + " out of 16 games this season!";
      
      console.log($scope.games);
      $scope.share = "Share your results";
    };
    
    // remove trailing items with no data
/*    for (var i = filtered.length - 1; i >= 0; i--) {
      var item = filtered[i];
      if (!item.winner) {
        filtered.pop();
      }
    }*/

    //encode this into a URL hash and set it
    var json = JSON.stringify({ games: filtered });
    var encoded = "#" + encodeURIComponent(json);
    history.replaceState(encoded, encoded, encoded);
    //update the social buttons on the page
    social.update(social.buttons, window.location.href);
    //store in localStorage encoded
    localStorage.setItem("hawks-prediction", encoded);
  });
}

app.controller("prediction", prediction);

