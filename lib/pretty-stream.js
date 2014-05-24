var color = require('bash-color')
  , through = require('through')

module.exports = prettify

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

