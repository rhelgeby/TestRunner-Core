function buildTests()
{
	var testCollection = new TestCollection("Main Collection");
	
	testCollection.addTest(new TestCase("example", "index.html",
	[
		function(testRunner)
		{
			// Test code here. The test will fail if any exception is thrown.
		}
	]));
    
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
			
			// Call the callback in two seconds. Note the use of quotes. This code will be executed
			// in another scope, which is why callbackTest wasn't declared with "var".
			setTimeout("callbackTest('test');", 2000);
			
			// If not passing any parameters in the callback, it's also possible to use the
			// function directly.
			//setTimeout(exampleCallback, 2000);
			
			return false;
		},
		function(testRunner)
		{
			console.log("After callback.");
		}
	]));
	
	testSuite = new TestSuite("All tests", [testCollection], beforeTest, afterTest);
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


//---- Init ----

var deviceReadyFired = false;

// Whether we're displaying the results this time.
var displayResults = false;

/**
 * Initialize tests and Test Runner.
 * 
 * @param results	Whether results should be displayed (boolean). This
 * 					parameter is only used by the result page. Regular
 * 					pages don't need to pass this parameter.
 */
function init(results)
{
	displayResults = results;
	
	buildTests();
	prepareRunner();
	
	// Not using PhoneGap now, start immediately.
	run();
	
	// Use this code if using PhoneGap.
	/*if (isPhoneGapReady())
	{
		run();
	}
	else
	{
		// Wait for PhoneGap to load.
		document.addEventListener("deviceready", onDeviceReady, false);
		
		// If the deviceready event isn't fired after a certain time, force init.
		setTimeout("eventFallback()", 500);
	}*/
}

function isPhoneGapReady()
{
	// Sometimes the deviceready event is fired too fast, before the script adds the event
	// listener. By checking existence of window.device we know if it's already fired.
	return typeof window.device !== "undefined";
}

function onDeviceReady()
{
	console.log("Event: deviceready");
	if (!deviceReadyFired)
	{
		deviceReadyFired = true;
		run();
	}
}

function eventFallback()
{
	if (!deviceReadyFired)
	{
		console.log("Timed out while waiting for deviceready event. Resuming...");
		
		// Mark as fired to prevent double call to run method if event is delayed.
		deviceReadyFired = true;
		
		run();
	}
}

function run()
{
    // Display results if testing is done.
	if (displayResults)
	{
		testRunner.buildResults();
	}
	else
	{
		// Use run to always start testing when the page is loaded.
		// Use runIfActive to only start if a test session is already running.
		
		testRunner.run();			    // Automatic.
		//testRunner.runIfActive();	    // Manual start (with start button).
	}
}

function prepareRunner()
{
	testRunner = new TestRunner(testSuite, "test_results.html");
	console.log("TestRunner ready on page " + window.location.href);
}
