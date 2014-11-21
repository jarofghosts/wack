var filestream = require('file-content-stream')
  , dirstream = require('dir-stream')
  , police = require('stream-police')
  , es = require('event-stream')
  , type = require('ack-types')

var prettify = require('./lib/pretty-stream')
  , wack = require('./lib/match-stream')

module.exports = wackStream

function wackStream(_settings) {
  var ignoreDirs = ['.git', '.hg', '.svn']
    , settings = _settings || {}
    , policeArgs = {}

  var dirFilterStream
    , stream
    , i
    , l

  settings.types = settings.type ? settings.type.split(',') : []
  settings.exclude = settings.notype ? settings.notype.split(',') : []

  if(settings.knowntypes) {
    policeArgs.verify = addExtensionRexes(type.allExtensions())
  }

  if(settings.exclude.length) {
    policeArgs.exclude = []

    for(i = 0, l = settings.exclude.length; i < l; ++i) {
      policeArgs.exclude = policeArgs.exclude.concat(
        addExtensionRexes(type.reverseLookup(settings.exclude[i]))
      )
    }
  }

  if(settings.types.length) {
    policeArgs.verify = policeArgs.verify || []

    for(i = 0, l = settings.types.length; i < l; ++i) {
      policeArgs.verify = policeArgs.verify.concat(
        addExtensionRexes(type.reverseLookup(settings.types[i]))
      )
    }
  }

  if(settings.ignoredir) {
    ignoreDirs = ignoreDirs.concat(settings.ignoredir.split(','))
  }

  dirFilterStream = dirstream({
      onlyFiles: true
    , noRecurse: settings.norecurse
    , ignore: ignoreDirs
  })

  stream = es.pipeline(
      dirFilterStream
    , police(policeArgs)
    , filestream()
    , wack(settings)
  )

  stream.prettify = prettify(settings)

  return stream
}

function addExtensionRexes(extensions) {
  var result = []

  for(var i = 0, l = extensions.length; i < l; ++i) {
    result.push(new RegExp('\\.' + extensions[i] + '$', 'i'))
  }

  return result
}
