var filestream = require('file-content-stream')
var dirstream = require('dir-stream')
var duplexify = require('duplexify')

var fileFilter = require('./lib/file-filter-stream')
var prettify = require('./lib/pretty-stream')
var wack = require('./lib/match-stream')

module.exports = wackStream

function wackStream (_settings) {
  var ignoreDirs = ['.git', '.hg', '.svn']
  var settings = _settings || {}

  var dirFilterStream
  var stream

  var fileFilterStream = fileFilter(
    settings.type,
    settings.notype,
    settings.knowntypes
  )

  if (settings.ignoredir) {
    ignoreDirs = ignoreDirs.concat(settings.ignoredir.split(','))
  }

  dirFilterStream = dirstream({
    onlyFiles: true,
    noRecurse: settings.norecurse,
    ignore: ignoreDirs
  })

  stream = duplexify.obj(
    dirFilterStream,
    dirFilterStream
      .pipe(fileFilterStream)
      .pipe(filestream())
      .pipe(wack(settings))
  )

  stream.prettify = prettify(settings)

  return stream
}
