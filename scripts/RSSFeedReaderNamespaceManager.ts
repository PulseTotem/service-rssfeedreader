/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 * @author Simon Urli <simon@pulsetotem.fr>
 */

/// <reference path="../t6s-core/core-backend/scripts/server/SourceNamespaceManager.ts" />

class RSSFeedReaderNamespaceManager extends SourceNamespaceManager {

    /**
     * Constructor.
     *
     * @constructor
     * @param {any} socket - The socket.
     */
    constructor(socket : any) {
        super(socket);
        this.addListenerToSocket('RetrieveFeedContent', function (params : any, self : RSSFeedReaderNamespaceManager) { new RetrieveFeedContent(params, self); });
    }
}