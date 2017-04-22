'use strict';

const jsonfile = require('jsonfile');
const fs = require('fs');


const folderCheck = dir => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}
function write(filename, obj) {
  folderCheck('./out/dataSync')
  const file = './out/dataSync/' + filename + '.json';
  jsonfile.writeFile(file, obj, (err) => {
    if (err) console.error('err', err);
  });
}

function writeCard(filename, obj) {
  folderCheck('./out/cardSync')
  const file = './out/cardSync/' + filename + '.json';
  jsonfile.writeFile(file, obj, (err) => {
    if (err) console.error('err', err);
  });
}

function dynamicOutput(filename, obj) {
  folderCheck('./out/dynamicSync')
  const file = './out/dynamicSync/dynamic-' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    if (err) console.error('err', err);
  });
}

const fileCheck = fileName => {
  try {
    fs.accessSync(fileName, fs.F_OK);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

const isExisting = name => fileCheck('./out/' + name + '.json')

const isDynamicExisting = name => fileCheck('./out/dynamicSync/dynamic-' + name + '.json')

module.exports = {
  write,
  writeCard,
  isExisting,
  isDynamicExisting,
  dynamicOutput
};