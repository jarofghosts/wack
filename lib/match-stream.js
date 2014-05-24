var path = require('path')

var through = require('through')

module.exports = wack

function wack(options) {
  var bad_chars = /[\x00-\x1F\x80-\x9F]+/
    , tr

  options = options || {}
  
  if(!options.dir) options.dir = process.cwd()
  if(!/^\//.test(options.dir)) options.dir = path.normalize(options.dir)

  options.regex = new RegExp(
      options.pattern
    , 'g' + (options.ignorecase ? 'i' : '')
  )
  
  tr = through(write)

  return tr

  function write(obj) {
    var result = {}
      , match

    if(bad_chars.test(obj.data)) return

    match = options.regex.exec(obj.data)

    if((match && options.invertmatch) || (!match && !options.invertmatch)) {
      return
    }

    result.filename = obj.filename
    result.line = obj.line
    result.context = obj.data
    result.match = match

    tr.queue(result)
    if(options.justone) tr.queue(null)
  }
}
