var assert = require('assert'),
    wack = require('../index.js'),
    stream = require('stream'),
    Readable = stream.Readable,
    Writable = stream.Writable,
    rs = Readable(),
    ws = Writable();

ws._write = function (data, enc, next) {
  if (data.toString().match(/hey/)) assert.ok(false);
  next();
}
rs._read = function () {
  rs.push(__dirname);
  rs.push(null);
}

rs.pipe(wack({ pattern: 'hey', knowntypes: true })).pipe(ws);

