var relationship = require('../src/relationship');
var assert = require('chai').assert;

describe('Relationship', function () {
  describe('translation', function () {
    it('should return 4 for father', function () {
      assert.equal('4', relationship('爸爸'));
    });
    it('should return 4 for mother', function () {
      assert.equal('5', relationship('妈妈'));
    });
  });
});