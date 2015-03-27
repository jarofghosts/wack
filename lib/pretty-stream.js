var util = require('util')

var color = require('bash-color')
  , through = require('through2')

module.exports = prettify

function prettify(options) {
  return prettyStream

  function prettyStream() {
    var stream = through.obj(pretty)
      , currentFile

    return stream

    function pretty(obj, x, next) {
      var filename = obj.filename.slice(options.dir.length)
        , line = util.format('%s:', obj.line)
        , fileOut = filename
        , str = obj.context
        , finalString
        , toOutput

      if(options.nocolor || options.invertmatch) {
        toOutput = util.format(' %s %s ', line, str)
      } else {
        fileOut = color.green(filename)
        finalString = str.slice(0, obj.match.index)
        finalString += color.yellow(obj.match[0], true)
        finalString += str.slice(obj.match.index + obj.match[0].length)

        toOutput = ' ' +
          color.wrap(line, color.colors.WHITE, color.styles.bold)

        toOutput += finalString
      }

      if(filename !== currentFile) {
        currentFile = filename
        stream.push(fileOut + '\n')
      }

      stream.push(toOutput + '\n')

      next()
    }
  }
}
