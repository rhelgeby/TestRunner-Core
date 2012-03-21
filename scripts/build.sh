#!/bin/bash

VERSION="1.0.0"
FILE="testrunner-$VERSION.js"

# Source and destination folders.
SRC=src
DEST=build
DEST_FILE=$DEST/$FILE

mkdir -p $DEST

cat $SRC/assert.js > $DEST_FILE
cat $SRC/test_iterator.js >> $DEST_FILE
cat $SRC/test_runner.js >> $DEST_FILE

echo "Test Runner files written to $DEST_FILE"
