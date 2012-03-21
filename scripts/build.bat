@echo off

set VERSION=1.0.0
set FILE=testrunner-%VERSION%.js

set SRC=..\src
set DEST=..\build
set DEST_FILE=%DEST%\js\%FILE%

if not exist "%DEST\js" (
	mkdir %DEST%\js
)

type %SRC%\js\assert.js > %DEST_FILE%
type %SRC%\js\test_iterator.js >> %DEST_FILE%
type %SRC%\js\test_runner.js >> %DEST_FILE%

copy %SRC%\js\test_main.js %DEST%\js
copy %SRC%\test_results.html %DEST%
copy %SRC%\testrunner.css %DEST%
copy %SRC%\index.html %DEST%

echo Test runner files written to %DEST_FILE%

