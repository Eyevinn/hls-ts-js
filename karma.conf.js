var istanbul = require("browserify-istanbul");

module.exports = function (config) {
  var configuration = {
    basePath: '',
    frameworks: ['browserify', 'jasmine-jquery', 'jasmine'],
    browserify: {
      debug: true,
      transform: [
        ['babelify', {plugins: ['babel-plugin-espower']}],
        istanbul({
          ignore: ["test/**", "**/node_modules/**"],
          instrumenterConfig: {
            embedSource: true
          }
        })
      ],
    },
    reporters: ['progress', 'coverage'],
    preprocessors: {
      'index.js': ['browserify', 'coverage'],
      'lib/**/*.js': ['browserify', 'coverage'],
      'test/**/*.js': ['browserify'],
    },
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'test/**/*_unit.js',
      { pattern: 'test/support/testassets/*.ts',
        watched: true,
        served: true,
        included: false
      }
    ],
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity,
    logLevel: config.LOG_INFO,
    browserNoActivityTimeout: 5 * 60 * 1000,
    customLaunchers: {
        Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
        }
    },
    coverageReporter: {
      dir: "coverage/",
      reporters: [
        { type: "text-summary" },
        { type: "html", subdir: "./" },
        { type: "lcovonly", subdir: "./" }
      ]
    }
  };
  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }
  config.set(configuration);
};
