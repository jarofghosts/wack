wack
====

wack stands for Wack ACK

## what?

`wack` aims to be a bit like ack but implemented in node. It doesn't require being wack, but it certainly is currently.

## installation

`npm install -g wack`

## usage

`wack searchTerm`

will search the current dir (and recursively all sub dirs) for `searchTerm`

## options

* `-d or --dir <dir>` search different dir.
* `-i or --ignorecase` to ignore case
* `-n or --norecurse` to prevent subdirectory search
* `-m or --maxcount <num>` show max of `<num>` results per file
* `-t or --type <type1[,type2...]>` only show results from file types listed
* `-T or --notype <type1[,type2...]>` exclude results from file types listed
* `-C or --nocolor` to turn off output coloring
* `-1 or --justone` to only return the very first result
* `-v or --invertmatch` to return lines that do **not** match the searchTerm
* `-h or --help` for help
* `-V or --version` for version

## file types

file types are exactly the same as ack, except I have added `markdown` which checks `.md` and `.markdown`.

## license

MIT

