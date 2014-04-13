#!/usr/bin/env node

var Readable = require('stream').Readable
  , path = require('path')

var wack = require('../package.json')
  , wack_stream = require('../')
  , c = require('commander')

c
  .version(wack.version)
  .usage('[options] pattern')
  .option('-d, --dir <dirname>', 'search through directory | default cwd')
  .option('-D, --ignoredir <dir1[,dir2...]>',
    'comma separated list of directory names to ignore')
  .option('-i, --ignorecase', 'ignore regex case')
  .option('-k, --knowntypes', 'only include known file types')
  .option('-m, --maxcount <num>',
    'only show maximum of <num> results per file', parseInt)
  .option('-n, --norecurse', 'no subdirectory checking')
  .option('-v, --invertmatch', 'show non-matching lines')
  .option('-t, --type <type1[,type2...]>',
    'comma separated list of types to limit search to')
  .option('-T, --notype <type1[,type2...]>',
    'comma separated list of types to exclude from search')
  .option('-1, --justone', 'show only the first result')
  .option('-C, --nocolor', 'turn colorizing off for results')
  .option('--thpppt', 'Bill the Cat')
  .parse(process.argv)

if(!c.args.length && !c.thpppt) c.help()
if(c.thpppt) {
return process.stdout.write(['  _   /|',
    '  \\\'o.O\'',
    '  =(___)=',
    '     U    wack --thpppt!',
    ''].join('\n'))
}

var settings = {
    dir: c.dir
  , ignorecase: c.ignorecase
  , maxcount: c.maxcount
  , norecurse: c.norecurse
  , invertmatch: c.invertmatch
  , type: c.type
  , ignoredir: c.ignoredir
  , knowntypes: c.knowntypes
  , notype: c.notype
  , justone: c.justone
  , nocolor: c.nocolor
  , pattern: c.args[0]
}

var rs = Readable()

rs.push(c.dir ? path.normalize(c.dir) : process.cwd())
rs.push(null)

rs.pipe(wack_stream(settings)).pipe(process.stdout)
