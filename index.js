var through = require('through'),
    dirstream = require('dir-stream'),
    filestream = require('file-content-stream'),
    es = require('event-stream'),
    police = require('stream-police'),
    type = require('ack-types'),
    color = require('bash-color'),
    Readable = require('stream').Readable,
    path = require('path')

module.exports = streamWack

function wack(options) {
  var currentFile = null,
      fileCount = 0,
      badChars = /[\x00-\x1F\x80-\x9F]+/

  options = options || {}
  
  if (!options.dir) options.dir = process.cwd()
  if (!/^\//.test(options.dir)) options.dir = path.normalize(options.dir)
  options.regex = new RegExp(options.pattern,
    'g' + (options.ignorecase ? 'i' : ''))
  
  tr = through(write)

  return tr

  function write(obj) {
    if (badChars.test(obj.data)) return
    var match = options.regex.exec(obj.data)
    if ((match && !options.invertmatch) || (!match && options.invertmatch)) {
      var filename = obj.filename.substring(options.dir.length),
          line = obj.line + ':',
          str = obj.data,
          fileOut = filename,
          toOutput

      if (options.nocolor || options.invertmatch) {
        toOutput = ['', line, str].join(' ')
      } else {
        fileOut = color.green(filename)
        var finalString = [str.substring(0, match.index),
                           color.yellow(match[0], true),
                           str.substring(match.index + match[0].length)
                          ].join(''),
            toOutput = ['',
                        color.wrap(line,
                        color.colors.WHITE,
                        color.styles.bold),
                        finalString].join(' ')
      
      }

      if (filename != currentFile) {
        fileCount = 1
        currentFile = filename
        this.queue(fileOut + '\n')
      } else {
        if (options.maxcount) {
          fileCount++
          if (fileCount > options.maxcount) return
        }
      }
      this.queue(toOutput + '\n')
      if (options.justone) tr.queue(null)
    }
  }

}
function addExtensionRegexps(extensions) {
  var i = 0,
      l = extensions.length,
      result = []
  for (; i < l; ++i) {
    result.push(new RegExp('\\.' + extensions[i] + '$', 'i'));
  }
  return result
}
function streamWack(settings) {

  var policeArgs = {},
      ignoreDirs = ['.git', '.hg', '.svn']

  settings.types = settings.type ?
    settings.type.replace(/\s+/, '').split(',') : []
  settings.exclude = settings.notype ?
    settings.notype.replace(/\s+/, '').split(',') : []

  if (settings.knowntypes) {
    policeArgs.verify = [].concat(addExtensionRegexps(type.allExtensions))
  }
  if (settings.exclude.length) {
    policeArgs.exclude = []
    var i = 0,
        l = settings.exclude.length
    for (; i < l; ++i) {
      policeArgs.exclude = policeArgs.exclude.concat(
        addExtensionRegexps(type.reverseLookup(settings.exclude[i]))
      )
    }
  }
  if (settings.types.length) {
    policeArgs.verify = policeArgs.verify || []
    var j = 0,
        k = settings.types.length
    for (; j < k; ++j) {
      policeArgs.verify = policeArgs.verify.concat(
        addExtensionRegexps(type.reverseLookup(settings.types[j]))
      )
    }
  }

  if (settings.ignoredir) {
    ignoreDirs = ignoreDirs.concat(
      settings.ignoredir.replace(/\s+/g, '').split(',')
    )
  }

  return es.pipeline(dirstream({ onlyFiles: true,
                                 noRecurse: settings.norecurse,
                                 ignore: ignoreDirs }),
                     police(policeArgs),
                     filestream(),
                     wack(settings))
}
