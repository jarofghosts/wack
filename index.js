var path = require('path')

var filestream = require('file-content-stream')
  , dirstream = require('dir-stream')
  , police = require('stream-police')
  , color = require('bash-color')
  , through = require('through')
  , es = require('event-stream')
  , type = require('ack-types')

module.exports = wack_stream

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

    if(bad_chars.test(obj.data)) return

    var match = options.regex.exec(obj.data)

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

function add_extension_rexes(extensions) {
  var result = []

  for(var i = 0, l = extensions.length; i < l; ++i) {
    result.push(new RegExp('\\.' + extensions[i] + '$', 'i'))
  }

  return result
}

function prettify(options) {
  return pretty_stream

  function pretty_stream() {
    var tr = through(pretty)
      , file_count = 0
      , current_file

    return tr

    function pretty(obj) {
      var filename = obj.filename.slice(options.dir.length)
        , line = obj.line + ':'
        , file_out = filename
        , str = obj.context
        , final_string
        , to_output

      if(options.nocolor || options.invertmatch) {
        to_output = ' ' + line + ' ' + str
      } else {
        file_out = color.green(filename)
        final_string = str.slice(0, obj.match.index)
        final_string += color.yellow(obj.match[0], true)
        final_string += str.slice(obj.match.index + obj.match[0].length)

        to_output = ' ' +
            color.wrap(line, color.colors.WHITE, color.styles.bold)

        to_output += final_string
      }

      if(filename !== current_file) {
        file_count = 1
        current_file = filename
        tr.queue(file_out + '\n')
      } else if(options.maxcount && ++file_count > options.maxcount) return

      tr.queue(to_output + '\n')
    }
  }
}

function wack_stream(_settings) {
  var settings = _settings || {}
  var ignore_dirs = ['.git', '.hg', '.svn']
    , police_args = {}

  settings.types = settings.type ?
      settings.type.replace(/\s+/, '').split(',') : []
  settings.exclude = settings.notype ?
      settings.notype.replace(/\s+/, '').split(',') : []

  if(settings.knowntypes) {
    police_args.verify = [].concat(add_extension_rexes(type.allExtensions))
  }

  if(settings.exclude.length) {
    police_args.exclude = []

    for(var i = 0, l = settings.exclude.length; i < l; ++i) {
      police_args.exclude = police_args.exclude.concat(
        add_extension_rexes(type.reverseLookup(settings.exclude[i]))
      )
    }
  }

  if(settings.types.length) {
    police_args.verify = police_args.verify || []

    for(j = 0, k = settings.types.length; j < k; ++j) {
      police_args.verify = police_args.verify.concat(
        add_extension_rexes(type.reverseLookup(settings.types[j]))
      )
    }
  }

  if(settings.ignoredir) {
    ignore_dirs = ignore_dirs.concat(
      settings.ignoredir.replace(/\s+/g, '').split(',')
    )
  }

  var stream = es.pipeline(
      dirstream({
          onlyFiles: true
        , noRecurse: settings.norecurse
        , ignore: ignore_dirs
      })
    , police(police_args)
    , filestream()
    , wack(settings)
  )

  stream.prettify = prettify(settings)

  return stream
}
