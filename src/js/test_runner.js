// Test Runner
// Richard Helgeby

// Credits/Sources:
// JUnit
// JsTestDriver
// http://odetocode.com/Articles/473.aspx
// http://odetocode.com/blogs/scott/archive/2007/07/05/function-apply-and-function-call-in-javascript.aspx

// TODO: Use a namespace to avoid potential conflicts.

/**
 * Constructs a test result value object.
 * 
 * @param name			Test name.
 * @param collection	Collection name.
 * @param suite			Test suite name.
 * @param passed		Whether the test passed.
 * @param msg			(Optional) Test result message.
 * 
 * @constructor
 */
function TestResult(name, collection, suite, passed, msg)
{
	this.name = name;
	this.collection = collection;
	this.suite = suite;
	this.passed = passed;
	this.msg = msg;
}


/**
 * Constructs a test case.
 * 
 * A test case is divided into phases with one phase for each page change. One phase may fill a form
 * and submit, while the next phase will verify results on the new page. If the test doesn't change
 * page, only one phase is required.
 * 
 * The test is considered passed if no exceptions are thrown.
 * 
 * If a test need to load a new page, the test runner can be aborted by returning false in any test
 * phase. When aborted, the test progress will be saved so it can resume testing on the new page.
 * 
 * @param name			Test name.
 * @param initialPage	Initial page to load before the first phase is executed.
 * @param phases		Array with functions for each test phase. Phases are executed in the order
 * 						they appear in the array.
 * 
 * @constructor
 */
function TestCase(name, initialPage, phases)
{
	this.name = name;
	this.page = initialPage;
	this.phases = phases;
	this.failed = false;
	this.msg = "";
	
	this.validate();
}

/**
 * Validates the test case. Throws an exception on error.
 */
TestCase.prototype.validate = function()
{
	if (!(this.phases instanceof Array))
	{
		throw "Invalid test phase data. Must be an array of functions.";
	}
	
	for (i in this.phases)
	{
		if (typeof this.phases[i] !== "function")
		{
			throw "Invalid test phase at index " + i + ". Must be a function.";
		}
	}
}


/**
 * Constructs a test collection.
 * 
 * There are two ways to setup a test collection. The constructor accepts an array of TestCase
 * objects, which can be declared inline in the constructor call. It's also possible to construct
 * an empty collection and then add tests individually using the addTest method.
 * 
 * @param name			Name of collection.
 * @param tests			(Optional) Array of TestCase objects.
 * 
 * @constructor
 */
function TestCollection(name, tests)
{
	this.name = name;
	this.tests = (typeof tests === "undefined" ? new Array() : tests);
	
	this.validate();
}

/**
 * Validates the array of tests. Will throw an exception on error.
 */
TestCollection.prototype.validate = function()
{
	for (var i in this.tests)
	{
		this.validateTestCase(this.tests[i]);
	}
}

/**
 * Validates a test case. Throws an exception on error.
 */
TestCollection.prototype.validateTestCase = function(testCase)
{
	if (!(testCase instanceof TestCase))
	{
		// TODO: Bug: where is "i"?
		throw "Invalid test case at index " + i + ". Must be a TestCase object.";
	}
}

/**
 * Adds a test case to the collection. Throws an exception on error.
 * 
 * @param testCase		TestCase object to add.
 */
TestCollection.prototype.addTest = function(testCase)
{
	this.validateTestCase(testCase);
	
	this.tests.push(testCase);
}

/**
 * Constructs a test suite.
 * 
 * @param name			Name of test suite.
 * @param collections	Array of TestCollection objects.
 * @param before		(Optional) Function to execute before every test.
 * @param after			(Optional) Function to execute after every test.
 */
function TestSuite(name, collections, before, after)
{
	this.name = name;
	this.collections = collections;
	this.before = before;
	this.after = after;
	
	this.validate();
}

/**
 * Validates the array of collections. Throws an exception on error.
 */
TestSuite.prototype.validate = function()
{
	for (var i in this.collections)
	{
		if (!(this.collections[i] instanceof TestCollection))
		{
			throw "Invalid collection at index " + i + ". Must be a TestCollection object.";
		}
	}
}

/**
 * Constructs a test runner.
 * 
 * This is the main object.
 * 
 * @param tests				Tests to run. TestSuite object.
 * @param resultPage		Page URL to load when displaying test results.
 * @param callbackTimeout	Optional. Time to wait for callback before failing
 * 							the test. Default is 10 seconds (10000). This does
 * 							not apply to tests that don't use callbacks.
 * 
 * @constructor
 */
