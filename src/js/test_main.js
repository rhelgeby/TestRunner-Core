/**
 * This function should be called when the page is loaded (onload event). 
 */
function initTesting()
{
	new TestRunnerStarter(
			buildTests(),	// testSuite
			true,			// alwaysStart
			false,			// showResults
			150);			// eventFallbackDelay
			//10000);		// callbackTimeout (optional, defaults to 10 seconds.)
}

/**
 * This function is only used by the test result page.
 */
function initTestResults()
{
	// TODO: Make this part independent of Test Runner so it doesn't have to
	//		 build tests that are never used.
	
	new TestRunnerStarter(
			buildTests(),	// testSuite
			false,			// alwaysStart
			true,			// showResults
			150);			// eventFallbackDelay
			//10000);		// callbackTimeout (optional, defaults to 10 seconds.)
}

/**
 * Called when tests should be built.
 * 
 * @returns		Test suite to use.
 */
function buildTests()
{
	// You may use multiple scripts to organize test code. Make a function in
	// them that will return a test suite or collections.
	
	// All test cases must be stored in a collection.
	var testCollection = new TestCollection("Main Collection");
	
	// Add a test case to a collection like this. Check the documentation about
	// the TestCase object for details.
	testCollection.addTest(new TestCase("Example test", "index.html",
	[
		function(testRunner)
		{
			// Test code here. The test will fail if any exception is thrown.
		}/*,
		function()
		{
			// Second phase. This is optional. There's no limit on number of
			// test phases. Check the technical documentation about phases and 
			// callbacks.
		}*/
	]));
    
	// Example of asynchronous testing with a timer that waits for two seconds.
	testCollection.addTest(new TestCase("callback example", "index.html",
	[
		function(testRunner)
		{
			// Create a callback wrapper.
			callbackTest = testRunner.createCallback(function(msg)
			{
				console.log("Message in callback: " + msg);
			});
			
			var noop = testRunner.createNoOpCallback();
			
			console.log("Callback will be called in 2 sec...");
			
			// Call the callback in two seconds. Note the use of quotes. This
			// code will be executed in another scope, which is why
			// callbackTest wasn't declared with "var".
			setTimeout("callbackTest('test');", 2000);
			
			// If not passing any parameters in the callback, it's also
			// possible to use the function directly.
			//setTimeout(exampleCallback, 2000);
			
			return false;
		},
		function(testRunner)
		{
			console.log("After callback.");
		}
	]));
	
	return new TestSuite("All tests", [testCollection], beforeTest, afterTest);
}

// Called before every test.
function beforeTest()
{
	console.log("'before' executed");
}

// Called after every test.
function afterTest()
{
	console.log("'after' executed");
}
