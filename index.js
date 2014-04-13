var Readable = require('stream').Readable
  , path = require('path')

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
    , current_file = null
    , file_count = 0

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
    if(bad_chars.test(obj.data)) return

    var match = options.regex.exec(obj.data)

    if((match && options.invertmatch) || (!match && !options.invertmatch)) {
      return
    }

    var filename = obj.filename.substring(options.dir.length)
      , line = obj.line + ':'
      , file_out = filename
      , str = obj.data
      , to_output

    if (options.nocolor || options.invertmatch) {
      to_output = ' ' + line + ' ' + str
    } else {
      file_out = color.green(filename)
      var final_string = str.slice(0, match.index)
      final_string += color.yellow(match[0], true)
      final_string += str.slice(match.index + match[0].length)

      to_output = ' ' +color.wrap(line, color.colors.WHITE, color.styles.bold)
      to_output += final_string
    }

    if(filename !== current_file) {
      file_count = 1
      current_file = filename
      this.queue(file_out + '\n')
    } else if(options.maxcount && ++file_count > options.maxcount) return

    this.queue(to_output + '\n')
    if(options.justone) tr.queue(null)
  }
}

function add_extension_rexes(extensions) {
  var result = []

  for (var i = 0, l = extensions.length; i < l; ++i) {
    result.push(new RegExp('\\.' + extensions[i] + '$', 'i'))
  }

  return result
}

function wack_stream(settings) {
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

  return es.pipeline(
      dirstream({
          onlyFiles: true
        , noRecurse: settings.norecurse
        , ignore: ignore_dirs
      })
    , police(police_args)
    , filestream()
    , wack(settings)
  )
}
