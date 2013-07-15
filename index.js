#!/usr/bin/env node

var c = require('commander'),
    through = require('through'),
    dirstream = require('dir-stream'),
    filestream = require('file-content-stream'),
    type = require('ack-types'),
    color = require('bash-color'),
    Readable = require('stream').Readable,
    rs = Readable(),
    path = require('path'),
    isCli = (require.main === module);;

module.exports = wack;

function wack(options) {

  var currentFile = null,
      fileCount = 0;

  options = options || {};
  
  if (!options.dir) options.dir = process.cwd();
  if (!options.dir.match(/^\//)) options.dir = path.normalize(options.dir);

  options.types = options.type ? options.type.replace(/\s+/, '').split(',') : [];
  options.exclude = options.notype ? options.notype.replace(/\s+/, '').split(',') : [];
  options.regex = options.ignorecase ? new RegExp(options.pattern, "ig") : new RegExp(options.pattern, "g");
  
  tr = through(write, end);

  function write(obj) {
    if (options.exclude.length) {
      var i = 0,
          l = options.exclude.length;
      for (; i < l; ++i) {
        if (type.compare(obj.filename, options.exclude[i])) return
      }
    }
    if (options.types.length) {
      var i = 0,
          proceed = false,
          l = options.types.length;
      for (; i < l; ++i) {
        if (type.compare(obj.filename, options.types[i])) proceed = true;
      }
      if (!proceed) return
    }
    var match = options.regex.exec(obj.data);
    if ((match && !options.invertmatch) || (!match && options.invertmatch)) {
      var filename = obj.filename.substring(options.dir.length),
          line = obj.line + ':',
          str = obj.data,
          fileOut = filename,
          toOutput = '';
      if (options.nocolor || options.invertmatch) {
        toOutput = ' ' + line + ' ' + str + '\n';
      } else {

        fileOut = color.green(filename);
        var finalString = str.substring(0, match.index) + 
                          color.yellow(match[0], true) +
                          str.substring(match.index + match[0].length),
            toOutput = ' ' + color.wrap(line, color.colors.WHITE, color.styles.bold) + ' ' + finalString + '\n';
      
      }

      if (filename != currentFile) {
        fileCount = 1;
        currentFile = filename;
        this.queue(fileOut + '\n');
      } else {
        if (options.maxcount) fileCount++;
        if (fileCount > options.maxcount) return
      }
      this.queue(toOutput);
      if (options.justone) tr.queue(null);
    }
  }

  function end() {
    this.queue(null);
  }

  return tr;

}
if (isCli) {
  c
    .version('0.0.7')
    .usage('[options] pattern')
    .option('-d, --dir <dirname>', 'search through directory | default cwd')
    .option('-i, --ignorecase', 'ignore regex case')
    .option('-m, --maxcount <num>', 'only show maximum of <num> results per file', parseInt)
    .option('-n, --norecurse', 'no subdirectory checking')
    .option('-v, --invertmatch', 'show non-matching lines')
    .option('-t, --type <type1[,type2...]>', 'comma separated list of types to limit search to')
    .option('-T, --notype <type1[,type2...]>', 'comma separated list of types to exclude from search')
    .option('-1, --justone', 'show only the first result')
    .option('-C, --nocolor', 'turn colorizing off for results')
    .parse(process.argv);

  if (!c.args.length) c.help();

  var settings = {
    dir: c.dir,
    ignorecase: c.ignorecase,
    maxcount: c.maxcount,
    norecurse: c.norecurse,
    invertmatch: c.invertmatch,
    type: c.type,
    notype: c.notype,
    justone: c.justone,
    nocolor: c.nocolor,
    pattern: c.args[0]
  };

  rs.push(c.dir ? path.normalize(c.dir) : process.cwd());
  rs.push(null);

  rs.pipe(dirstream({ onlyFiles: true, noRecurse: c.norecurse })).pipe(filestream()).pipe(wack(settings)).pipe(process.stdout);
}

