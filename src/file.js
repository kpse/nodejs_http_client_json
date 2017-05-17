'use strict';

const jsonfile = require('jsonfile');
const fs = require('fs');


const folderCheck = dir => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}
function write(filename, obj) {
  folderCheck('./out/result/dataSync')
  const file = `./out/result/dataSync/${filename}.json`;
  jsonfile.writeFile(file, obj, (err) => {
    if (err) console.error('err', err);
  });
}

function writeCard(filename, obj) {
  folderCheck('./out/result/cardSync')
  const file = `./out/result/cardSync/${filename}.json`;
  jsonfile.writeFile(file, obj, (err) => {
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

const isExisting = name => fileCheck(`./out/result/dataSync/${name}.json`)

module.exports = {
  write,
  writeCard,
  isExisting
};