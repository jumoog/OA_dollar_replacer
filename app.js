let fs = require('fs');
let xml2js = require('xml2js');
let path = require('path');
let recursive = require("recursive-readdir");
let parser = new xml2js.Parser();
let result;
let log_folder = `${process.argv[2]}_logs`;
let if_String;

// the optional third parameter is a filter
// build our if string for later
if (process.argv.length === 4) {
  if_String = 'l.$.name === "dollarParameters" && typeof l.prop[0].prop[1]._ !== "undefined" && l.prop[0].prop[1]._.indexOf("' + process.argv[3] + '") > -1';
} else {
  if_String = 'l.$.name === "dollarParameters" && typeof l.prop[0].prop[1]._ !== "undefined"';
}

// look recursive for files but ignore .bak files
recursive(process.argv[2], ["*.bak"], function(err, files) {
  files.forEach(f => {
    // for each file extract the dollarParameters
    extractdollarParameters(f);
  });
});

function extractdollarParameters(file) {
  // store the given file into data
  fs.readFile(file, (err, data) => {
    // if we can process the file
    if (err === null) {
      // parse data with the xml parser
      parser.parseString(data, (err, result) => {
        // if we can parse data
        if (err === null) {
          // catch all possible issues
          if (result !== null && result.panel.shapes && result.panel.shapes.length && result.panel.shapes[0].reference && result.panel.shapes[0].reference.length) {
            // loop through panel.shapes[]
            result.panel.shapes[0].reference.forEach(k => {
              // check if we have properties
              if (k.properties[0] !== 'undefined') {
                // loop through properties
                k.properties[0].prop.forEach(l => {
                  // check properties with our if_String
                  if (eval(if_String)) {
                    // write the match inta a csv file
                    fs.appendFile(`${file}.csv`, `${k.$.Name};${l.$.name};${l.prop[0].prop[1]._}\n`, function(err) {
                      // abort if we can't write the file
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