function TestRunner(testSuite, resultPage, callbackTimeout)
{
	// Validate test suite.
	if (!(testSuite instanceof TestSuite))
	{
		throw "Invalid test suite. Must be a TestSuite object.";
	}
	this.suite = testSuite;
	
	// Validate result page (simple validation).
	if (!(typeof resultPage === "string"))
	{
		throw "Invalid result page. Must be a string (page URL).";
	}
	this.resultPage = resultPage;
	
	// Timer that will fail a test if waiting too long for a callback. Created
	// in runTest.
	this.callbackFailTimer = null;
	
	// Validate callback timeout.
	this.callbackTimeout = 10000;
	if (!(typeof callbackTimeout === "undefined"))
	{
		if (typeof callbackTimeout == "number")
		{
			this.callbackTimeout = callbackTimeout;
		}
		else
		{
			throw "Invalid callbackTimeout. Must be a number.";
		}
	}
	
	// Get functions to execute before and after tests. These are optional and
	// may be undefined.
	this.before = this.suite.before;
	this.after = this.suite.after;
	
	//TODO: This is a partial implementation of running single tests or
	// 		collections. Works, but no interface to control this is implemented.
	// Current runner mode. Options:
	// "all"		- run all tests in all collections
	// "collection"	- run all tests in the current collection
	// "single"		- run a single test
	this.mode = "all";
	
	// Initialize test state (creates more attributes).
	this.resetState();
	
	// Load previous state if test session is active.
	this.loadState();
}

/**
 * Initializes test states.
 */
TestRunner.prototype.resetState = function()
{
	this.results = new Array();
	
	this.collectionIterator = new ElementIterator(this.suite.collections);
	this.currentCollection = this.collectionIterator.next();
	
	this.testIterator = new ElementIterator(this.currentCollection.tests);
	this.currentTest = null;
	this.currentPhase = 0;
	
	// Whether the page was recently changed to initialize a test.
	this.pageChanged = false;
	
	this.numExecuted = 0;
	this.numPassed = 0;
}

TestRunner.prototype.verifyJSON = function()
{
	if (typeof JSON === "undefined")
	{
		throw "Missing JSON implementation.";
	}
}

/**
 * Loads test runner state from storage (HTML5 web storage).
 * 
 * Note: Does not load if the test session is inactive.
 */
TestRunner.prototype.loadState = function()
{
	this.verifyJSON();
	
	// Verify that a test session is active.
	if (!sessionStorage.testRunnerActive)
	{
		// Don't load states when test runner is loaded for the first time.
		return;
	}
	
	var json = sessionStorage.testRunnerState;
	if (json)
	{
		var state = JSON.parse(json);
		
		this.results = state.results;
		
		this.collectionIterator = new ElementIterator(this.suite.collections, state.collectionIteratorState);
		this.currentCollection = this.collectionIterator.last();
		
		this.testIterator = new ElementIterator(this.currentCollection.tests, state.testIteratorState);
		this.currentTest = this.testIterator.last();
		this.currentPhase = state.currentPhase;
		this.pageChanged = state.pageChanged;
		
		this.numExecuted = state.numExecuted;
		this.numPassed = state.numPassed;
	}
}

/**
 * Saves test runner state to storage (HTML5 web storage).
 */
TestRunner.prototype.saveState = function()
{
	var state = {};
	
	state.results = this.results;
	
	state.collectionIteratorState = this.collectionIterator.getState();
	state.testIteratorState = this.testIterator.getState();
	state.currentPhase = this.currentPhase;
	state.pageChanged = this.pageChanged;
	
	state.numExecuted = this.numExecuted;
	state.numPassed = this.numPassed;
	
	var json = JSON.stringify(state);
	sessionStorage.testRunnerState = json;
}

/**
 * Resets a test session.
 * 
 * Note: A new session is automatically started when the testing is started.
 */
TestRunner.prototype.resetSession = function()
{
	sessionStorage.testRunnerActive = "false";
	sessionStorage.testRunnerState = "";
}

/**
 * Proceeds to the next test.
 * 
 * @returns		TestCase object if found, null otherwise.
 */
