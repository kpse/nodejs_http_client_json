var address = require('../src/relationship');
var assert = require('chai').assert;

describe('Relationship', function () {
  describe('translation', function () {
    it('should return 4 for father', function () {
      assert.equal('4', address('爸爸'));
    });
  });
});