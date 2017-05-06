'use strict';
const _ = require('lodash')

function provinceOf(address) {
  if (address === null) {
    return '';
  }
  let m = address.match(/^([^市省县区]+?省)/);
  if (m === null) {
    m = address.match(/^([^市省县自治区]+?自治区)/);
  }
  if (m === null) {
    m = address.match(/^([^市省县自治特别行政区]+?特别行政区)/);
  }
  return _.get(m, '[0]','');
}
function cityOf(address) {
  if (address === null) {
    return '';
  }
  let m = address.match(/[^市省县区]+?[省区]([^市省县区]+?自治州)/);
  if (m === null) {
    m = address.match(/[^市省县区]+?[省区]([^市省县区]+?市)/);
  }
  if (m === null) {
    m = address.match(/^([^市省县区]+?市)/);
  }
  return _.get(m, '[1]','');
}

function areaOf(address) {
  if (address === null) {
    return '';
  }
  let m = address.match(/自治州(.+?([县区市]))/);
  if (m === null) {
    m = address.match(/市(.+?([县区市]))/);
  }
  return _.get(m, '[1]','');
}

module.exports = {
  provinceOf, cityOf, areaOf
}