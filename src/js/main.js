var social = require("./lib/social");
//require("./lib/ads");
// var track = require("./lib/tracking");
var animate = require("./lib/animateScroll");
var qs = require("querystring");
var app = require("./application");
var ascii = require("./arrayCode");
var Share = require("share");
var aKeys = "winner".split(" ");
var prediction = function($scope) {

  $scope.games = window.games.schedule;

  var alreadyComplete = false;

  $scope.clear = function() {
    $scope.games.forEach(function(g) {
      g.winner = 0;
    });
    $scope.seahawks = "";
    alreadyComplete = false;
  }

  //for testing
  $scope.setAll = function() {
    for (var i = 0; i < 15; i++) {
      $scope.games[i].winner = "seahawks";
    }

  }




  //assigns data on top of existing data
  var restore = function(source) {
    source.forEach(function(g, i) {
      var game = $scope.games[i];
      if (g.winner) {
        alreadyComplete = true;
      }
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




    function completed(game) {
      return (game.winner);
    }

    if ($scope.games.every(completed)) {
      
          var seaWins = 0;
    var otherWins = 0;
    var bobMatch = 0;
    var jaysonMatch = 0;



    for (var i = 0; i < $scope.games.length; i++) {
      var winner = $scope.games[i].winner;

      if (winner === $scope.games[i].bobWinner) {
        bobMatch++;
      }
      if (winner === $scope.games[i].jaysonWinner) {
        jaysonMatch++;
      }
      
      if (winner === "seahawks") {
        seaWins++;
      }
      else { otherWins++; }
    }

        
      $scope.seahawks = seaWins;
      window.score = {seaWins};

      $scope.other = otherWins; 
      $scope.bobMatch = bobMatch;
      $scope.jaysonMatch = jaysonMatch;
      if (!alreadyComplete) {
        var box = document.querySelector(".congrats");
        animate(box); 
      }
    }

    new Share(".share-results", {
      description: "I think the Seahawks will go " + seaWins + "-" + otherWins + " this season." + document.querySelector(`meta[property="og:description"]`).innerHTML,
      ui: {
        flyout: "bottom right",
        button_text: "Tell your friends"
      },
      networks: {
        email: {
          description: "I think the Seahawks will go " + seaWins + "-" + otherWins + " this season."  + [document.querySelector(`meta[property="og:description"]`).innerHTML, window.location.href].join("\n")
        }
      }
    });

    //create a coded version of the scores
    var filtered = $scope.games.map(function(entry) {
      return {
        id: entry.id,
        // home is 1, away is 2, tie is 0
        winner: entry.winner ? entry.winner == entry.home ? 1 : 2 : 0
      }

    });

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
