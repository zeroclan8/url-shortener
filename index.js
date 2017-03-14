'use strict';

var http = require("http");
var url = require("url");

var re = /^\/new\/(https?:\/\/.*)$/;
var original_url_arr = ["http://www.baidu.com", "http://www.qq.com"];
var respondseHTML =
    '<html><head><meta charset="utf-8"><title>url-shortener</title></head>' +
    '<script language="javascript" type="text/javascript">' +
    'window.location.href="{original_url}";' +
    '</script>' +
    '<body>' +
    '</body></html>';

http.createServer(function (request, response) {
    // console.log(request.headers);
    var pathname = url.parse(request.url).pathname;
    console.log("pathname:" + pathname);
    var result = re.exec(pathname);
    console.log("result:" + result);
    var index;
    if(result){
        var original_url = result[1];
        index = original_url_arr.indexOf(original_url);
        if(index == -1){
            original_url_arr.push(original_url);
            index = original_url_arr.length - 1;
        }
        var resultObj = { };
        resultObj.original_url = original_url;
        resultObj.short_url = "https://" + request.headers.host + "/" + (index + 1);

        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(JSON.stringify(resultObj));
        response.end();
    }else{
        index = parseInt(pathname.substr(1)) - 1;
        if(index >= 0 && index <= original_url_arr.length - 1){
            response.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            response.write(respondseHTML.replace("{original_url}", original_url_arr[index]));
            response.end();
        }
    }
}).listen(8080);
