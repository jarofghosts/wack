var path = require('path')

var police = require('stream-police')
var type = require('ack-types')

module.exports = filterStream

function filterStream (good, bad, justKnown) {
  var include
  var exclude

  if (justKnown) {
    include = type.allExtensions()
  } else {
    include = good ? good.split(',').reduce(toAck, []) : null
  }

  exclude = bad ? bad.split(',').reduce(toAck, []) : null

  return police(verify)

  function toAck (extensions, name) {
    return extensions.concat(type.reverseLookup(name))
  }

  function verify (filename) {
    var extension = path.extname(filename.toString()).slice(1)

    if (exclude && exclude.indexOf(extension) > -1) {
      return false
    }

    if (include) {
      return include.indexOf(extension) > -1
    }

    return true
  }
}
