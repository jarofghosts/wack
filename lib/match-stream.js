var path = require('path')

var through = require('through')

module.exports = wack

function wack(options) {
  var bad_chars = /[\x00-\x1F\x80-\x9F]+/
    , current_file
    , file_count
    , tr

  options = options || {}
  
  if(!options.dir) options.dir = process.cwd()
  if(!/^\//.test(options.dir)) options.dir = path.normalize(options.dir)

  tr = through(write)

  return tr

  function write(obj) {
    var regex = new RegExp(
        options.pattern
      , 'g' + (options.ignorecase ? 'i' : '')
    )

    if(obj.filename !== current_file) {
      file_count = 0
      current_file = obj.filename
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
