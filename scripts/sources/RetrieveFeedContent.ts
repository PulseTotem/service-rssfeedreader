/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 * @author Simon Urli <simon@pulsetotem.fr>
 */


/// <reference path="../../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="../../t6s-core/core-backend/t6s-core/core/scripts/infotype/FeedContent.ts" />

/// <reference path="../../t6s-core/core-backend/scripts/server/SourceItf.ts" />

var FeedParser : any = require('feedparser');
var request : any = require('request');
var moment = require('moment');

var uuid : any = require('node-uuid');

/**
 * Represents RSSFeedReader' Source : RetrieveFeedContent.
 * Retrieve all items of an RSS Feed.
 * Parameters :
 * - URL: Feed's URL
 * - InfoDuration : Duration for each item
 * - Limit : Limit of the numer of items to retrieve (0 = no limit)
 *
 * @class RetrieveFeedContent
 * @extends SourceItf
 */
class RetrieveFeedContent extends SourceItf {

	/**
	 * Constructor.
	 *
	 * @param {JSON} params - The params used by the source call.
	 * @param {RSSFeedReaderNamespaceManager} feedReaderNamespaceManager - The SourceNamespaceManager associated to this source.
	 */
	constructor(params : any, feedReaderNamespaceManager : RSSFeedReaderNamespaceManager) {
		super(params, feedReaderNamespaceManager);

		if (this.checkParams(["URL", "InfoDuration", "Limit"])) {
			this.run();
		}
	}

	/**
	 * Launch the Source job !
	 *
	 * @method run
	 */
	public run() {
		var self = this;

		this.fetch(self.getParams().URL);
	}

	errorCB(err) {
		if (err) {
			//console.log(err, err.stack);
			Logger.error(err);
		}
	}

	buildFeedContentFromItemsList(itemsList) {
		var self = this;

		if(itemsList.length > 0) {
			var feedContent:FeedContent = new FeedContent();

			feedContent.setId(itemsList[0].meta.xmlUrl);
			feedContent.setPriority(0);

			if (itemsList[0].meta.date != null && typeof(itemsList[0].meta.date) != "undefined") {
				var creaDesc:string = itemsList[0].meta.date.toString();
				var creaDate:any = moment(new Date(creaDesc));
				feedContent.setCreationDate(creaDate.toDate());
				var obsoleteDate:any = moment(creaDate).add(7, 'day');
				feedContent.setObsoleteDate(obsoleteDate.toDate());
			}
			feedContent.setDurationToDisplay(parseInt(self.getParams().InfoDuration));

			feedContent.setTitle(itemsList[0].meta.title);
			feedContent.setDescription(itemsList[0].meta.description);
			feedContent.setUrl(itemsList[0].meta.xmlUrl);
			feedContent.setLanguage(itemsList[0].meta.language);
			if (typeof(itemsList[0].meta.image.url) != "undefined") {
				feedContent.setLogo(itemsList[0].meta.image.url);
			}

			itemsList.forEach(function(item) {
				var pubDate:any = moment(new Date(item.pubDate));
				var obsoleteDate:any = moment(pubDate).add(7, 'day');

				var feedNode:FeedNode = new FeedNode(item.guid, 0, pubDate.toDate(), obsoleteDate.toDate(), parseInt(self.getParams().InfoDuration));
				feedNode.setTitle(item.title);
				feedNode.setDescription(item.description);
				feedNode.setSummary(item.summary);
				feedNode.setAuthor(item.author);
				feedNode.setUrl(item.link);

				if (item.image != null && typeof(item.image) != "undefined" && item.image.url != null && typeof(item.image.url) != "undefined") {
					feedNode.setMediaUrl(item.image.url);
				}

				feedContent.addFeedNode(feedNode);
			});

			self.getSourceNamespaceManager().sendNewInfoToClient(feedContent);
		} else {
			var feedContent:FeedContent = new FeedContent();

			feedContent.setId(uuid.v1());
			feedContent.setPriority(0);

			self.getSourceNamespaceManager().sendNewInfoToClient(feedContent);
		}

	}

	fetch(feed) {
		var self = this;
		var alreadyProcess = false;

		var limit = parseInt(self.getParams().Limit);
		if(limit == 0) {
			limit = Infinity;
		}
		var itemsList = new Array();

		var feedparser = new FeedParser();

		feedparser.on('error', self.errorCB);

		feedparser.on('end', function() {
			if(!alreadyProcess) {
				self.buildFeedContentFromItemsList(itemsList);
				alreadyProcess = true;
			}
		});

		feedparser.on('readable', function() {
			var stream = this;
			if(itemsList.length < limit) {
				var item = stream.read();
				if(item != null) {
					itemsList.push(item);
				}
			} else {
				if(!alreadyProcess) {
					self.buildFeedContentFromItemsList(itemsList);
					alreadyProcess = true;
				}
			}
		});

		var req = request(feed, {timeout: 10000, pool: false});
		req.setMaxListeners(50);

		// Some feeds do not respond without user-agent and accept headers.
		req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
		req.setHeader('accept', 'text/html,application/xhtml+xml');

		req.on('error', self.errorCB);

		req.on('response', function(response) {
			if (!(response.statusCode >= 200 && response.statusCode < 300)) {
				Logger.debug("Bad status code for URL: " + feed + " Code: " + response.statusCode);
				self.errorCB(new Error('Bad status code'));
			}

			req.pipe(feedparser);
		});
	}
}