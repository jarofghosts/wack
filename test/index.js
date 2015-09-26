var path = require('path')

var test = require('tape')

var wack = require('../')

test('finds text in file', function (t) {
  t.plan(3)

  var stream = wack({pattern: 'here'})

  stream.on('data', function (data) {
    var expected = ['here']

    expected.index = 5
    expected.input = 'hey there'

    t.deepEqual(data.match, expected)
    t.strictEqual(data.line, 1)
    t.strictEqual(path.basename(data.filename), 'file1.txt')
  })

  stream.write(path.join(__dirname, 'test-dir'))
})

test('can search only known types', function (t) {
  t.plan(1)

  var stream = wack({pattern: 'here', knowntypes: true})
  var count = 0

  stream.on('data', function (data) {
    ++count
  })

  stream.on('end', function () {
    t.strictEqual(count, 0)
  })

  stream.write(path.join(__dirname, 'test-dir'))
})

test('finds text in file', function (t) {
  t.plan(3)

  var stream = wack({pattern: 'THERE', ignorecase: true})

  stream.on('data', function (data) {
    var expected = ['there']

    expected.index = 4
    expected.input = 'hey there'

    t.deepEqual(data.match, expected)
    t.strictEqual(data.line, 1)
    t.strictEqual(path.basename(data.filename), 'file1.txt')
  })

  stream.write(path.join(__dirname, 'test-dir'))
})

test('supports inverse matching', function (t) {
  t.plan(4)

  var stream = wack({pattern: 'here', invertmatch: true})

  stream.on('data', function (data) {
    t.strictEqual(data.line, 2)
    t.strictEqual(data.match, null)
    t.strictEqual(data.context, 'derp')
    t.strictEqual(path.basename(data.filename), 'file1.txt')
  })

  stream.write(path.join(__dirname, 'test-dir'))
})

test('supports justone', function (t) {
  t.plan(1)

  var stream = wack({pattern: 'er', justone: true})
  var matches = 0

  stream.on('data', function (data) {
    ++matches
  })

  stream.on('end', function () {
    t.strictEqual(matches, 1)
  })

  stream.write(path.join(__dirname, 'test-dir'))
})

test('supports maxcount', function (t) {
  t.plan(1)

  var stream = wack({pattern: 'er', maxcount: 1})
  var matches = 0

  stream.on('data', function (data) {
    ++matches
  })

  stream.on('end', function () {
    t.strictEqual(matches, 1)
  })

  stream.write(path.join(__dirname, 'test-dir'))
})

test('can search only specific types', function (t) {
  t.plan(1)

  var stream = wack({pattern: 'p', type: 'js'})
  var count = 0

  stream.on('data', function (data) {
    ++count
  })

  stream.on('end', function () {
    t.strictEqual(count, 1)
  })

  stream.write(path.join(__dirname, 'test-type-dir'))
})
