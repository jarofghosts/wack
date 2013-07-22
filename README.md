wack
====

[![Build Status](https://travis-ci.org/jarofghosts/wack.png?branch=master)](https://travis-ci.org/jarofghosts/wack)

wack stands for Wack ACK

## what?

`wack` aims to be a bit like [ack](http://beyondgrep.com/) but implemented in node. It doesn't aim to be wack, but it kind of is at the moment.

## installation

`npm install -g wack`

## usage

`wack searchTerm`

will search the current dir (and recursively all sub dirs) for `searchTerm`

Alternatively, you can pipe to wack with a stream of directory names and it will stream search results.

That looks kinda like this (assuming an imaginary file of directory names \n separated):

```js
var wack = require('wack'),
    split = require('split'),
    fs = require('fs');

fs.createReadStream('lyricDirs.txt').pipe(split()).pipe(wack({ pattern: 'blitzkrieg bop' })).pipe(fs.createWriteStream('ramones.txt'));
```

you get the idea. Note that `pattern` is required.

## options

* `-d or --dir <dir>` search different dir.
* `-i or --ignorecase` to ignore case
* `-n or --norecurse` to prevent subdirectory search
* `-m or --maxcount <num>` show max of `<num>` results per file
* `-k or --knowntypes` only search files of known type
* `-t or --type <type1[,type2...]>` only show results from file types listed
* `-T or --notype <type1[,type2...]>` exclude results from file types listed
* `-C or --nocolor` to turn off output coloring
* `-1 or --justone` to only return the very first result
* `-v or --invertmatch` to return lines that do **not** match the searchTerm
* `-h or --help` for help
* `-V or --version` for version

for stream options, use the full flag name (ie `nocolor`, `ignorecase`, etc) and `pattern` for the search pattern.

## file types

file types are exactly the same as ack, except I have added `markdown` which checks `.md` and `.markdown`.

## license

MIT

