'use strict';

/* jshint node:true */

var TileSource = require('..');
var test = require('tape').test;
var fs = require('fs');
var path = require('path');
var http = require('http');
var st = require('st');
var mkdirp = require('mkdirp');
var compare = require('./compare.js')
var tiles = ['19-435285-214641','3-2-2','15-16640-11022','13-4206-3000','1-2-0','3-1-2','10-370-585','13-4508-2612','9-126-197','9-461-313','19-83395-202781','18-124056-100414','19-144599-197621','10-300-384','7-83-50','7-62-47','7-65-45','13-2033-3387','15-7483-13220','11-1199-842','10-178-412','14-8526-5974','7-35-54','8-58-105','12-2131-1494','7-19-43','0-1-1','12-1083-1562','4-8-7','17-73862-48306','0-1-0','10-599-420','7-36-46','14-4163-6092','10-546-380','15-16480-11967','2-2-2','6-32-21','13-5914-3797','6-35-19','16-10905-24919','11-741-1173','0-0-1','9-267-173','0-0-1','11-777-1157','17-67170-47873','15-16791-11968','2-2-2','19-295450-193222','14-2545-5663','18-41040-101336','2-1-2','3-6-3','18-72700-95630','17-29931-52882','1-0-1','18-219098-120313','14-13457-6207','7-34-50','4-8-6','3-0-4','7-37-63','11-521-761','6-10-23','16-34732-22749','15-18890-18856','17-77225-49663','8-197-117','0-0-0','14-4958-9811','8-135-87','1-1-0','18-42645-88324','6-37-18','12-1083-1563','19-140565-198480','5-22-12','18-133920-86681','12-3220-2031','11-530-777','5-18-12','1-1-1','2-2-1','14-13930-6347','14-985-7189','16-53828-24828','10-576-376','3-4-3','17-111433-50787','0-0-0','9-80-182','16-33520-23381','12-1109-1529','2-1-0','0-0-0','9-327-201','0-0-0','2-3-1','2-3-0','4-3-6','5-25-15','15-16791-10763','19-191508-285510'];
var fileSource = require('./lib/request');
var style = require('./fixtures/mapbox.streets-v7.json');
var queue = require('queue-async');

test('Render', function(t) {
    var GL = TileSource(fileSource);
    var mbgl = TileSource.mbgl;
    var testQueue = new queue(1);

    mbgl.on('message', function(msg) {
        console.log(msg);
    });

    function filePath(name) {
        return ['expected', 'actual', 'diff'].reduce(function(prev, key) {
            var dir = path.join('test', key);
            mkdirp.sync(dir);
            prev[key] = path.join(dir, name);
            return prev;
        }, {});
    }

    function renderTest(style, scale, t, callback) {
        new GL({ style: style }, function(err, source) {
            t.error(err);
            var q = new queue(1);

            tiles.forEach(function(tile) {
                tile = '8-135-87'.split('-');

                var getTile = function(z, x, y, callback) {
                    console.time(z + '-' + x + '-' + y);
                    var cb = function(err, image){
                        console.timeEnd(z + '-' + x + '-' + y);
                        return callback();
                    };
                    if (scale) cb.scale = scale;
                    source.getTile(z, x, y, cb);
                };

                var z = tile[0];
                var x = tile[1];
                var y = tile[2];

                q.defer(getTile, z, x, y);

                q.awaitAll(function(err, res){
                    if (err) return callback(err);
                    process.exit();
                    return callback();
                });
            });
        });
    }

    // testQueue.defer(renderTest, style, null, t);
    testQueue.defer(renderTest, style, 2, t);

    testQueue.awaitAll(function(){

        t.end();
    });

});
