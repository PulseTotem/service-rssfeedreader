/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 * @author Simon Urli <simon@pulsetotem.fr>
 */

/// <reference path="../t6s-core/core-backend/scripts/server/SourceServer.ts" />
/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />

/// <reference path="./RSSFeedReaderNamespaceManager.ts" />

/// <reference path="./sources/RetrieveFeedContent.ts" />

/**
 * Represents the The 6th Screen RSSFeedReader' Service.
 *
 * @class RSSFeedReader
 * @extends SourceServer
 */
class RSSFeedReader extends SourceServer {

    /**
     * Constructor.
     *
     * @param {number} listeningPort - Server's listening port..
     * @param {Array<string>} arguments - Server's command line arguments.
     */
    constructor(listeningPort : number, arguments : Array<string>) {
        super(listeningPort, arguments);

        this.init();
    }

    /**
     * Method to init the RSSFeedReader server.
     *
     * @method init
     */
    init() {
        var self = this;

        this.addNamespace("RSSFeedReader", RSSFeedReaderNamespaceManager);

		var test = new RetrieveFeedContent({ "URL" : "http://www.lemonde.fr/rss/une.xml", "Limit" : "2", "InfoDuration" : "10"}, null);
    }
}

/**
 * Server's RSSFeedReader listening port.
 *
 * @property _RSSFeedReaderListeningPort
 * @type number
 * @private
 */
var _RSSFeedReaderListeningPort : number = process.env.PORT || 6002;

/**
 * Server's RSSFeedReader command line arguments.
 *
 * @property _RSSFeedReaderArguments
 * @type Array<string>
 * @private
 */
var _RSSFeedReaderArguments : Array<string> = process.argv;

var serverInstance = new RSSFeedReader(_RSSFeedReaderListeningPort, _RSSFeedReaderArguments);
serverInstance.run();