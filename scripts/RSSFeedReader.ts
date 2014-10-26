/**
 * @author Christian Brel <christian@the6thscreen.fr, ch.brel@gmail.com>
 */

/// <reference path="../t6s-core/core-backend/libsdef/node.d.ts" />
/// <reference path="../t6s-core/core-backend/libsdef/express.d.ts" />
/// <reference path="../t6s-core/core-backend/libsdef/socket.io-0.9.10.d.ts" />

/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="../t6s-core/core-backend/scripts/LoggerLevel.ts" />

/// <reference path="../t6s-core/core/scripts/infotype/FeedContent.ts" />
/// <reference path="../t6s-core/core/scripts/infotype/FeedNode.ts" />

var http = require("http");
var express = require("express");
var sio = require("socket.io");

var FeedParser = require('feedparser');
var request = require('request');
//var Iconv = require('iconv');

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
                self._retrieveFeedContent(params);
            });

            socket.on('disconnect', function(){
                Logger.info("The 6th Screen SourcesServer disconnected : " + socket.id);
            });
        });

        httpServer.listen(listeningPort, function(){
            Logger.info("The 6th Screen RSSFeedReader' Service listening on *:" + listeningPort);
        });
    }

    /**
     * Retrieve a RSS/ATOM Feed and return the feed in "InfoType" format.
     *
     * @method _retrieveFeedContent
     * @private
     * @param {Object} params - Params to retrieve feed : Feed URL and limit of articles to return.
     */
    private _retrieveFeedContent(params : any) {
        Logger.debug("RetrieveFeedContent Action with params :");
        Logger.debug(params);
        //TODO : Change format
        //TODO : Send result to SourcesServer

        var feedContent : FeedContent = new FeedContent();
        var feedContentOk = false;

        this.fetch(params.FeedURL, function(item) {
            if(!feedContentOk) {
                feedContent.setTitle(item.meta.title);
                feedContent.setDescription(item.meta.description);
                feedContent.setUrl(item.meta.xmlUrl);
                feedContent.setLanguage(item.meta.language);
                if(typeof(item.meta.image.url) != "undefined") {
                    feedContent.setLogo(item.meta.image.url);
                }
                feedContentOk = true;
            }
            var feedNode : FeedNode = new FeedNode();
            feedNode.setTitle(item.title);
            feedNode.setDescription(item.description);
            feedNode.setSummary(item.summary);
            feedNode.setAuthor(item.author);
            feedNode.setUrl(item.link);
            feedNode.setPubDate(item.pubDate);

            feedContent.addFeedNode(feedNode);
        });
    }

    private fetch(feed, itemProcessFunction) {
        var self = this;
        // Define our streams
        var req = request(feed, {timeout: 10000, pool: false});
        req.setMaxListeners(50);
        // Some feeds do not respond without user-agent and accept headers.
        req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
        req.setHeader('accept', 'text/html,application/xhtml+xml');

        var feedparser = new FeedParser();

        // Define our handlers
        req.on('error', this.done);
        req.on('response', function(res) {
            if (res.statusCode != 200) {
                //TODO : Throw Exception ?
                //return this.emit('error', new Error('Bad status code'));
                Logger.error("Bad status code.");
            }
            var charset = self.getParams(res.headers['content-type'] || '').charset;
            res = self.maybeTranslate(res, charset);
            // And boom goes the dynamite
            res.pipe(feedparser);
        });

        feedparser.on('error', this.done);
        feedparser.on('end', this.done);
        feedparser.on('readable', function() {
            var post;
            while (post = this.read()) {
                itemProcessFunction(post);
            }
        });
    }

    private maybeTranslate(res, charset) {
        /*var iconv;
        // Use iconv if its not utf8 already.
        if (!iconv && charset && !/utf-*8/i.test(charset)) {
            try {
                iconv = new Iconv(charset, 'utf-8');
                Logger.debug('Converting from charset ' + charset + ' to utf-8');
                iconv.on('error', this.done);
                // If we're using iconv, stream will be the output of iconv
                // otherwise it will remain the output of request
                res = res.pipe(iconv);
            } catch(err) {
                res.emit('error', err);
            }
        }*/
        return res;
    }

    private getParams(str) {
        var params = str.split(';').reduce(function (params, param) {
            var parts = param.split('=').map(function (part) { return part.trim(); });
            if (parts.length === 2) {
                params[parts[0]] = parts[1];
            }
            return params;
        }, {});
        return params;
    }

    private done(err) {
        if (err) {
            //console.log(err, err.stack);
            Logger.error(err);
        }
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