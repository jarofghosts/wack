#!/usr/bin/env node

var path = require('path')
var fs = require('fs')

var nopt = require('nopt')

var wackage = require('../package.json')
var wack = require('../')

var noptions = {
  dir: String,
  ignoredir: String,
  ignorecase: Boolean,
  knowntypes: Boolean,
  maxcount: Number,
  norecurse: Boolean,
  invertmatch: Boolean,
  type: String,
  notype: String,
  justone: Boolean,
  nocolor: Boolean,
  thpppt: Boolean,
  version: Boolean,
  help: Boolean
}

var shorts = {
  'd': ['--dir'],
  'D': ['--ignoredir'],
  'i': ['--ignorecase'],
  'k': ['--knowntypes'],
  'm': ['--maxcount'],
  'n': ['--norecurse'],
  'v': ['--invertmatch'],
  't': ['--type'],
  'T': ['--notype'],
  '1': ['--justone'],
  'C': ['--nocolor'],
  'h': ['--help'],
  'V': ['--version']
}

if (require.main === module) {
  bin()
}

module.exports = bin

function bin () {
  var options = nopt(noptions, shorts, process.argv)
  var wackStream

  options.pattern = options.argv.remain[0]

  if (options.version) {
    return version()
  }

  if (options.help || !options.pattern) {
    return help()
  }

  if (options.thpppt) {
    return cat()
  }

  wackStream = wack(options)
  wackStream.pipe(wackStream.prettify()).pipe(process.stdout)
  wackStream.write(options.dir || process.cwd())
}

function version () {
  console.error('wack version ' + wackage.version)
}

function help () {
  version()
  fs.createReadStream(path.join(__dirname, '..', 'help.txt'))
    .pipe(process.stderr)
}

function cat () {
  process.stdout.write([
    '  _   /|',
    '  \\\'o.O\'',
    '  =(___)=',
    '     U    wack --thpppt!',
    ''
  ].join('\n'))
}
