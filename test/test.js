var GL = require('../index.js');
var fs = require('fs');
var tape = require('tape');
var testStyle = require('./style.json');

// These calls are all effectively synchronous though they use a callback.
tape('init', function(assert) {
    new GL(null, function(err) {
        assert.equal(err.toString(), 'Error: uri must be an object');
    });
    // @TODO support filepath loading in the future?
    new GL('gl:///test-style.json', function(err) {
        assert.equal(err.toString(), 'Error: uri must be an object');
    });
    new GL({}, function(err) {
        assert.equal(err.toString(), 'Error: uri.style must be a GL style object');
    });
    new GL({ style: testStyle }, function(err, source) {
        assert.ifError(err);
        assert.equal(source instanceof GL, true, 'GL source');
        assert.equal(typeof source._styleJSON, 'string', 'GL source._styleJSON');
        assert.equal(source._styleJSON.length, 21447, 'GL source._styleJSON');
    });
    assert.end();
});

tape('getTile', function(assert) {
    new GL({ style: testStyle }, function(err, source) {
        assert.ifError(err);
        source.getTile(0, 0, 0, function(err, png) {
            assert.ifError(err);
            fs.writeFileSync(__dirname + '/output.png', png);

            console.log(png);
            assert.end();
        });
    });
});

