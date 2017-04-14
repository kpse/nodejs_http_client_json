'use strict';

const jsonfile = require('jsonfile');
const fs = require('fs');


function writeToFile(filename, obj) {
  const file = './out/' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    if (err) console.error('err', err);
  });
}

function dynamicInfoOutput(filename, obj) {
  const file = './out-dynamic/dynamic-' + filename + '.json';
  jsonfile.writeFile(file, obj, function (err) {
    if (err) console.error('err', err);
  });
}

const isFileExisting = function (name) {
  try {
    fs.accessSync('./out/' + name + '.json', fs.F_OK);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};


module.exports = {
  write: writeToFile,
  isExisting: isFileExisting,
  dynamicOutput: dynamicInfoOutput
}