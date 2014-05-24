var path = require('path')

var test = require('tape')

var wack = require('../')

test('finds text in file', function(t) {
  t.plan(3)

  var stream = wack({pattern: 'here'})

  stream.on('data', function(data) {
    var expected = ['here']

    expected.index = 5
    expected.input = 'hey there'

    t.deepEqual(data.match, expected)
    t.strictEqual(data.line, 1)
    t.strictEqual(path.basename(data.filename), 'file1.txt')
  })

  stream.write(path.join(__dirname, 'test-dir'))
})
