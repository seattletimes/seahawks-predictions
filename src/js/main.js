var social = require("./lib/social");
require("./lib/ads");
// var track = require("./lib/tracking");
require("angular");
var animate = require("./lib/animateScroll");
var qs = require("querystring");
var ascii = require("./arrayCode");
var Share = require("share");
var aKeys = "winner".split(" ");

var app = angular.module("predictions", []);

var prediction = function($scope) {

  $scope.games = window.games.schedule;

  $scope.experts = window.experts.expert;

  var alreadyComplete = false;
  var userCompleted = false;
  var animating = false;

  $scope.clear = function() {
    $scope.games.forEach(function(g) {
      g.winner = 0;
    });
    $scope.seahawks = "";
    alreadyComplete = false;
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

  var countScores = function() {
    var seaWins = 0;
    var otherWins = 0;

    $scope.experts.forEach(function(e) {
      e.score = 0;
    });

    for (var i = 0; i < $scope.games.length; i++) {

      $scope.experts.forEach(function(expert) {
        var exp = expert.prediction;
        if ($scope.games[i].winner === $scope.games[i][exp]) {
          expert.score++;
        }

      });

      if ($scope.games[i].winner === "seahawks") {
        seaWins++;
      }
      else { otherWins++; }
    }

    $scope.seahawks = seaWins;
    $scope.other = otherWins;

    if (alreadyComplete) {
      $scope.instructions = true;
    }
  }

  window.bam = function() {
    $scope.games.forEach(g => g.winner = "seahawks");
    $scope.$apply();
  }


  // When any data changes (or for each digest cycle), run this function
  $scope.$watch(function() {

    if ($scope.games.every(game => game.winner)) {
      countScores();

      if (!alreadyComplete) {
        $scope.instructions = false;
        var box = document.querySelector(".congrats");
        if (!animating) {
          setTimeout(() => animate(box), 200);
          animating = true;
        }

        new Share(".share-results", {
          description: "I think the Seahawks will go " + $scope.seahawks + "-" + $scope.other + " this season. What’s your prediction for 2016? Make your picks: ",
          ui: {
            flyout: "bottom right",
            button_text: "Show your friends"
          }
        });
      }
    }

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
prediction.$inject = ["$scope"];

app.controller("prediction", prediction);