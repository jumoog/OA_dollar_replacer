let fs = require('fs');
let xml2js = require('xml2js');
let path = require('path');
let recursive = require("recursive-readdir");
let parser = new xml2js.Parser();
let result;
let log_folder = `${process.argv[2]}_logs`;
let if_String;

if (process.argv.length === 4) {
  if_String = 'l.$.name === "dollarParameters" && typeof l.prop[0].prop[1]._ !== "undefined" && l.prop[0].prop[1]._.indexOf("_REAL") > -1';
} else {
  if_String = 'l.$.name === "dollarParameters" && typeof l.prop[0].prop[1]._ !== "undefined"';
}

recursive(process.argv[2], ["*.bak"], function(err, files) {
  files.forEach(f => {
    extractdollarParameters(f);
  });
});

function extractdollarParameters(file) {
  fs.readFile(file, (err, data) => {
    if (err == null) {
      parser.parseString(data, (err, result) => {
        if (err == null) {
          if (result !== null && result.panel.shapes && result.panel.shapes.length && result.panel.shapes[0].reference && result.panel.shapes[0].reference.length) {
            result.panel.shapes[0].reference.forEach(k => {
              if (k.properties[0] !== 'undefined') {
                k.properties[0].prop.forEach(l => {
                  if (eval(if_String)) {
                    fs.appendFile(`${file}.csv`, `${k.$.Name};${l.$.name};${l.prop[0].prop[1]._}\n`, function(err) {
                      if (err) throw err;
                    });
                  }
                });
              }
            });
          }
        }
      });
    }
  });
}