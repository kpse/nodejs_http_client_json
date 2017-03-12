'use strict';

const inputFile = './ref/schools.csv'
const outputFile = './out/schools.csv'

const fs = require('fs');
const csv = require('csv-parser');
const address = require('./src/address');
const LineByLineReader = require('line-by-line'),
  lr = new LineByLineReader(inputFile);


lr.on('line', (line) => {
  // 'line' contains the current line without the trailing newline character.
  const detailAddress = line.split(',')[2].replace("\"", "");
  console.log("detailAddress: ", detailAddress);
  const addressColumns = `, "${address.provinceOf(detailAddress)}", "${address.cityOf(detailAddress)}", "${address.areaOf(detailAddress)}"`;
  fs.appendFileSync(outputFile, line.toString() + addressColumns + "\n");
});


lr.on('end', () => console.log('All lines are read, file is closed now.'));

lr.on('error', err => console.log('err contains error object', err));
