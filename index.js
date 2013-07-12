var through = require('through'),
    dirstream = require('dir-stream'),
    filestream = require('file-content-stream'),
    Readable = require('stream').Readable,
    rs = Readable(),
    regex = new RegExp(process.argv[3]);

rs.push(process.argv[2]);
rs.push(null);

tr = through(write, end);

function write(obj) {
  if (obj.data.match(regex)) {
    this.queue(obj.filename + ' line ' + obj.line + ': ' + obj.data + '\n');
  }
}

function end() {
  this.queue(null);
}

rs.pipe(dirstream()).pipe(filestream()).pipe(tr).pipe(process.stdout);
