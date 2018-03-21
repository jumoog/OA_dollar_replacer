const convert = require('xml-js');
const fs = require('fs');
const xml = require('fs').readFileSync(process.argv[2], 'utf8');
const csv = require('csvtojson');
const options = {
  ignoreComment: true,
  alwaysChildren: true
};
let result = convert.xml2js(xml, options); // or convert.xml2json(xml, options)

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
      k.elements[0].elements.forEach(l => {
        if (l.attributes.name === "dollarParameters") {
          l.elements.forEach(i => {
            i.elements.forEach(j => {
              if (j.elements && j.elements.length && stop === false) {
                if (found) {
                  j.elements[0].text = value;
                  stop = true;
                }
                if (j.attributes.name === "Dollar") {
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
