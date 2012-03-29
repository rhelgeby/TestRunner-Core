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


// ---- Init ----

// Hook deviceready event in PhoneGap. Native features in PhoneGap cannot be
// used before this event is fired.
document.addEventListener("deviceready", onDeviceReady, true);
var deviceReadyFired = false;

// Whether we're displaying the results this time.
var displayResults = false;

function init(results)
{
	displayResults = results;
	
	buildTests();
	prepareRunner();
	
	// If the deviceready event isn't fired after a certain time, force init.
	// We don't know why it isn't always fired, but PhoneGap works after a
	// certain time. You may experiment with this value. 150ms is safe, but
	// shorter delays may work fine too.
	// Note: This delay is added between _each_ test. It could also be used to
	//       slow down testing speed.
	setTimeout(eventFallback, 150);
}

function onDeviceReady()
{
	if (!deviceReadyFired)
	{
		deviceReadyFired = true;
		console.log("DeviceReady fired...");
		run();
	}
}

function eventFallback()
{
	if (!deviceReadyFired)
	{
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
		testRunner.run();			    // Automatic.
		//testRunner.runIfActive();	    // Manual start.
	}
}

function prepareRunner()
{
	var suite = testSuite;
	
	testRunner = new TestRunner(suite, "test_results.html");
	console.log("TestRunner ready on page " + window.location.href);
}
