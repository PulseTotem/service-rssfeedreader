/**
 * @author Simon Urli <simon@the6thscreen.fr>
 */


/// <reference path="../../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/FeedContent.ts" />

/// <reference path="../../t6s-core/core-backend/scripts/server/SourceItf.ts" />

var FeedParser : any = require('feedparser');
var request : any = require('request');
var datejs : any = require('datejs');

var DateJS : any = <any>Date;
var uuid : any = require('node-uuid');

class RetrieveFeedContent extends SourceItf {

	constructor(params : any, feedReaderNamespaceManager : RSSFeedReaderNamespaceManager) {
		super(params, feedReaderNamespaceManager);

		if (this.checkParams(["URL", "InfoDuration", "Limit"])) {
			this.run();
		}
	}

	public run() {
		var self = this;

		this.fetch(self.getParams().FeedURL, self.buildFeedContentFromItem, function(err) {
			if (err) {
				//console.log(err, err.stack);
				Logger.error(err);
			}
		});
	}

	buildFeedContentFromItem = function(item) {
		var feedContent:FeedContent = new FeedContent();

		feedContent.setId(uuid.v1());
		feedContent.setPriority(0);
		if (item.meta.date != null && typeof(item.meta.date) != "undefined") {
			var creaDesc:string = item.meta.date.toString();
			var creaDate:any = DateJS.parse(creaDesc);
			feedContent.setCreationDate(creaDate);
			feedContent.setObsoleteDate(creaDate.addDays(7));
		}
		feedContent.setDurationToDisplay(this.getParams().InfoDuration);

		feedContent.setTitle(item.meta.title);
		feedContent.setDescription(item.meta.description);
		feedContent.setUrl(item.meta.xmlUrl);
		feedContent.setLanguage(item.meta.language);
		if(typeof(item.meta.image.url) != "undefined") {
			feedContent.setLogo(item.meta.image.url);
		}


		var pubDate : any = DateJS.parse(item.pubDate);

		var feedNode : FeedNode = new FeedNode(item.guid, 0, pubDate, pubDate.addDays(7), parseInt(this.getParams().InfoDuration));
		feedNode.setTitle(item.title);
		feedNode.setDescription(item.description);
		feedNode.setSummary(item.summary);
		feedNode.setAuthor(item.author);
		feedNode.setUrl(item.link);

		if(item.image != null && typeof(item.image) != "undefined" && item.image.url != null && typeof(item.image.url) != "undefined") {
			feedNode.setMediaUrl(item.image.url);
		}

		feedContent.addFeedNode(feedNode);

		this.getSourceNamespaceManager().sendNewInfoToClient(feedContent);

	};

	fetch(feed, itemProcessFunction, errorCB) {
		var req = request(feed, {timeout: 10000, pool: false});
		req.setMaxListeners(50);

		// Some feeds do not respond without user-agent and accept headers.
		req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
		req.setHeader('accept', 'text/html,application/xhtml+xml');

		var feedparser = new FeedParser();

		// Define our handlers
		req.on('error', errorCB);

		req.on('response', function(res) {
			var stream = this;

			if (!(res.statusCode >= 200 && res.statusCode < 300)) {
				Logger.debug("Bad status code for URL: "+feed+" Code: "+res.statusCode);
				return this.emit('error', new Error('Bad status code'));
				//Logger.error("Bad status code.");
			}

			stream.pipe(feedparser);
		});

		feedparser.on('error', errorCB);

		feedparser.on('readable', function() {

			// This is where the action is!
			var stream = this;
			var item;
			//var meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance

			while (item = stream.read()) {
				itemProcessFunction(item);
			}
		});
	}
}