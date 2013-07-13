#!/usr/bin/env node

var c = require('commander'),
    through = require('through'),
    dirstream = require('dir-stream'),
    filestream = require('file-content-stream'),
    color = require('bash-color'),
    Readable = require('stream').Readable,
    rs = Readable(),
    currentFile = null,
    options = {};

tr = through(write, end);

function write(obj) {
  var match = options.regex.exec(obj.data);
  if ((match && !options.invert) || (!match && options.invert)) {
    var filename = obj.filename.replace(new RegExp('^' + options.dir), ''),
        line = obj.line + ':',
        str = obj.data;
    if (options.nocolor || options.invert) {
      if (filename != currentFile) {
        currentFile = filename;
        this.queue(filename + '\n');
      }
      this.queue(' ' + line + ' ' + str + '\n');
    } else {
      if (filename != currentFile) {
        currentFile = filename;
        this.queue(color.green(filename) + '\n');
      }
      var finalString = str.substring(0, match.index) + 
        color.yellow(match[0], true) +
        str.substring(match.index + match[0].length),
          colorized = ' ' + color.wrap(line, color.colors.WHITE, color.styles.bold) + ' ' + finalString + '\n';
      this.queue(colorized);
    }
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
  .option('-n, --norecurse', 'no subdirectory checking')
  .option('-v, --invertmatch', 'show non-matching lines')
  .option('-1, --justone', 'show only the first result')
  .option('-C, --nocolor', 'turn colorizing off for results')
  .parse(process.argv);

if (c.args.length) {
  options.regex = c.ignorecase ? new RegExp(c.args[0], "ig") : new RegExp(c.args[0], "g");
}

options.dir = c.dir || process.cwd();
options.nocolor = c.nocolor;
options.justone = c.justone;
options.invert = c.invertmatch;
options.ignorecase = c.ignorecase;
options.norecurse = c.norecurse;

rs.push(options.dir);
rs.push(null);

rs.pipe(dirstream({ onlyFiles: true, noRecurse: options.norecurse })).pipe(filestream()).pipe(tr).pipe(process.stdout);

