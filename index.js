#!/usr/bin/env node

var c = require('commander'),
    through = require('through'),
    dirstream = require('dir-stream'),
    filestream = require('file-content-stream'),
    Readable = require('stream').Readable,
    rs = Readable(),
    regex = null;

tr = through(write, end);

function write(obj) {
  if (obj.data.match(regex)) {
    this.queue(obj.filename + ' line ' + obj.line + ': ' + obj.data + '\n');
  }
}

function end() {
  this.queue(null);
}

c
  .version('0.0.0')
  .option('-d, --dir [dirname]', 'search through directory | default cwd')
  .option('-i, --ignorecase', 'ignore regex case')
  .parse(process.argv);

if (c.args.length) {
  regex = c.ignorecase ? new RegExp(c.args[0], "i") : new RegExp(c.args[0]);
}

rs.push(c.dir || process.cwd());
rs.push(null);

rs.pipe(dirstream({ onlyFiles: true })).pipe(filestream()).pipe(tr).pipe(process.stdout);

