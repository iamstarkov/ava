'use strict';
var prettyMs = require('pretty-ms');
var figures = require('figures');
var plur = require('plur');
var colors = require('../colors');

Object.keys(colors).forEach(function (key) {
	colors[key].enabled = true;
});

function VerboseReporter() {
	if (!(this instanceof VerboseReporter)) {
		return new VerboseReporter();
	}
}

module.exports = VerboseReporter;

VerboseReporter.prototype.start = function () {
	return '';
};

VerboseReporter.prototype.test = function (test, runStatus) {
	if (test.error) {
		return '  ' + colors.error(figures.cross) + ' ' + test.title + ' ' + colors.error(test.error.message);
	}

	if (test.todo) {
		return '  ' + colors.todo('- ' + test.title);
	} else if (test.skip) {
		return '  ' + colors.skip('- ' + test.title);
	}

	if (runStatus.fileCount === 1 && runStatus.testCount === 1 && test.title === '[anonymous]') {
		return undefined;
	}

	// display duration only over a threshold
	var threshold = 100;
	var duration = test.duration > threshold ? colors.duration(' (' + prettyMs(test.duration) + ')') : '';

	return '  ' + colors.pass(figures.tick) + ' ' + test.title + duration;
};

VerboseReporter.prototype.unhandledError = function (err) {
	if (err.type === 'exception' && err.name === 'AvaError') {
		return colors.error('  ' + figures.cross + ' ' + err.message);
	}

	var types = {
		rejection: 'Unhandled Rejection',
		exception: 'Uncaught Exception'
	};

	var output = colors.error(types[err.type] + ':', err.file) + '\n';

	if (err.stack) {
		output += '  ' + colors.stack(err.stack) + '\n';
	} else {
		output += '  ' + colors.stack(JSON.stringify(err)) + '\n';
	}

	output += '\n';

	return output;
};

VerboseReporter.prototype.finish = function (runStatus) {
	var output = '\n';

	if (runStatus.failCount > 0) {
		output += '  ' + colors.error(runStatus.failCount, plur('test', runStatus.failCount), 'failed') + '\n';
	} else {
		output += '  ' + colors.pass(runStatus.passCount, plur('test', runStatus.passCount), 'passed') + '\n';
	}

	if (runStatus.skipCount > 0) {
		output += '  ' + colors.skip(runStatus.skipCount, plur('test', runStatus.skipCount), 'skipped') + '\n';
	}

	if (runStatus.todoCount > 0) {
		output += '  ' + colors.todo(runStatus.todoCount, plur('test', runStatus.todoCount), 'todo') + '\n';
	}

	if (runStatus.rejectionCount > 0) {
		output += '  ' + colors.error(runStatus.rejectionCount, 'unhandled', plur('rejection', runStatus.rejectionCount)) + '\n';
	}

	if (runStatus.exceptionCount > 0) {
		output += '  ' + colors.error(runStatus.exceptionCount, 'uncaught', plur('exception', runStatus.exceptionCount)) + '\n';
	}

	if (runStatus.failCount > 0) {
		output += '\n';

		var i = 0;

		runStatus.tests.forEach(function (test) {
			if (!(test.error && test.error.message)) {
				return;
			}

			i++;

			output += '  ' + colors.error(i + '.', test.title) + '\n';
			output += '  ' + colors.stack(test.error.stack) + '\n';
		});
	}

	return output;
};

VerboseReporter.prototype.write = function (str) {
	console.error(str);
};

VerboseReporter.prototype.stdout = VerboseReporter.prototype.stderr = function (data) {
	process.stderr.write(data);
};
