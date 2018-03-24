const convert = require('xml-js');
const fs = require('fs');
const xml = require('fs').readFileSync(process.argv[2], 'utf8');
const csv = require('csvtojson');
const options = {
  ignoreComment: true,
  alwaysChildren: true
};
// parse the xml data as js array into js
let result = convert.xml2js(xml, options); // or convert.xml2json(xml, options)

//
async function processArray(json) {
  // loop through the csv json
  for (i = 0; i < json.length; i++) {
    // change the Target Dollar Values
    await rewrite(json[i].field1, json[i].field3);
  }
  // write xml file
  await writexml();
}

function rewrite(name, value) {
  let found;
  let stop = false;
  result.elements[0].elements[1].elements.forEach(k => {
    if (k.attributes.Name === name) {
      fs.appendFile(`${process.argv[2]}_result.csv`, `${name};dollarParameters;${value}\n`, function(err) {
        // abort if we can't write the file
        if (err) throw err;
      });
      k.elements[0].elements.forEach(l => {
        // look for dollarParameters
        if (l.attributes.name === "dollarParameters") {
          l.elements.forEach(i => {
            i.elements.forEach(j => {
              if (j.elements && j.elements.length && stop === false) {
                // if we found Dollar earlier we can write now the new value
                if (found) {
                  j.elements[0].text = value;
                  // success stop the loop
                  stop = true;
                }
                // look for Dollar and set found to true
                if (j.attributes.name === "Dollar" && j.elements[0].text === "$DP") {
                  found = true;
                }
              }
            });
          });
        }
      });
    }
  });
}

function writexml() {
  let xml = convert.js2xml(result, options);

  fs.writeFile(process.argv[2], xml, (err, data) => {
    if (err) console.log(err);
    console.log("successfully written our update to the Panel");
  });
}

csv({
    noheader: true,
    delimiter: "auto"
  })
  .fromFile(process.argv[2] + '.csv')
  .on('end_parsed', (jsonObj) => {
    json = jsonObj;
  })
  .on('done', (error) => {
    processArray(json);
  });
