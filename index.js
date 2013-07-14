#!/usr/bin/env node

var c = require('commander'),
    through = require('through'),
    dirstream = require('dir-stream'),
    filestream = require('file-content-stream'),
    type = require('ack-types'),
    color = require('bash-color'),
    Readable = require('stream').Readable,
    rs = Readable(),
    currentFile = null,
    fileCount = 0,
    options = {};

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
  if ((match && !options.invert) || (!match && options.invert)) {
    var filename = obj.filename.replace(new RegExp('^' + options.dir), ''),
        line = obj.line + ':',
        str = obj.data,
        fileOut = filename,
        toOutput = '';
    if (options.nocolor || options.invert) {
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

c
  .version('0.0.3')
  .usage('[options] pattern')
  .option('-d, --dir <dirname>', 'search through directory | default cwd')
  .option('-i, --ignorecase', 'ignore regex case')
  .option('-m, --maxcount <num>', 'only show maximum of <num> results per file', parseInt)
  .option('-n, --norecurse', 'no subdirectory checking')
  .option('-v, --invertmatch', 'show non-matching lines')
  .option('-t, --type <type1 [,type2,...]>', 'comma separated list of types to limit search to')
  .option('-T, --notype <type1 [,type2,...]>', 'comma separated list of types to exclude from search')
  .option('-1, --justone', 'show only the first result')
  .option('-C, --nocolor', 'turn colorizing off for results')
  .parse(process.argv);

if (c.args.length) {
  options.regex = c.ignorecase ? new RegExp(c.args[0], "ig") : new RegExp(c.args[0], "g");
} else {
  c.help();
}

options.dir = c.dir || process.cwd();
options.nocolor = c.nocolor;
options.justone = c.justone;
options.maxcount = c.maxcount;
options.invert = c.invertmatch;
options.ignorecase = c.ignorecase;
options.norecurse = c.norecurse;
options.types = c.type ? c.type.replace(/\s+/, '').split(',') : [];
options.exclude = c.notype ? c.notype.replace(/\s+/, '').split(',') : [];
rs.push(options.dir);
rs.push(null);

rs.pipe(dirstream({ onlyFiles: true, noRecurse: options.norecurse })).pipe(filestream()).pipe(tr).pipe(process.stdout);

