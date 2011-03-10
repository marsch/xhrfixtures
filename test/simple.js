function getLoadFixture() {
	return { 
		"__valid_response": {
			"status": 200,
			"headers": {
				"Content-type": {
					"type": "RegExp",
					"pattern": "json",
					"modifiers": "gim"
				}
			},
			"payload": {
				"session": {
					"type": "RegExp",
					"pattern": "\\w+"
				}
			}
		},
		"__valid_request": {
			"method": "GET"
		},
		"request": {
			"method": "GET",
			"path": "/",
			"headers": {
				"Host": "www.myhost.com"
			},
			"payload": ""

		},
		"response":  {
			"status": 200,
			"headers": {
				"Content-Type": "application/json"
			},
			"Payload": "{\"session\": \"3adfjo2i3isakal2\", \"random\": \"3lasklj303829283wkj3\"}"
		}
	};
}




module("xhrfixtures helper");
test("xhrfixtures test is running", function () {
	ok(true, "is up and running");
});

test("load simple fixture", function () {
	var fix = xhrfixtures();
	ok((typeof fix === "object"), "xhrfixtures returns an object");
	var jx = this.spy(jQuery, "get"); 
	var loadFixture = getLoadFixture();	
	fix.loadFixtures(["./test/fixtures/simple.json"], function (err, results) {
		var fixture = fix.getFixtures()["simple fixture"]; //first one 
		ok((typeof fixture === "object"), "the single fixture item is an object");
		ok((typeof fixture.getSpec().request === "object" && typeof fixture.getSpec().response === "object"), "and the item contains to fields (request, response)");
		deepEqual(fixture.getSpec(), loadFixture, "fixture is loaded as expected");
		deepEqual(fixture.getSpec().response, loadFixture.response, "fixture.response is as expected");
		start();
	}); 
	ok(jQuery.get.calledOnce, "loads the file using jquery.get");
	stop(2000); 
});




module("xhrfixture");
test("xhrfixture test is running", function () {
	ok(true, "is up and running");
});

test("getSpec method", function () {
	var loadFixture = getLoadFixture();
	var fixture = xhrfixture(loadFixture);
	deepEqual(fixture.getSpec(), loadFixture, "returns the same object");	
});

test("simple validateResponse", function () {
	var loadFixture = getLoadFixture();
	var fixture = xhrfixture(loadFixture);
	fixture.validateResponse({payload: /session/});
});

test("nested validateRequest", function() {
	var loadFixture = getLoadFixture();
	var fixture = xhrfixture(loadFixture);
	fixture.validateRequest({headers: {"Host": /myhost/}});
});

test("multi nested validateRequest regexp or string", function () {
	var loadFixture = getLoadFixture();
	var fixture = xhrfixture(loadFixture);
	fixture.validateRequest({method: "GET", headers: {"Host": /myhost/}}); 
});

test("simple testing included validation", function () {
	var loadFixture = getLoadFixture();
	var fixture = xhrfixture(loadFixture);
	fixture.validateRequest(loadFixture.__valid_request);
	fixture.validateResponse(loadFixture.__valid_response);
});

test("simple validate integrated validation", function() {
	var loadFixture = getLoadFixture();
	var fixture = xhrfixture(loadFixture);
	fixture.validateRequest();
	fixture.validateResponse();
});

test("test integrated, loading and validation of fixtures", function () {
	var fix = xhrfixtures();
	fix.loadFixtures(["./test/fixtures/simple.json"], function (err, results) {
		var fixture = fix.getFixtures()["simple real live fixture"]; //first one 
		ok((typeof fixture === "object"), "the single fixture item is an object");
		ok((typeof fixture.getSpec().request === "object" && typeof fixture.getSpec().response === "object"), "and the item contains to fields (request, response)");

		fixture.validateResponse();
		fixture.validateRequest();
		start();
	});  
	stop(2000);
});

test("test invalid validation options", function () {
	var fix = xhrfixtures();
	fix.loadFixtures(["./test/fixtures/simple.json"], function (err, results) {
		var fixture = fix.getFixtures()["simple example of bad validation"]; //first one 
		ok((typeof fixture === "object"), "the single fixture item is an object");
		ok((typeof fixture.getSpec().request === "object" && typeof fixture.getSpec().response === "object"), "and the item contains to fields (request, response)");

		//something happens here!!
		fixture.validateResponse(false, false);
		fixture.validateRequest(null, true);
		start();
	});  
	stop(2000);
});

/**
library should return what not matched in validation process (may be throws?)
if string is parsable json - continue with validation tree
fixtures - header case-insensitive
fixture should contain a validation parameter
fixture should have a option to extract parameters for further tests
fixture should have a dynamic value options (like mustache or something)

**/