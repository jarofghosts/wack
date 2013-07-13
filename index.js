#!/usr/bin/env node

var c = require('commander'),
    through = require('through'),
    dirstream = require('dir-stream'),
    filestream = require('file-content-stream'),
    color = require('bash-color'),
    Readable = require('stream').Readable,
    rs = Readable(),
    options = {};

tr = through(write, end);

function write(obj) {
  var match = options.regex.exec(obj.data);
  if (match) {
    var filename = obj.filename.replace(new RegExp('^' + options.dir), ''),
        line = obj.line + ':',
        str = obj.data;
    if (options.nocolor) {
      this.queue(filename + ' ' + line + ' ' + str + '\n');
    } else {
      var finalString = str.substring(0, match.index) + 
        color.yellow(match[0], true) +
        str.substring(match.index + match[0].length) + '\n',
          colorized = color.green(filename) + ' ' + color.wrap(line, color.colors.WHITE, color.styles.bold) + finalString;
      this.queue(colorized);
    }
  }
}

function end() {
  this.queue(null);
}

c
  .version('0.0.1')
  .usage('[options] pattern')
  .option('-d, --dir <dirname>', 'search through directory | default cwd')
  .option('-i, --ignore-case', 'ignore regex case')
  .option('-C, --nocolor', 'turn colorizing off for results')
  .parse(process.argv);

if (c.args.length) {
  options.regex = c['ignore-case'] ? new RegExp(c.args[0], "ig") : new RegExp(c.args[0], "g");
}

options.dir = c.dir || process.cwd();
options.nocolor = c.nocolor;
options.ignorecase = c['ignore-case'];

rs.push(options.dir);
rs.push(null);

rs.pipe(dirstream({ onlyFiles: true })).pipe(filestream()).pipe(tr).pipe(process.stdout);

