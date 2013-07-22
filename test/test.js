var assert = require('assert'),
    wack = require('../index.js'),
    stream = require('stream'),
    Readable = stream.Readable,
    Writable = stream.Writable,
    rs = Readable(),
    ws = Writable(),
    badTimeout;

badTimeout = setTimeout(function () {
  assert.ok(false);
}, 500);

ws._write = function (data, enc, next) {
  if (data.toString().match(/hey/)) clearTimeout(badTimeout);
  next();
}
rs._read = function () {
  rs.push(__dirname);
  rs.push(null);
}

rs.pipe(wack({ pattern: 'hey' })).pipe(ws);

