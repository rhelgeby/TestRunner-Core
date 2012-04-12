#!/bin/bash

VERSION="1.0.0"
FILE="testrunner-$VERSION.js"

# Source and destination folders, relative to the scripts folder.
SRC=../src
DEST=../build
DEST_FILE=$DEST/js/$FILE

mkdir -p $DEST
mkdir -p $DEST/js

cat $SRC/js/assert.js > $DEST_FILE
cat $SRC/js/test_iterator.js >> $DEST_FILE
cat $SRC/js/test_runner.js >> $DEST_FILE
cat $SRC/js/test_init.js >> $DEST_FILE

cp $SRC/js/test_main.js $DEST/js/
cp $SRC/test_results.html $DEST
cp $SRC/testrunner.css $DEST
cp $SRC/index.html $DEST

echo "Test Runner files written to $DEST"
