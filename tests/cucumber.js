module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: [
      'steps/**/*.js',
      'support/**/*.js',
    ],

    format: [
      'progress',
      'summary',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
    ],
  },
};
