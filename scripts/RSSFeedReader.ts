/**
 * @author Christian Brel <christian@the6thscreen.fr, ch.brel@gmail.com>
 */

/// <reference path="../t6s-core/core-backend/scripts/server/Server.ts" />
/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />

/// <reference path="./RSSFeedReaderNamespaceManager.ts" />



/**
 * Represents the The 6th Screen RSSFeedReader' Service.
 *
 * @class RSSFeedReader
 * @extends Server
 */
class RSSFeedReader extends Server {



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
    }
}

/**
 * Server's RSSFeedReader listening port.
 *
 * @property _RSSFeedReaderListeningPort
 * @type number
 * @private
 */
var _RSSFeedReaderListeningPort : number = process.env.PORT_RSSFEEDREADER || 6002;

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