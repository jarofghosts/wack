var path = require('path')

var escape = require('quotemeta')
  , through = require('through2')

module.exports = wack

function wack(_options) {
  var badChars = /[\x00-\x1F\x80-\x9F]+/
    , options = _options || {}
    , currentFile
    , fileCount
    , stream
    , regex

  regex = new RegExp(
      escape(options.pattern)
    , options.ignorecase ? 'i' : ''
  )

  options.dir = path.normalize(options.dir || process.cwd())

  stream = through.obj(write)

  return stream

  function write(obj, x, next) {
    var result = {}
      , match

    if(obj.filename !== currentFile) {
      currentFile = obj.filename
      fileCount = 0
    }

    if(badChars.test(obj.data)) {
      return next()
    }

    match = regex.exec(obj.data)

    if((match && options.invertmatch) || (!match && !options.invertmatch)) {
      return next()
    }

    if(options.maxcount && ++fileCount > options.maxcount) {
      return next()
    }

    result.filename = obj.filename
    result.line = obj.chunk
    result.context = obj.data
    result.match = match

    stream.push(result)

    if(options.justone) {
      return stream.push(null)
    }

    next()
  }
}
