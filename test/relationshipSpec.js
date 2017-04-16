'use strict';

const relationship = require('../src/relationship');
const assert = require('chai').assert;

describe('Relationship', () => {
  describe('translation', () => {
    it('should return 4 for father', () => {
      assert.equal('4', relationship('爸爸'));
    });
    it('should return 5 for mother', () => {
      assert.equal('5', relationship('妈妈'));
    });
    it('should return 6 for grandfather', () => {
      assert.equal('6', relationship('爷爷'));
    });
    it('should return 7 for grandfather', () => {
      assert.equal('7', relationship('姥姥'));
    });
    it('should return 11 for grandfather', () => {
      assert.equal('11', relationship('奶奶'));
    });
  });
});
