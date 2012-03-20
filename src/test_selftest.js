function buildSelfTests()
{
	var pageTests = new TestCollection("Page tests");
	var assertTests = new TestCollection("Assert tests");
	var emptyCollection = new TestCollection("Empty collection", []);
	
	
	/******************
	 *   PAGE TESTS   *
	 ******************/
	
	// Tests if the first test is executed in the correct page.
	pageTests.addTest(new TestCase("new page in first test", "page2.html",
	[
		function()
		{
			var element = document.getElementById("page2");
			assertNotNull(element, "Element 'page2' not found.");
		}
	]));
	
	pageTests.addTest(new TestCase("switch page", "index.html",
	[
		function()
		{
			// Set new URL.
			window.location.href = "page2.html";
			
			// Abort script to let the page change.
			return false;
		},
		function()
		{
			var element = document.getElementById("page2");
			assertNotNull(element, "Element 'page2' not found.");
		}
	]));
	
	
	/********************
	 *   ASSERT TESTS   *
	 ********************/
	
	assertTests.addTest(new TestCase("do nothing", "index.html",
	[
		function()
		{
			// Do nothing.
		}
	]));
	
	// (testSuite must be global; not using var keyword.)
	selfTestSuite = new TestSuite("All self-tests", [pageTests, assertTests, emptyCollection]);
	//testSuite = new TestSuite("MainSuite", [testCollection, testCollection3]);
	//testSuite = new TestSuite("EmptySuite", [emptyCollection]);
}
