var path = require('path')

var escape = require('quotemeta')
  , through = require('through')

module.exports = wack

function wack(_options) {
  var bad_chars = /[\x00-\x1F\x80-\x9F]+/
    , options = _options || {}
    , current_file
    , file_count
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
    if(obj.filename !== current_file) {
      current_file = obj.filename
      file_count = 0
    }

    var result = {}
      , match

    if(bad_chars.test(obj.data)) return

    match = regex.exec(obj.data)

    if((match && options.invertmatch) || (!match && !options.invertmatch)) {
      return
    }

    if(options.maxcount && ++file_count > options.maxcount) return

    result.filename = obj.filename
    result.line = obj.line
    result.context = obj.data
    result.match = match

    tr.queue(result)
    if(options.justone) tr.queue(null)
  }
}
