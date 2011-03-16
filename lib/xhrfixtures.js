// (The BSD License)
// 
// Copyright (c) 2011, Mario Scheliga, mario@sourcegarden.com
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
// 
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright notice,
//       this list of conditions and the following disclaimer in the documentation
//       and/or other materials provided with the distribution.
//     * Neither the name of Mario Scheliga nor the names of his contributors
//       may be used to endorse or promote products derived from this software
//       without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


var xhrfixture = function (spec) {
	var that =  {},
		isQUnit = (typeof window.QUnit !== "undefined");
	spec = spec || {};  
	
	var lowercaseObjectKeys = function (obj) {
		var nobj = {};
		if (obj.constructor.toString().indexOf("Object") === -1) {
			return obj; //other things will not be converted
		}
		//if
		for (var i in obj) {  
			if (obj[i] && obj[i].constructor.toString().indexOf("Object") !== -1) { 
				nobj[i.toLowerCase()] = lowercaseObjectKeys(obj[i]);
			} else { 
				nobj[i.toLowerCase()] = obj[i];
			}
		}
		return nobj;
	};
	var isType = function (val, type) {
		if(typeof val === "undefined" || val === null) {
			return false;
		}
		if(val.constructor && val.constructor.toString().indexOf(type) !== -1) {
			return true;
		}
		return false;
	};
	var validate = function (patterns, testobj, shouldFail) {
		var found = false,
			test;
		for (var i in patterns) { 
			if(i !== "__valid_response" && i !== "__valid_request") {
				//if the key not exists - invalidated
				if (typeof testobj[i] === "undefined") {
					return false;
				}
				if (isType(patterns[i], "RegExp") && isType(testobj[i], "String")) {
					test = patterns[i].test(testobj[i]);
					if (!test && shouldFail) { 
						ok(!test , "The value:\""+testobj[i]+ "\" not matches the RegExp("+ patterns[i].toString()+") pattern");
					} else { 
						ok(test , "The value:\""+testobj[i]+ "\" matches the RegExp("+ patterns[i].toString()+") pattern");
					}
				} else if (isType(patterns[i], "Object") && isType(patterns[i].type, "String") && patterns[i].type.toLowerCase() === "regexp") {
					var regexp;
					patterns[i].modifiers = patterns[i].modifiers || "";
					regexp = new RegExp(patterns[i].pattern, patterns[i].modifiers);
					test = regexp.test(testobj[i]);
					if (!test && shouldFail) {
						ok(!test , "The value:\""+testobj[i]+ "\" not matches the RegExp("+ regexp.toString()+") pattern");
					} else {
						ok(test , "The value:\""+testobj[i]+ "\" matches the RegExp("+ regexp.toString()+") pattern");
					}
					 
				} else if(isType(patterns[i], "Object")) {
					//if testobj is a string and the string is parsable json - continue with validation tree
					//borrowed from http://tools.ietf.org/html/rfc4627
					if(isType(testobj[i], "String") && (/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(testobj[i].replace(/"(\\.|[^"\\])*"/g, '')))) {
						testobj[i] = $.parseJSON(testobj[i]);
					}
					validate(patterns[i], testobj[i], shouldFail)
				} else if(isType(patterns[i], "String")) {
					test = (testobj[i] === patterns[i]);
					if (test === false && shouldFail === true) {
						ok(!test, "The value: "+testobj[i]+" is not equal to "+patterns[i]);
					} else {
						ok(test, "The value: "+testobj[i]+" is equal to "+patterns[i]);
					}
					
				} else if(isType(patterns[i], "Number")) {
					test = (testobj[i] === patterns[i]);
					if (test === false && shouldFail === true) {
						ok(!test, "The value: "+testobj[i]+" is not equal to "+patterns[i]);
					} else {
						ok(test, "The value: "+testobj[i]+" is equal to "+patterns[i]);
					}
					 
				} else {
					//alert(patterns[i].constructor.toString());
				}
				
			}
		}
		return found;
	};
	/**
	* @description validates the response against a given spec,
	* if no specs past to the function, the __valid_response value of the fixture 
	* would be used. The second parameter is a boolean flag for tests, which are
	* ment to fail, then all failures will be asserted as true
	*
	* @param options (optional)
	* @param shouldFail (optional) - it has no effekt if you set this param to false
	**/
	that.validateResponse = function (options, shouldFail) {
		options = options || spec.__valid_response;
		shouldFail = shouldFail || false;
		return validate(lowercaseObjectKeys(options), lowercaseObjectKeys(spec.response), shouldFail);
	};
	
	/**
	* @description validates the response against a given spec,
	* if no specs past to the function, the __valid_response value of the fixture 
	* would be used. The second parameter is a boolean flag for tests, which are
	* ment to fail, then all failures will be asserted as true
	*
	* @param options (optional)
	* @param shouldFail (optional) - it has no effekt if you set this param to false
	**/	
	that.validateRequest = function (options, shouldFail) {
		options = options || spec.__valid_request; 
		return validate(lowercaseObjectKeys(options), lowercaseObjectKeys(spec.request), shouldFail);
	};
	
	that.getSpec = function () {
		return spec;
	};
	that.setSpec = function (exspec) {
		spec = exspec;
	};
	that.getResponse = function () {
		return spec.response;
	};
	that.setResponse = function (obj) {
		spec.response = obj;
	};
	that.getRequest = function () {
		return spec.request;
	};
	that.setRequest = function (obj) {
		spec.request = obj;
	};
	
	
	//Untested hacks
	that.respondSinonFake = function (sinonRequest) {
		sinonRequest.respond(spec.response.status,spec.response.headers, spec.response.body);
	};
	that.importSinonFakeRequest = function (sinonRequest) {
		var requestObj = {
			method: sinonRequest.method,
			headers: sinonRequest.requestHeaders,
			body: sinonRequest.requestBody,
			url: sinonRequest.url
		};
		spec.request = requestObj;
	};
	
	that.getResponseBodyJSON = function () { 
		return $.parseJSON(spec.response.body);
	};
	
	
	return that;
};



var xhrfixtures = function (options) {
	var that = {},
		fixtures = {}
	options = options || {};
	
	/**
	* @description loads json-fixtures, the files have to contain valid json
	*/
	that.loadFixtures = function (paths, callback) {
		var len = paths.length;
		var ch = []; 
		for (i = 0; i < len; i++) { 
			var workaround = {
				get: function (url,data,datatype,cb) {  
					$.get(url,data,function (rdata, rstatus,jqxhr) { 
						cb(null, $.parseJSON(rdata)); //its better to try to parse text, throws a nice exception - if something went wrong
					},datatype);
				}
			};
			ch.push([workaround, "get", paths[i], null, "text"]); //intentionally using text here
		}
		chain(ch, function (err, results) {
			if (err) {
				return callback(err, null);
			}
			for (var i in results) { 
				for (var j in results[i]) {
					for (var x in results[i][j]) {
						fixtures[x] = xhrfixture(results[i][j][x]);
					}
				}
			}
			callback(null, results);
		}); 
	};
	
	that.getFixtures = function () {
		return fixtures;
	}; 
	return that;
}