const reporter = require('k6-html-reporter');

const options = {
        jsonFile: './result.json',
        output: './',
    };

reporter.generateSummaryReport(options);
    