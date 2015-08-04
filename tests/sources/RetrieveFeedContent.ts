/**
*  @author Simon Urli <simon@the6thscreen.fr>
**/

/// <reference path="../../t6s-core/core-backend/t6s-core/core/libsdef/mocha.d.ts" />
/// <reference path="../../libsdef/sinon.d.ts" />
/// <reference path="../../scripts/sources/RetrieveFeedContent.ts" />

var assert = require("assert");
var sinon : Sinon.SinonStatic = require("sinon");

describe('RetrieveFeedContent', function() {
	describe('#constructor', function () {

		it('should launch run if proper params are given', function () {
			var mockns : any = sinon.createStubInstance(RSSFeedReaderNamespaceManager);
			var mocksource = sinon.mock(RetrieveFeedContent.prototype);
			mocksource.expects("run").once();

			var params = {
				'FeedURL': "une super URL",
				'Limit': "10",
				'InfoDuration': "24"
			};
			new RetrieveFeedContent(params, mockns);
			mocksource.verify();
		});

		it('should not launch run if the parameter FeedURL is missing', function () {
			var mockns : any = sinon.createStubInstance(RSSFeedReaderNamespaceManager);
			var mocksource = sinon.mock(RetrieveFeedContent.prototype);
			mocksource.expects("run").never();

			var params = {
				'Limit': "10",
				'InfoDuration': "24"
			};
			new RetrieveFeedContent(params, mockns);
			mocksource.verify();
		});

		it('should not launch run if the parameter Limit is missing', function () {
			var mockns : any = sinon.createStubInstance(RSSFeedReaderNamespaceManager);
			var mocksource = sinon.mock(RetrieveFeedContent.prototype);
			mocksource.expects("run").never();

			var params = {
				'FeedURL': "une super URL",
				'InfoDuration': "24"
			};
			new RetrieveFeedContent(params, mockns);
			mocksource.verify();
		});

		it('should not launch run if the parameter InfoDuration is missing', function () {
			var mockns : any = sinon.createStubInstance(RSSFeedReaderNamespaceManager);
			var mocksource = sinon.mock(RetrieveFeedContent.prototype);
			mocksource.expects("run").never();

			var params = {
				'FeedURL': "une super URL",
				'Limit': "10",
			};
			new RetrieveFeedContent(params, mockns);
			mocksource.verify();
		});

	});

	describe('#run', function () {

	});
});