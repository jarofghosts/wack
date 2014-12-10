var color = require('bash-color')
  , through = require('through')

module.exports = prettify

function prettify(options) {
  return prettyStream

  function prettyStream() {
    var tr = through(pretty)
      , currentFile

    return tr

    function pretty(obj) {
      var filename = obj.filename.slice(options.dir.length)
        , line = obj.line + ':'
        , fileOut = filename
        , str = obj.context
        , finalString
        , toOutput

      if(options.nocolor || options.invertmatch) {
        toOutput = ' ' + line + ' ' + str
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
        tr.queue(fileOut + '\n')
      }

      tr.queue(toOutput + '\n')
    }
  }
}
