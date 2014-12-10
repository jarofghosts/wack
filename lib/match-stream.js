var path = require('path')

var escape = require('quotemeta')
  , through = require('through')

module.exports = wack

function wack(_options) {
  var badChars = /[\x00-\x1F\x80-\x9F]+/
    , options = _options || {}
    , currentFile
    , fileCount
    , regex
    , tr

  regex = new RegExp(
      escape(options.pattern)
    , options.ignorecase ? 'i' : ''
  )

  if(!options.dir) options.dir = process.cwd()

  options.dir = path.normalize(options.dir)

  tr = through(write)

  return tr

  function write(obj) {
    if(obj.filename !== currentFile) {
      currentFile = obj.filename
      fileCount = 0
    }

    var result = {}
      , match

    if(badChars.test(obj.data)) return

    match = regex.exec(obj.data)

    if((match && options.invertmatch) || (!match && !options.invertmatch)) {
      return
    }

    if(options.maxcount && ++fileCount > options.maxcount) return

    result.filename = obj.filename
    result.line = obj.line
    result.context = obj.data
    result.match = match

    tr.queue(result)
    if(options.justone) tr.queue(null)
  }
}
