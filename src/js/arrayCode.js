/*

This module packs an array of objects into a string of text. In order to
achieve very small packed data sizes, all the objects must only contain
numeric values, and the keys must be provided during both packing and
unpacking. Packed strings are forward compatible, as long as you only add keys
onto the end of the list when packing/unpacking.

A packed string always starts with two numbers. The first number tells the
decoder how many keys are encoded per object (the stride). The second number
indicates the width of each value. The remaining text is the actual data from
the array items.

Because this coding can only encode arrays containing objects with numerical
values, it can't be used to save metadata, such as the user's name or the
timestamp of the data's creation. However, it uses only characters that are in
the URI Component range, meaning that you can use it as a single item in a
query string. The current implementation of the page does this, placing the
games into a "games" query param, while other query params specify the
timestamp when it was updated.

*/

var cipher = "-_.~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

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