TestRunner.prototype.nextTest = function()
{
	if (this.mode == "single")
	{
		// Only run one test.
		this.currentTest = null;
		return null;
	}
	
	// Get next test from test iterator.
	if (this.testIterator.hasNext())
	{
		this.currentTest = this.testIterator.next();
		return this.currentTest;
	}
	
	// No more tests in collection. Check if runner should continue.
	if (this.mode == "collection" || !this.collectionIterator.hasNext())
	{
		// Only run tests in the current collection, or no more collections. Tests done.
		this.currentTest = null;
		return null;
	}
	
	// Get next collection and test.
	this.currentCollection = this.collectionIterator.next();
	this.testIterator = new ElementIterator(this.currentCollection.tests);
	this.currentTest = this.testIterator.next();
	
	return this.currentTest;
}

TestRunner.prototype.loadPage = function(url)
{
	// Check if using PhoneGap. Loading a page must be done through PhoneGap's API, or it won't
	// load properly on the new page.
	if (typeof cordova !== "undefined")
	{
		console.log("Using PhoneGap to change page...");
		
		// Bug in Android Phone Gap: deviceready won't fire when using location.href. Using
		// navigator.app.loadUrl in PhoneGap to load a new page properly.
		
		// TODO: Get the path.
		var path = "file:///android_asset/www/";
		
		// Use a timer to let the script finish properly before loading a new page.
		var _url = url;
		setTimeout(function()
		{
			try
			{
				navigator.app.loadUrl(path + url);
			}
			catch (err)
			{
				console.log("Failed to use PhoneGap to change page, using default method. Error: " + err.message);
				window.location.href = _url;
			}
		}, 1);
		
		return;
	}
	
	window.location.href = url;
}

/**
 * Loads the initial page of a test case.
 * 
 * Note: This function will not stop execution. The page isn't changed until the script is
 * 		 completed. Don't start new tests or change the state of the test runner.
 * 
 * @param testCase		TestCase object.
 */
TestRunner.prototype.loadInitialPage = function(testCase)
{
	if (!testCase || !(testCase instanceof TestCase))
	{
		throw "Invalid test case.";
	}
	
	console.log("Loading initial page for test case '" + testCase.name + "': " + testCase.page);
	
	this.pageChanged = true;
	this.loadPage(testCase.page);
}

/**
 * Starts or resumes a test session.
 */
TestRunner.prototype.run = function()
{
	// Initialize states if a test session isn't started yet.
	// (Note: stored and compared as string "true")
	if (sessionStorage.testRunnerActive !== "true")
	{
		this.resetState();
		this.resetSession();
	}
	
	// Start test session.
	sessionStorage.testRunnerActive = "true";
	
	// Get active or next test case.
	if (!this.currentTest)
	{
		// Prepare next test.
		this.nextTest();
		
		if (!this.currentTest)
		{
			// No tests available, or all tests finished. Display results.
			this.saveState();
			this.showResults();
			
			return;
		}
		
		// Initialize test state.
		this.currentPhase = 0;
	}
	
	// Load initial page in test if not already changed.
	if (!this.pageChanged)
	{
		this.loadInitialPage(this.currentTest);
		this.pageChanged = true;
		this.saveState();
		
		return;
	}
	else
	{
		// Page was recently changed, reset flag.
		this.pageChanged = false;
	}
	
	// Run or resume test.
	var result = this.runTest(this.currentTest);
	
	// Check if script should abort (a test needs to load a new page or wait for callbacks).
	if (result === false)
	{
		// Save state and abort script to let the new page load.
		this.pageChanged = true;
		this.saveState();
		
		return;
	}
	
	// (If this point is reached, the last test phase was executed, or all phases were finished in
	// one page.)
	
	// Update states.
	this.numExecuted++;
	this.results.push(result);
	if (result.passed)
	{
		this.numPassed++;
	}
	
	// Get next test, check if done testing.
	if (!this.nextTest())
	{
		console.log("Testing done.");
		
		// End test session (don't reset states, keep results).
		this.resetSession();
		
		// Save state and display results in new page.
		this.saveState();
		this.showResults();
		
		return;
	}
	
	// There are more tests. Save state so the next run will resume properly, then load the next
	// test's initial page.
	console.log ("Next test: " + this.currentTest.name);
	this.pageChanged = true;
	this.saveState();
	this.loadInitialPage(this.currentTest);
	
	// Don't do anything now. Let the script end so the page will change.
}

/**
 * Starts the test runner only if a test session is active.
 */
TestRunner.prototype.runIfActive = function()
{
	if (sessionStorage.testRunnerActive === "true")
	{
		console.log("Test session active. Continuing tests...");
		this.run();
	}
}

/**
 * Starts or resumes a test.
 * 
 * @param testCase		Test to run (TestCase object).
 * 
 * @returns				TestResult object, or false if test runner should be aborted (if the page
 * 						is changed.
 */
