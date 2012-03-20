// Test Iterator
// Richard Helgeby

/**
 * Constructs a iterator state object.
 * 
 * This object holds the index of the next element and is suitable for serialization.
 * 
 * @param nextElement		Index of next element.
 * 
 * @constructor
 */
function IteratorState(nextElement)
{
	this.nextElement = nextElement;
}

/**
 * Constructs an element iterator.
 * 
 * @param elements		Array of objects.
 * @param state			(Optional) IteratorState object with initial state.
 */
function ElementIterator(elements, state)
{
	// Validate element array.
	if (!(elements instanceof Array))
	{
		throw "Parameter 'elements' must be an array.";
	}
	
	this.elements = elements;
	this.state = (typeof state === "undefined" ? new IteratorState(0) : state);
}

/**
 * Returns the next element.
 * 
 * @returns		Next element or null if no more elements.
 */
ElementIterator.prototype.next = function()
{
	if (!this.hasNext())
	{
		return null;
	}
	
	var element = this.elements[this.state.nextElement];
	this.state.nextElement++;
	return element;
}

/**
 * Gets the next element without updating the iterator cursor to the next element.
 * 
 * @returns		Next element or null if no more elements.
 */
ElementIterator.prototype.peek = function()
{
	if (!this.hasNext())
	{
		return null;
	}
	
	return this.elements[this.state.nextElement];
}

/**
 * Gets the previous element retrieved, if any. Does not update the iterator cursor.
 * 
 * @returns		Last element or null if none previously retrieved.
 */
ElementIterator.prototype.last = function()
{
	if (this.state.nextElement > 0)
	{
		return this.elements[this.state.nextElement - 1];
	}
	return null;
}

/**
 * Returns whether there are more elements left.
 */
ElementIterator.prototype.hasNext = function()
{
	return this.elements.length - 1 >= this.state.nextElement;
}

/**
 * Gets the current iterator state.
 * 
 * @returns			IteratorState object.
 */
ElementIterator.prototype.getState = function()
{
	return this.state;
}

