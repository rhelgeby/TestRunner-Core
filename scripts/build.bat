@echo off

set VERSION=1.0.0
set FILE=testrunner-%VERSION%.js

set SRC=..\src\js
set DEST=..\build
set DEST_FILE=%DEST%\%FILE%

if not exist "%DEST%" (
	mkdir %DEST%
)


type %SRC%\assert.js > %DEST_FILE%
type %SRC%\test_iterator.js >> %DEST_FILE%
type %SRC%\test_runner.js >> %DEST_FILE%

echo Test runner files written to %DEST_FILE%