TestRunner.prototype.runTest = function(testCase)
{
	console.log("Running test '" + testCase.name + "' from phase " + this.currentPhase);
	
	var abortScript = false;
	
	// Execute "before" if available and the test was just started.
	if (typeof this.before === "function" && this.currentPhase == 0)
	{
		this.before();
	}
	
	// Loop through phases, starting from current phase.
	while (!testCase.failed && typeof testCase.phases[this.currentPhase] === "function")
	{
		// Whether this phase is waiting for a callback. (Note: This var is declared/reset here.)
		this.waitingForCallback = false;
		
		try
		{
			// Prepare for next phase, increment and save. This state must be updated if the page is
			// instantly changed or refreshed.
			var phase = this.currentPhase;
		    this.currentPhase++;
		    this.saveState();
		    
			// Execute the test. Pass a reference to this test runner as a parameter.
			console.log("Running phase " + phase);
			var phaseResult = testCase.phases[phase](this);
			
			// Check if stopping.
			if (phaseResult === false)
			{
				// Current phase requires that this script is stopped. There are two reasons for
				// this: Loading a new page or waiting for a callback. If the script isn't stopped
				// it will continue to next phase or test too early.
				abortScript = true;
				break;
			}
		}
		catch (err)
		{
			this.handleError(testCase, err);
			
			// Skip all other phases.
			break;
		}
	}
	
	if (abortScript)
	{
		// Check if waiting for a callback.
		if (this.waitingForCallback)
		{
			// Create callback fail-handler that will resume script if callback wasn't called.
			var _testRunner = this;
			var handler = function()
			{
				console.log("Timed out while waiting for callbacks. Resuming testing.");
				
				// Fail test.
				_testRunner.failTest(testCase, "No callbacks called.");
				_testRunner.waitingForCallback = false;
				
				// Resume test runner.
				_testRunner.run();
			}
			
			// TODO: variable for setting custom time.
			console.log("Waiting for callback (max delay: " + this.callbackTimeout + " ms)...");
			this.callbackFailTimer = setTimeout(handler, this.callbackTimeout);
		}
		
		// Stop script (to wait for callbacks or page change).
		return false;
	}
	
	// By this point the test finished (done or failed).
	
	this.currentPhase = 0;
	
	// Execute "after" if available.
	if (typeof this.after === "function")
	{
		this.after();
	}
	
	return new TestResult(testCase.name, this.currentCollection.name, this.suite.name, !testCase.failed, testCase.msg);
}

/**
 * Handles errors (exceptions) thrown from a test case. The test will be marked as failed.
 *
 * @param testCase		Test case the error applies to.
 * @param err			Error message (Error object or a string).
 */
TestRunner.prototype.handleError = function(testCase, err)
{
	testCase.failed = true;
	
	// Assertion failed, get error message.
	if (typeof err === "string")
	{
		testCase.msg = err;
	}
	else if (err instanceof Error)
	{
		// Usually a regular JavaScript exception object with a message.
		testCase.msg = err.name + ': ' + err.message;
	}
	else
	{
		testCase.msg = "No error message (unknown error object type).";
	}
}

/**
 * Marks a test as failed.
 * 
 * @param msg		Error message.
 */
TestRunner.prototype.failTest = function(testCase, msg)
{
	testCase.failed = true;
	testCase.msg = msg;
}

/**
 * Creates a callback handler for the specified callback.
 * 
 * @param callback	Original callback. (Usually declared inline.)
 * 
 * @returns			Callback wrapper function. Refer to this wrapper instead of the original
 * 					callback.
 */
TestRunner.prototype.createCallback = function(callback)
{
	this.waitingForCallback = true;
	var _testRunner = this;
	
	// TODO: support for multiple calls to the same callback.
	
	var handler = function()
	{
	    var test = _testRunner.currentTest;
	    
		if (!_testRunner.waitingForCallback)
		{
		    console.log("Warning: Unexpected callback in test '" + test.name + "'");
		    return;
		};
		
		// Stop fail-timer and reset states.
		clearTimeout(_testRunner.callbackFailTimer);
		_testRunner.callbackFailTimer = null;
		_testRunner.waitingForCallback = false;
		
		// Call function.
		try
		{
			callback.apply(callback, arguments);
		}
		catch (err)
		{
			// Handles assertions and other exceptions.
			_testRunner.handleError(test, err);
		}
		
		// Resume testing (proceed to next phase or test.)
		// TODO: How to avoid big call stack? This is only a problem if a lot of callbacks are
		//		 called within the same test case. Starting a new test will reload the page and
		//		 clear the stack.
		_testRunner.run();
	}
	
	return handler;
}

