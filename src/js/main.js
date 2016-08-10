// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var app = require("./application");

app.controller("prediction", prediction);
               
function prediction($scope) {
  $scope.user = {
    dolphins0911: {
      won: false,
      spread: 0
    },
    fortyniners0925: {
      won: false,
      spread: 0
    },
    jets1002: {
      won: false,
      spread: 0
    },
    falcons1016: {
      won: false,
      spread: 0
    },
    cardinals1023: {
      won: false,
      spread: 0
    },
    saints1030: {
      won: false,
      spread: 0
    },
    bills1107: {
      won: false,
      spread: 0
    },
    patriots1113: {
      won: false,
      spread: 0
    },
    eagles1120: {
      won: false,
      spread: 0
    },
    buccaneers1127: {
      won: false,
      spread: 0
    },
    panthers1204: {
      won: false,
      spread: 0
    },
    packers1211: {
      won: false,
      spread: 0
    },
    rams1215: {
      won: false,
      spread: 0
    },
    cardinals1224: {
      won: false,
      spread: 0
    },
    fortyniners0101: {
      won: false,
      spread: 0
    }
    
  }
  $scope.score1 = 1;
  $scope.score2 = 2;
}

prediction.$inject = ["$scope"];

