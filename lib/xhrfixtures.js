var xhrfixture = function (spec) {
	var that =  {};
	spec = spec || {}; 
	
	validate = function (patterns, testobj) {
		var found = false;
		for (var i in patterns) { 
			if (patterns[i].constructor.toString().indexOf("RegExp") !== -1 
				&& typeof testobj[i] !== "undefined") {
				if (testobj[i].match(patterns[i])) {
					found = true;
				} else {
					return false;
				}
			}
			if(patterns[i].constructor.toString().indexOf("Object") !== -1) {
				if(!validate(patterns[i], testobj[i])) {
					return false;
				} else {
					found = true;
				};
			}
			if(patterns[i].constructor.toString().indexOf("String") !== -1) {
				if (patterns[i] === testobj[i]) {
					found = true;
				} else {
					return false;
				}
			}
		//	if (patterns[i].constructor.to)
		}
		return found;
	};
	
	
	that.validateResponse = function (options) {
		return validate(options, spec.response);
	};
	that.validateRequest = function (options) {
		return validate(options, spec.request);
	};
	
	that.getSpec = function () {
		return spec;
	}
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
					},datatype)
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