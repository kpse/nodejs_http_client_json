var relationship = require('../src/relationship');
var assert = require('chai').assert;

describe('Relationship', function () {
  describe('translation', function () {
    it('should return 4 for father', function () {
      assert.equal('4', relationship('爸爸'));
    });
    it('should return 5 for mother', function () {
      assert.equal('5', relationship('妈妈'));
    });
    it('should return 6 for grandfather', function () {
      assert.equal('6', relationship('爷爷'));
    });
    it('should return 7 for grandfather', function () {
      assert.equal('7', relationship('姥姥'));
    });
    it('should return 11 for grandfather', function () {
      assert.equal('11', relationship('奶奶'));
    });
  });
});