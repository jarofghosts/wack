var path = require('path')

var filestream = require('file-content-stream')
  , dirstream = require('dir-stream')
  , police = require('stream-police')
  , through = require('through')
  , es = require('event-stream')
  , type = require('ack-types')

var prettify = require('./lib/pretty-stream')
  , wack = require('./lib/match-stream')

module.exports = wack_stream

function wack_stream(_settings) {
  var ignore_dirs = ['.git', '.hg', '.svn']
    , settings = _settings || {}
    , police_args = {}

  settings.types = settings.type ?
      settings.type.split(',') : []
  settings.exclude = settings.notype ?
      settings.notype.split(',') : []

  if(settings.knowntypes) {
    police_args.verify = add_extension_rexes(type.allExtensions)
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
    ignore_dirs = ignore_dirs.concat(settings.ignoredir.split(','))
  }

  var dir_filter_stream = dirstream({
      onlyFiles: true
    , noRecurse: settings.norecurse
    , ignore: ignore_dirs
  })

  var stream = es.pipeline(
      dir_filter_stream
    , police(police_args)
    , filestream()
    , wack(settings)
  )

  stream.prettify = prettify(settings)

  return stream
}

function add_extension_rexes(extensions) {
  var result = []

  for(var i = 0, l = extensions.length; i < l; ++i) {
    result.push(new RegExp('\\.' + extensions[i] + '$', 'i'))
  }

  return result
}

