'use strict';

var http = require("http");
var url = require("url");
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://127.0.0.1:27017/test';

var re = /^\/new\/(http[s]?:\/\/.*)$/;
var re1 = /^\/(\d+)$/;

var respondseHTML =
    '<html><head><meta charset="utf-8"><title>url-shortener</title></head>' +
    '<script language="javascript" type="text/javascript">' +
    'window.location.href="{original_url}";' +
    '</script>' +
    '<body>' +
    '</body></html>';

MongoClient.connect(DB_CONN_STR, function(err, db) {
    if(err){
        console.log("DB connected error!" + err);
    }else{
        console.log("DB connected success!");
        http.createServer(function (request, response) {
            // console.log(request.headers);
            var pathname = url.parse(request.url).pathname;
            console.log("pathname:" + pathname);
            var result = re.exec(pathname);
            console.log("result:" + result);
            var index;
            if(result){
                var original_url = result[1];
                // selectData(db, {"url":original_url}, function(result) {
                selectData(db, {}, function(result) {
                    console.log(result);
                    // db.close();
                    for(var i in result){
                        if(original_url == result[i].url){
                            index = result[i].index;
                            break;
                        }
                    }
                    if(index > 0){

                    }else{
                        index = result.length + 1;
                        //连接到表 site
                        var collection = db.collection('site');
                        //插入数据
                        collection.insert({"index":index,"url":original_url}, function(err, result) {
                            if(err)
                            {
                                console.log('Insert Error:'+ err);
                                return;
                            }
                            console.log(result);
                        });
                    }
                    var resultObj = { };
                    resultObj.original_url = original_url;
                    resultObj.short_url = "https://" + request.headers.host + "/" + index;

                    response.writeHead(200, {"Content-Type": "text/plain"});
                    response.write(JSON.stringify(resultObj));
                    response.end();
                });
            }else{
                var result1 = re1.exec(pathname);
                console.log("result1:" + result1);
                if(result1){
                    index = parseInt(result1[1]);

                    selectData(db, {"index":index}, function(result) {
                        console.log(result);
                        // db.close();
                        if(result && result.length > 0){
                            response.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                            response.write(respondseHTML.replace("{original_url}", result[0].url));
                            response.end();
                        }
                    });
                }
            }
        }).listen(8080);
    }
});

var selectData = function(db, whereStr, callback) {
    //连接到表
    var collection = db.collection('site');
    collection.find(whereStr).toArray(function(err, result) {
        if(err)
        {
            console.log('Find Error:'+ err);
            return;
        }
        callback(result);
    });
}