/**
 * Creates a callback handler that will fail the test if called.
 * 
 * @param msg		Error message displayed in test resutls.
 *
 * @returns			Callback handler (function).
 */
TestRunner.prototype.createErrorCallback = function(msg)
{
	this.waitingForCallback = true;
	var _testRunner = this;
	var _msg = msg;
	
	var handler = function()
	{
		var test = _testRunner.currentTest;
	    
		if (!_testRunner.waitingForCallback)
		{
		    console.log("Warning: Unexpected callback (error) in test '" + test.name + "'");
		    return;
		};
		
		// Stop fail-timer and reset states.
		clearTimeout(_testRunner.callbackFailTimer);
		_testRunner.callbackFailTimer = null;
		_testRunner.waitingForCallback = false;
		
		// Fail test.
		_testRunner.failTest(test, _msg);
		
		// Resume testing (proceed to next phase or test.)
		_testRunner.run();
	}
	
	return handler;
}

/**
 * Creates a callback handler that does nothing but resume testing when called. Useful when used as
 * "success" callbacks where you need to wait for something to complete before continuing.
 *
 * @returns			Callback handler (function).
 */
TestRunner.prototype.createNoOpCallback = function()
{
	this.waitingForCallback = true;
	var _testRunner = this;
	
	var handler = function()
	{
		var test = _testRunner.currentTest;
	    
		if (!_testRunner.waitingForCallback)
		{
		    console.log("Warning: Unexpected callback (no-op) in test '" + test.name + "'");
		    return;
		};
		
		// Stop fail-timer
		clearTimeout(_testRunner.callbackFailTimer);
		_testRunner.callbackFailTimer = null;
		_testRunner.waitingForCallback = false;
		
		// Resume testing (proceed to next phase or test.)
		_testRunner.run();
	}
	
	return handler;
}

/**
 * Loads the test result page.
 */
TestRunner.prototype.showResults = function()
{
	this.loadPage(this.resultPage);
}

/**
 * Builds test results in the element named "results".
 */
TestRunner.prototype.buildResults = function()
{
	// TODO: This method doesn't need to be a part of TestRunner. All results are stored in the
	//		 session storage. Statistics can be calculated when iterating the results.
	
	var element = document.getElementById("results");
	var collection = null;
	var startTable = true;
	var endTable = false;
	var html = "";
	
	// Build status bar.
	var numFailed = this.numExecuted - this.numPassed;
	var failed = numFailed > 0 ? "failedBar" : "passedBar";
	
	html += "<div class='statusBar' id='" + failed + "'></div>";
	
	// Statistics.
	html += "<table class='statsTable'>";
	html += "<tr><td>Test suite:</td><td>" + this.suite.name + "</td></tr>";
	html += "<tr><td>Tests executed:</td><td>" + this.numExecuted + "</td></tr>";
	html += "<tr><td>Tests passed:</td><td>" + this.numPassed + "</td></tr>";
	html += "<tr><td>Tests failed:</td><td>" + numFailed + "</td></tr>";
	html += "</table>";
	
	// Build result tables.
	for (i in this.results)
	{
		var result = this.results[i];
		
		// Check if collection has changed.
		if (collection === null)
		{
			// Initial collection.
			collection = result.collection;
		}
		else if (collection != result.collection)
		{
			// New collection.
			collection = result.collection;
			endTable = true;
			startTable = true;
		}
		
		if (endTable)
		{
			// End previous table.
			html += "</table>";
			endTable = false;
		}
		if (startTable)
		{
			// Start new table.
			html += "<table class='resultTable'><caption>" + result.collection + "</caption>";
			html += "<tr><th class='test'>Test</th><th class='message'>Errors</th>";
			startTable = false;
		}
		
		var passed = result.passed ? "testPassed" : "testFailed";
		html += "<tr class='" + passed + "'>";
		
		html += "<td>" + result.name + "</td>";
		html += "<td>" + result.msg + "</td>";
		
		html += "</tr>";
	}
	
	// End last table.
	if (this.results.length > 0 && !endTable)
	{
		html += "</table>";
	}
	
	// Print JSON string.
	var json = JSON.stringify(this.results);
	html += "<h1>Raw Data</h1><code>" + json + "</code>";
	
	element.innerHTML = html;
}
