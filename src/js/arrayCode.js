/*

This module packs an array of objects into a string of text. In order to
achieve very small packed data sizes, all the objects must only contain
integer values from 0 to n^2, where n is the size of the cipher character
space (currently 65), and the keys must be provided during both packing and
unpacking. Packed strings are forward compatible, as long as you only add keys
onto the end of the list when packing/unpacking.

A packed string always starts with two numbers. The first is a flag value that
tells the decoder how many keys are encoded per object (the stride). The
second tells the decoder how many digits each value should contain. In
practice, this is almost always 1 or 2.

Because this coding can only encode arrays containing objects with numerical
values, it can't be used to save metadata, such as the user's name or the
timestamp of the data's creation. However, it uses only characters that are in
the URI Component range, meaning that you can use it as a single item in a
query string. The current implementation of the page does this, placing the
games into a "games" query param, while other query params specify the
timestamp when it was updated.

*/

var cipher = "0123456789-_.~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

var pack = function(keys, data) {
  var buffer = [];
  //store all data in a flat array as an integer
  data.forEach(function(d) {
    keys.forEach(k => buffer.push(d[k] | 0));
  });
  // find the highest value in the buffer
  var high = Math.max.apply(null, buffer);
  // find the highest possible single-character value (65)
  var max = cipher.length - 1;
  // compute how many "digits" we need to express the highest value
  var size = 1;
  while (Math.pow(65, size) < high) size++;
  // convert the buffer into strings of digits
  var out = buffer.map(function(v) {
    var packed = "";
    //step down through the digits and create the converted base-N number
    for (var i = size - 1; i > 0; i--) {
      var digit = Math.floor(v / Math.pow(max, i));
      packed += cipher[digit];
      v -= digit * Math.pow(max, i);
    }
    packed += cipher[v];
    return packed;
  });
  // add the packing metadata onto the front of the array
  return keys.length.toString() + size + out.join("");
};

var unpack = function(keys, packed) {
  var output = [];
  //extract the metadata and packed array
  var stride = packed[0];
  var width = packed[1];
  var max = cipher.length - 1;
  var data = packed.slice(2);
  //walk through the values
  for (var cell = 0; cell < data.length; cell += stride * width) {
    var item = {};
    // extract the values for each key
    for (var j = 0; j < stride; j++) {
      var key = keys[j];
      //get the numerical values for the individual digits in each value
      var digits = data.substr(cell + j * width, width).split("").map(n => cipher.indexOf(n));
      //turn those digits into a summed number
      //i.e., [2, 3] in base-65 is 2 * 65 + 3
      var values = digits.map((n, i) => n * Math.pow(max, width - i - 1));
      var sum = values.reduce((a, b) => a + b, 0);
      //set the key/value on the object
      item[key] = sum;
    }
    output.push(item);
  }
  return output;
}

module.exports = { pack, unpack };