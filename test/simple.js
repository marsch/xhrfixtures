function getLoadFixture() {
	return {
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
		
			},
			"payload": "some payload for you"
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
	ok(fixture.validateResponse({payload: /some payload/}), "finds the right thing in the payload");
	ok(!fixture.validateResponse({payload: /noone should find this/}), "and do not find the incorrect thing");	
});

test("nested validateRequest", function() {
	var loadFixture = getLoadFixture();
	var fixture = xhrfixture(loadFixture);
	ok(fixture.validateRequest({headers: {"Host": /myhost/}}), "finds nested thing also");
	ok(!fixture.validateRequest({headers: {"none": /youneverfind/}}), "and didn't find the wrong one");
});

test("multi nested validateRequest regexp or string", function () {
	var loadFixture = getLoadFixture();
	var fixture = xhrfixture(loadFixture);
	ok(!fixture.validateRequest({method: "POST", headers: {"Host": /myhost/}}), "validates pessimistic correctly");
});