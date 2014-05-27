wack
====

[![Build Status](http://img.shields.io/travis/jarofghosts/wack.svg?style=flat)](https://travis-ci.org/jarofghosts/wack)
[![npm install](http://img.shields.io/npm/dm/wack.svg?style=flat)](https://www.npmjs.org/package/wack)

wack stands for Wack ACK

## what?

`wack` aims to be a bit like [ack](http://beyondgrep.com/) but implemented in
node. it doesn't aim to be wack, but it kind of is at the moment.

## installation

`npm install -g wack`

## usage

`wack searchPattern`

will search the current dir (and recursively all sub dirs) for `searchPattern`

### options

* `-d or --dir <dir>` search different dir.
* `-D or --ignoredir <dir1[,dir2...]>` to ignore directories
* `-i or --ignorecase` to ignore case
* `-n or --norecurse` to prevent subdirectory search
* `-m or --maxcount <num>` show max of `<num>` results per file
* `-k or --knowntypes` only search files of known type
* `-t or --type <type1[,type2...]>` only show results from file types listed
* `-T or --notype <type1[,type2...]>` exclude results from file types listed
* `-C or --nocolor` to turn off output coloring
* `-1 or --justone` to only return the very first result
* `-v or --invertmatch` to return lines that do **not** match the search pattern
* `-h or --help` for help
* `-V or --version` for version

## as a module

alternatively, you can write directory names to wack and it will stream search
results.

that looks kinda like this:

```js
var wack = require('wack')

var wack_stream = wack({pattern: 'Sheena'})

wack_stream.on('data', dump)

wack_stream.write('./ramones_albums/')

function dump(data) {
  console.log(data)
// {
//     filename: /current/dir/ramones-albums/rocket-to-russia.txt
//   , context: 'Sheena Is a Punk Rocker'
//   , line: 6
//   , match: ['Sheena', index: 0, input: 'Sheena Is a Punk Rocker']
// }
}
```

for stream options, use the full flag name (ie `ignorecase`, `invertmatch`,
etc) and `pattern` for the search pattern.

## file types

file types are exactly the same as ack, except I have added `markdown` (which
checks `.md`, `.mkd`, and `.markdown`) and `json` (which checks `.json`).

## license

MIT
