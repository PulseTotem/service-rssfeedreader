/**
 * @author Christian Brel <christian@the6thscreen.fr, ch.brel@gmail.com>
 */

/// <reference path="../t6s-core/core-backend/libsdef/node.d.ts" />
/// <reference path="../t6s-core/core-backend/libsdef/express.d.ts" />
/// <reference path="../t6s-core/core-backend/libsdef/socket.io-0.9.10.d.ts" />

/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="../t6s-core/core-backend/scripts/LoggerLevel.ts" />

var http = require("http");
var express = require("express");
var sio = require("socket.io");

/**
 * Represents the The 6th Screen RSSFeedReader' Service.
 *
 * @class RSSFeedReader
 */
class RSSFeedReader {

    /**
     * Method to run the server.
     *
     * @method run
     */
    run() {
        var self = this;

        var listeningPort = process.env.PORT_RSSFEEDREADER || 6002;

        var app = express();
        var httpServer = http.createServer(app);
        var io = sio.listen(httpServer);

        app.get('/', function(req, res){
            res.send('<h1>Are you lost ? * &lt;--- You are here !</h1>');
        });


        var rssFeedReaderNamespace = io.of("/RSSFeedReader");

        rssFeedReaderNamespace.on('connection', function(socket){
            Logger.info("New The 6th Screen SourcesServer Connection : " + socket.id);

            socket.on('RetrieveFeedContent', function(params) {
                Logger.debug("RetrieveFeedContent Action with params :");
                Logger.debug(params);
            });

            socket.on('disconnect', function(){
                Logger.info("The 6th Screen SourcesServer disconnected : " + socket.id);
            });
        });

        httpServer.listen(listeningPort, function(){
            Logger.info("The 6th Screen RSSFeedReader' Service listening on *:" + listeningPort);
        });
    }
}

var logLevel = LoggerLevel.Error;

if(process.argv.length > 2) {
    var param = process.argv[2];
    var keyVal = param.split("=");
    if(keyVal.length > 1) {
        if (keyVal[0] == "loglevel") {
            switch(keyVal[1]) {
                case "error" :
                    logLevel = LoggerLevel.Error;
                    break;
                case "warning" :
                    logLevel = LoggerLevel.Warning;
                    break;
                case "info" :
                    logLevel = LoggerLevel.Info;
                    break;
                case "debug" :
                    logLevel = LoggerLevel.Debug;
                    break;
                default :
                    logLevel = LoggerLevel.Error;
            }
        }
    }
}

Logger.setLevel(logLevel);

var serverInstance = new RSSFeedReader();
serverInstance.run();