'use strict';

const exportFunctions = require('../newExport');
const assert = require('chai').assert;
const expect = require('chai').expect;

describe('New export', () => {
  describe('fillIn()', () => {
    it('should fill family into class', () => {
      const families = {
        '123': [{name: 'child1', parent: 'parent1', phone: '789', class_id: 456, school_id: 123, relationship: 'father'}]
      };
      const fillIn = exportFunctions.fillIn;
      let structure = fillIn(families)([{school_id: 123, class_id: 456}]);

      expect(structure).to.have.property('id', 123);
      expect(structure.classes).to.have.lengthOf(1);
      expect(structure.classes[0].children).to.deep.equal([{name: "child1", phone: '789'}]);
      expect(structure.classes[0].parents).to.deep.equal([{name: "parent1", phone: '789', relationship: 'father'}]);
    });

    it('should split families into schools', () => {
      const families = {
        '123': [{name: 'child1', parent: 'parent1', phone: '789', class_id: 456, school_id: 123, relationship: 'father'}],
        '199': [{name: 'child99', parent: 'parent99', phone: '1789', class_id: 999, school_id: 199, relationship: 'father'}]
      };
      const fillIn = exportFunctions.fillIn;
      let structure = fillIn(families)([{school_id: 123, class_id: 456}]);

      expect(structure).to.have.property('id', 123);

      let structure2 = fillIn(families)([{school_id: 199, class_id: 999}, {school_id: 199, class_id: 998}]);

      expect(structure2).to.have.property('id', 199);
      expect(structure2.classes).to.have.lengthOf(1);
      expect(structure2.classes[0].children).to.deep.equal([{name: "child99", phone: '1789'}]);
      expect(structure2.classes[0].parents).to.deep.equal([{name: "parent99", phone: '1789', relationship: 'father'}]);
    });

    it('should split family into classes', () => {
      const families = {
        '123': [
          {name: 'child1', parent: 'parent1', phone: '789', class_id: 456, school_id: 123, relationship: 'father'},
          {name: 'child2', parent: 'parent2', phone: '781', class_id: 457, school_id: 123, relationship: 'father'}
          ]
      };
      const fillIn = exportFunctions.fillIn;
      let structure = fillIn(families)([{school_id: 123, class_id: 456}, {school_id: 123, class_id: 457}]);

      expect(structure).to.have.property('id', 123);
      expect(structure.classes).to.have.lengthOf(2);
      expect(structure.classes[1].children).to.deep.equal([{name: "child2", phone: '781'}]);
      expect(structure.classes[1].parents).to.deep.equal([{name: "parent2", phone: '781', relationship: 'father'}]);
    });

    it('should omit duplicate students', () => {
      const families = {
        '123': [{name: 'child1', parent: 'parent1', phone: '789', class_id: 456, school_id: 123, relationship: 'father'},
          {name: 'child1', parent: 'parent2', phone: '781', class_id: 456, school_id: 123, relationship: 'mother'}]
      };
      const fillIn = exportFunctions.fillIn;
      let structure = fillIn(families)([{school_id: 123, class_id: 456}]);

      expect(structure).to.have.property('id', 123);
      expect(structure.classes).to.have.lengthOf(1);
      expect(structure.classes[0].children).to.have.lengthOf(1);
      expect(structure.classes[0].parents).to.have.lengthOf(1);
    });

    it('should omit duplicate students', () => {
      const families = {
        '123': [{name: 'child1', parent: 'parent1', phone: '789', class_id: 456, school_id: 123, relationship: 'father'},
          {name: 'child1', parent: 'parent2', phone: '781', class_id: 456, school_id: 123, relationship: 'mother'}]
      };
      const fillIn = exportFunctions.fillIn;
      let structure = fillIn(families)([{school_id: 123, class_id: 456}]);

      expect(structure).to.have.property('id', 123);
      expect(structure.classes).to.have.lengthOf(1);
      expect(structure.classes[0].children).to.have.lengthOf(1);
      expect(structure.classes[0].parents).to.have.lengthOf(1);
    });
  });
});
