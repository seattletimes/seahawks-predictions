var cipher = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_.~"

var pack = function(keys, data) {
  var buffer = [];
  data.forEach(function(d) {
    keys.forEach(k => buffer.push((d[k] || 0) * 1));
  });
  var high = Math.max.apply(null, buffer);
  var max = cipher.length - 1;
  var size = Math.floor(high / max) + 1;
  var out = buffer.map(function(v) {
    var overflow = Math.floor(v / max);
    var last = v % max;
    var repeated = new Array(overflow + 1).join(cipher[max]);
    var padding = new Array(size - overflow).join(cipher[0]);
    var packed = padding + cipher[last] + repeated;
    return packed;
  });
  return keys.length.toString() + size + out.join("");
};

var unpack = function(keys, packed) {
  var output = [];
  var stride = packed[0];
  var width = packed[1];
  var data = packed.slice(2);
  for (var i = 0; i < data.length; i += stride * width) {
    var item = {};
    for (var j = 0; j < stride; j++) {
      var key = keys[j];
      var value = data.substr(i + j * width, width).split("").map(c => cipher.indexOf(c)).reduce((p, n) => n + p, 0);
      item[key] = value;
    }
    output.push(item);
  }
  return output;
}

module.exports = { pack, unpack };