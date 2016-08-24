var Share = require("./share.min.js");

var addQuery = function(url, query) {
  var joiner = url.indexOf("?") > -1 ? "&" : "?";
  return url + joiner + query;
};

var utm = function(source, medium) {
  return `utm_source=${source}&utm_medium=${medium || "social"}&utm_campaign=projects`;
};

var makeShare = function(selector, position, url) {

  var here = url || window.location.href;

  var config = {
    
    ui: {
      flyout: position || "bottom left"
    },
    networks: {
      twitter: {
        url: addQuery(here, utm("twitter"))
      },
      facebook: {
        url: addQuery(here, utm("facebook"))
      },

    }
  };

  var s = new Share(selector, config);

  s.config.networks.email.description += " " + addQuery(here, utm("email_share", "email"));

  return s;
};

var top = makeShare(".share.top");
var bottom = makeShare(".share.bottom", "top left");

var update = function(buttons, url) {
  buttons.forEach(function(b) {
    var n = b.config.networks;
    n.twitter.url = addQuery(url, utm("twitter"));
    n.facebook.url = addQuery(url, utm("facebook"));
    

  });
};


module.exports = {
  Share,
  makeShare,
  addQuery,
  utm,
  update,
  buttons: [top, bottom]
}