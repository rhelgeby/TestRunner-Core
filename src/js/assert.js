// Test Runner Assertion Functions
// Tor Magnus Rakvåg

// Credits/Sources:
// JsTestDriver

var fail = function AssertionException(msg) {
	var err = new Error(msg);
	err.name = 'AssertionException';
	
	if(!err.message) {
		err.message = msg;
	}
	
	throw err;
};

function _isArray(obj) {
	if(!obj.constructor.toString().indexof("Array" == -1)) {	
		return true;
	}
}

function assert(actual, message) {
  //C-like assert
  if (!actual) {
    fail(message);
  }
}

function failTest(msg) {
	fail(typeof msg === 'undefined' ? 'Test failed by default.' : msg);
}

// Doesn't work right now, test_runner catches it
function assertNoException(func, msg) {
	try{
		func();
	}catch(e){
		fail(typeof msg === 'undefined' ? 'expected no exception but threw: ' + e.name + '(' + e.message + ')' : msg);
	}
	return true;
}

function assertTagName(tagName, element, msg) {
	var actual = element && element.tagName;
	if (String(actual).toUpperCase() != tagName.toUpperCase()) {
		fail(typeof msg === 'undefined' ? 'Expected tagName to be ' + tagName + ' but was ' + actual : msg);
	}
}

function assertElementId(element, id, msg) {
	var actual = element && element.id;
	if (actual !== id) {
		fail(typeof msg === 'undefined' ? 'Expected id to be ' + id + ' but was ' + actual : msg);
	}
}

function assertTrue(actual, msg) {
	if (actual != true) {
		fail(typeof msg === 'undefined' ? 'Expected true but was ' + actual : msg);
	}
}

function assertFalse(actual, msg) {
	if (actual != false) {
		fail(typeof msg === 'undefined' ? 'Expected false but was ' + actual : msg);
	}
}

function assertSame(actual, expected, msg) {
	if (actual !== expected) {
		fail(typeof msg === 'undefined' ? 'Expected ' + expected + ' but was ' + actual : msg);
	}
}

function assertNotSame(actual, expected, msg) {
	if (actual === expected) {
		fail(typeof msg === 'undefined' ? 'Expected not same but was same' : msg);
	}
}

function assertNotNull(actual, msg) {
	if (actual === null) {
		fail(typeof msg === 'undefined' ? 'Expected not null but was ' + actual : msg);
	}
}

function assertNull(actual, msg) {
	if (actual !== null) {
		fail(typeof msg === 'undefined' ? 'Expected null but was ' + actual : msg);
	}	
}

function assertUndefined(actual, msg) {
	if (typeof actual != 'undefined') {
		fail(typeof msg === 'undefined' ? 'Expected undefined but was ' + actual : msg);
	}
}

function assertNotUndefined(actual, msg) {
	if (typeof actual == 'undefined') {
		fail(typeof msg === 'undefined' ? 'Expected not undefined but was ' + actual : msg);
	}
}

function assertNaN(actual, msg) {
	if (!isNaN(actual)) {
		fail(typeof msg === 'undefined' ? 'Expected not to be a number but was ' + typeof actual : msg);
	}
}

function assertNotNaN(actual, msg) {
	//Not Not A Number!
	if (isNaN(actual)) {
		fail(typeof msg === 'undefined' ? 'Expected to be a number ' + 'but was ' + typeof actual : msg);
	}
}

function assertInstanceOf(actual, constructor, msg) {
	// in case constructor has no attribute "name"
	var foo = constructor && constructor.name || constructor;
	if (actual instanceof constructor == false) {
		fail(typeof msg === 'undefined' ? '' + actual + ' not instance of ' + foo : msg);
	}
}

function assertNotInstanceOf(actual, constructor, msg) {
	// in case constructor has no attribute "name"
	var foo = constructor && constructor.name || constructor;
	if (actual instanceof constructor == true) {
		fail(typeof msg === 'undefined' ? '' + actual + ' instance of ' + foo : msg);
	}
}

function assertTypeOf(value, expected, msg) {
	var actual = typeof value;
	if (actual != expected) {
		fail(typeof msg === 'undefined' ? '' + value + ' expected to be ' + expected + ' but was ' + ' ' + actual + '' : msg);
	}
	
	return true;
}

function assertBool(actual, msg) {
	return assertTypeOf(actual, 'boolean', msg);
}

function assertFunction(actual, msg) {
	return assertTypeOf(actual, 'function', msg);
}

function assertObject(actual, msg) {
	return assertTypeOf(actual, 'object', msg);
}

function assertNumber(actual, msg) {
	return assertTypeOf(actual, 'number', msg);
}

function assertString(actual, msg) {
	return assertTypeOf(actual, 'string', msg);
}

function assertArray(actual, msg) {
	if (!_isArray(actual)) {
		fail(typeof msg === 'undefined' ? '' + actual + ' is not array' : msg);
	}	
}

function assertArrayNotEmpty(actual, msg) {
	if (actual.length == 0) {
		fail(typeof msg === 'undefined' ? 'array empty' : msg);
	}
}
