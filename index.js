#!/usr/bin/env node

var c = require('commander'),
    through = require('through'),
    dirstream = require('dir-stream'),
    filestream = require('file-content-stream'),
    es = require('event-stream'),
    police = require('stream-police'),
    type = require('ack-types'),
    color = require('bash-color'),
    Readable = require('stream').Readable,
    path = require('path'),
    isCli = (require.main === module);;

module.exports = streamWack;

function wack(options) {

  var currentFile = null,
      fileCount = 0;

  options = options || {};
  
  if (!options.dir) options.dir = process.cwd();
  if (!options.dir.match(/^\//)) options.dir = path.normalize(options.dir);
  options.regex = new RegExp(options.pattern, 'g' + (options.ignorecase ? 'i' : ''));
  
  tr = through(write);

  function write(obj) {
    var match = options.regex.exec(obj.data);
    if ((match && !options.invertmatch) || (!match && options.invertmatch)) {
      var filename = obj.filename.substring(options.dir.length),
          line = obj.line + ':',
          str = obj.data,
          fileOut = filename,
          toOutput;
      if (options.nocolor || options.invertmatch) {
        toOutput = [' ', line, ' ', str, '\n'].join('');
      } else {
        fileOut = color.green(filename);
        var finalString = [str.substring(0, match.index),
                          color.yellow(match[0], true),
                          str.substring(match.index + match[0].length)].join(''),
            toOutput = [' ', color.wrap(line, color.colors.WHITE, color.styles.bold), ' ', finalString, '\n'].join('');
      
      }

      if (filename != currentFile) {
        fileCount = 1;
        currentFile = filename;
        this.queue(fileOut + '\n');
      } else {
        if (options.maxcount) {
          fileCount++;
          if (fileCount > options.maxcount) return;
        }
      }
      this.queue(toOutput);
      if (options.justone) tr.queue(null);
    }
  }

  return tr;

}

function streamWack(settings) {

  var policeArgs = {},
      ignoreDirs = ['.git', '.hg', '.svn'];

  settings.types = settings.type ? settings.type.replace(/\s+/, '').split(',') : [];
  settings.exclude = settings.notype ? settings.notype.replace(/\s+/, '').split(',') : [];

  if (settings.knowntypes) {
    policeArgs.verify = [];
    var extensions = type.allExtensions(),
        i = 0,
        l = extensions.length;
    for (; i < l; ++i) {
      policeArgs.verify.push(new RegExp('\\.' + extensions[i] + '$', 'i'));
    }

  }
  if (settings.exclude.length) {
    policeArgs.exclude = [];
    var i = 0,
        l = settings.exclude.length;
    for (; i < l; ++i) {
      var extensions = type.reverseLookup(settings.exclude[i]),
          j = 0,
          k = extensions.length;
      policeArgs.exclude.push(new RegExp('\\.' + extensions[j] + '$', 'i'));
    }
  }
  if (settings.types.length) {
    policeArgs.verify = policeArgs.verify || [];
    var i = 0,
        l = settings.types.length;
    for (; i < l; ++i) {
      var extensions = type.reverseLookup(settings.types[i]),
          j = 0,
          k = extensions.length;
      policeArgs.verify.push(new RegExp('\\.' + extensions[j] + '$', 'i'));
    }
  }

  if (settings.ignoredir) {
    ignoreDirs = ignoreDirs.concat(settings.ignoredir.replace(/\s+/g, '').split(','));
  }

  return es.pipeline(dirstream({ onlyFiles: true, noRecurse: settings.norecurse, ignore: ignoreDirs }),
                     police(policeArgs),
                     filestream(),
                     wack(settings));
}

if (isCli) {
  c
    .version('0.1.6')
    .usage('[options] pattern')
    .option('-d, --dir <dirname>', 'search through directory | default cwd')
    .option('-D, --ignoredir <dir1[,dir2...]>', 'comma separated list of directory names to ignore')
    .option('-i, --ignorecase', 'ignore regex case')
    .option('-k, --knowntypes', 'only include known file types')
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
    ignoredir: c.ignoredir,
    knowntypes: c.knowntypes,
    notype: c.notype,
    justone: c.justone,
    nocolor: c.nocolor,
    pattern: c.args[0]
  };

  var rs = Readable();

  rs.push(c.dir ? path.normalize(c.dir) : process.cwd());
  rs.push(null);

  rs.pipe(streamWack(settings)).pipe(process.stdout);
}

