var path = require('path')

var escape = require('quotemeta')
var through = require('through2')

module.exports = wack

function wack (_options) {
  var badChars = /[\x00-\x1F\x80-\x9F]+/
  var options = _options || {}

  var currentFile
  var fileCount

  var regex = new RegExp(
    escape(options.pattern),
    options.ignorecase ? 'i' : ''
  )

  var stream = through.obj(write)

  options.dir = path.normalize(options.dir || process.cwd())

  return stream

  function write (obj, _, next) {
    var result = {}

    var match

    if (obj.filename !== currentFile) {
      currentFile = obj.filename
      fileCount = 0
    }

    if (badChars.test(obj.data)) {
      return next()
    }

    match = regex.exec(obj.data)

    if ((match && options.invertmatch) || (!match && !options.invertmatch)) {
      return next()
    }

    if (options.maxcount && ++fileCount > options.maxcount) {
      return next()
    }

    result.filename = obj.filename
    result.line = obj.chunk
    result.context = obj.data
    result.match = match

    stream.push(result)

    if (options.justone) {
      return stream.push(null)
    }

    next()
  }
}
