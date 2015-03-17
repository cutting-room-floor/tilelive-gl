#!/usr/bin/env node

'use strict';

/* jshint node:true */

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var dirPath = path.join(path.resolve('.'), 'test/fixtures');
var mkdirp = require('mkdirp');
var file = require('file');
var recursive = require('recursive-readdir');

var html =
    '<style>\n' +
    '    body { font-family: Helvetica; }\n' +
    '    h2 a { color:white; text-decoration:none; }\n' +
    '</style>\n' +
    '<table>\n' +
    '<tr>\n' +
    '    <th>Actual</th>\n' +
    '    <th>Expected</th>\n' +
    '    <th>Info</th>\n' +
    '</tr>\n';

var exitCode = 0;
var failures = 0;

// Get expected, use that to find actuals and diffs
function processFiles() {
    recursive(path.join(dirPath, 'expected'), function(err, files) {
        files.forEach(function(file) {
            var filename = file.split('expected/').pop();

            function processFileTest() {
                mkdirp.sync(path.join(dirPath, 'diff'));

                var actual = path.join(dirPath,'actual', filename);
                var expected = path.join(dirPath,'expected', filename);
                var diff = path.join(dirPath, 'diff', filename);

                var compare = spawn('compare', ['-metric', 'MAE', actual, expected, diff]);
                var error = '';
                compare.stderr.on('data', function(data) {
                    error += data.toString();
                });
                compare.on('exit', function(code, signal) {
                    // The compare program returns 2 on error otherwise 0 if the images are similar or 1 if they are dissimilar.
                    if (code == 2) {
                        writeResult(actual, expected, diff, error.trim(), Infinity);
                        exitCode = 2;
                    } else {
                        var match = error.match(/^\d+(?:\.\d+)?\s+\(([^\)]+)\)\s*$/);
                        var difference = match ? parseFloat(match[1]) : Infinity;
                        writeResult(actual, expected, diff, match ? '' : error, difference);

                    }
                    processFiles();
                });
                compare.stdin.end();
            }

            processFileTest();
        });
    });
};

processFiles();

function writeResult(actual, expected, diff, error, difference) {
    var color = 'green';
    var allowedDifference = 0.001;
    if (difference > allowedDifference) {
        color = 'red';
        if (exitCode < 1) {
            exitCode = 1;
        }
        failures++;
    }

    html +=
        '<tr>\n' +
        '    <td><img src="' + actual + '" onmouseover="this.src=\'' + expected + '\'" onmouseout="this.src=\'' + actual + '\'"></td>\n' +
        '    <td><img src="' + expected + '" onmouseover="this.src=\'' + diff + '\'" onmouseout="this.src=\'' + expected + '\'"></td>\n' +
        '    <td>\n' +
        '        <h2 style="text-align:center; background:' + color + '">' + actual + '</a></h2>\n' +
        (error ? '        <p>' + error + '</p>\n' : '') +
        '        <ul>\n' +
        '            <li>diff: <strong>' + difference + '</strong></li>\n' +
        '        </ul>\n' +
        '    </td>\n' +
        '</tr>\n'
    ;
}

function done() {
    html += "</table>\n";

    var p = path.join(dirPath, 'index.html');
    fs.writeFileSync(p, html);
    console.warn('Results at: ' + p);
    if (failures) {
        console.warn('\x1B[1m\x1B[31m' + failures + ' ' + (failures == 1 ? 'image doesn\'t' : 'images don\'t') + ' match\x1B[39m\x1B[22m');
    } else {
        console.warn('\x1B[1m\x1B[32mAll images match\x1B[39m\x1B[22m');
    }

    process.exit(exitCode);
}
