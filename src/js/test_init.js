// Test Runner Starter
// Richard Helgeby

/**
 * Initializes tests and and starts Test Runner.
 * 
 * @param testSuite		Test suite to use (TestSuite object).
 * @param alwaysStart	Whether testing should always start (true), or just if
 * 						a test session is active (false). If not always starting
 * 						a call to TestRunnerStarter.run must be done manually.
 * @param showResults	Whether results should be displayed (boolean). This
 * 						parameter is only used by the result page. Regular
 * 						pages don't need to pass this parameter.
 * @param eventFallbackDelay	Optional. Delay before forcing init when waiting
 *								for the "deviceready" event to be triggered by
 *								PhoneGap.
 *@param callbackTimout	Optional. Time to wait for callback before failing the
 *						test. Default is 10 seconds (10000). This does not apply
 *						to tests that don't use callbacks.
 */
function TestRunnerStarter(testSuite, alwaysStart, showResults, eventFallbackDelay, callbackTimeout)
{
	this.runner = null;
	this.deviceReadyFired = false;
	this.displayResults = showResults;
	this.alwaysStart = alwaysStart;
	this.eventFallbackDelay = eventFallbackDelay;
	this.callbackTimeout = callbackTimeout;
	
	// Validate delay.
	if (typeof eventFallbackDelay !== "undefined" && typeof eventFallbackDelay === "number")
	{
		this.eventFallbackDelay = 500;
	}
	else
	{
		throw "Invalid event fallback delay. Must be a number.";
	}
	
	this.testSuite = testSuite;
	this.prepareRunner();
	
	// Start immediately if not using PhoneGap (doesn't need to wait for the
	// deviceready event).
	if (!this.isPhoneGapAvailable())
	{
		this.run();
	}
	else
	{
		// Check if the deviceready event is fired too early (before the script
		// is loaded, this happens sometimes).
		if (this.isPhoneGapReady())
		{
			this.run();
		}
		else
		{
			// Wait for PhoneGap to trigger "deviceready".
			document.addEventListener("deviceready", this.onDeviceReady, true);
			
			// If the deviceready event isn't fired after a certain time, force
			// init.
			setTimeout("eventFallback()", this.eventFallbackDelay);
		}	
	}
}

/**
 * Returns whether PhoneGap is completely initialized. This is done by checking
 * the existence of window.device which is created when PhoneGap is ready.
 */
TestRunnerStarter.prototype.isPhoneGapReady = function()
{
	return typeof window.device !== "undefined";
}

/**
 * Returns whether PhoneGap is available. More precisely, whether the "cordova"
 * object exist.
 * 
 * @returns		True if the "cordova" object exists, false otherwise.
 */
TestRunnerStarter.prototype.isPhoneGapAvailable = function()
{
	return typeof cordova !== "undefined";
}

/**
 * Called when the deviceready event is fired. Starts testing.
 */
TestRunnerStarter.prototype.onDeviceReady = function()
{
	console.log("Event: deviceready");
	
	// Check if already started if the event is late (this flag is set when
	// forcing init after waiting too long).
	if (!this.deviceReadyFired)
	{
		this.deviceReadyFired = true;
		this.run();
	}
}

/**
 * Called if the 'deviceready' event isn't fired before the delay specified in
 * TestRunnerBuilder.build. The event may be delayed or not called at all.
 */
TestRunnerStarter.prototype.eventFallback = function()
{
	if (!this.deviceReadyFired)
	{
		console.log("Timed out while waiting for 'deviceready' event. Resuming...");
		
		// Mark as fired to prevent double call to run method if the event is
		// just delayed.
		this.deviceReadyFired = true;
		
		this.run();
	}
}

/**
 * Creates the TestRunner object.
 */
TestRunnerStarter.prototype.prepareRunner = function()
{
	this.runner = new TestRunner(this.testSuite, "test_results.html", this.callbackTimeout);
	console.log("TestRunner ready on page " + window.location.href);
}

/**
 * Starts testing.
 */
TestRunnerStarter.prototype.run = function()
{
    // Display results if testing is done.
	if (this.displayResults)
	{
		// TODO: Make this part completely independent.
		this.runner.buildResults();
	}
	else
	{
		if (this.alwaysStart)
		{
			// Always start.
			this.runner.run();
		}
		else
		{
			// Only start if there's an active test session.
			this.runner.runIfActive();
		}
	}
}
