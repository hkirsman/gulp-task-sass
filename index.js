'use strict';

var autoprefixer = require('gulp-autoprefixer');
var changed = require('gulp-changed');
var defaultsDeep = require('lodash.defaultsdeep');
// @todo: While the deleting feature is nice, sometimes destination folder can contain other files too.
//var del = require('del');
var filter = require('gulp-filter');
var gulpif = require('gulp-if');
var notifier = require('node-notifier');
var path = require('path');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');

module.exports = function (gulp, gulpConfig) {

  gulpConfig = gulpConfig || {};

  // Merge default config with gulp config.
  var defaultConfig = {
    stylesheets: {
      files : [
        {
          src: './sass/**/*.scss',
          dest: './css'
        }
      ],
      sassOptions: {
        outputStyle: 'expanded'
      },
      autoprefixerOptions: {
        browsers: ['last 2 versions'],
        cascade: false
      },
      notify: {
        title: 'Wunderkraut',
        message: 'SASS compiled.'
      }
    },
    browserSync: false
  };

  var config = defaultsDeep(gulpConfig, defaultConfig);

  // Default watch task.
  gulp.task('sass-watch', function () {
    for (var key in config.stylesheets.files) {
      watch(config.stylesheets.files[key].src)
        .on('change', function(path) {
          gulp.start('sass');
        })
        .on('add', function(path) {
          this.close();
          gulp.start('sass-watch');
        })
        .on('unlink', function(filepath) {
          // @todo: While the deleting feature is nice, sometimes destination folder can contain other files too.
          // del(config.stylesheets.dest);
          gulp.start('sass');
        });
    }
  });

  // SASS with sourcemaps.
  gulp.task('sass', function () {
    for (var key in config.stylesheets.files) {
      gulp.src(config.stylesheets.files[key].src)
        .pipe(sassGlob())
        .pipe(sourcemaps.init())
        // @todo: what does this do?
        //.pipe(changed(config.stylesheets.files[key].dest, {extension: '.css'}))
        // @todo: what does this do?
        //.pipe(filter(function (file) {
        //  return !/^_/.test(path.basename(file.path));
        //}))
        .pipe(sass(config.stylesheets.sassOptions).on('error', sass.logError))
        // @todo: activate in second phase.
        //.pipe(autoprefixer(config.stylesheets.autoprefixerOptions))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.stylesheets.files[key].dest))
        // @todo: fix browsersync.
        //.pipe(gulpif(config.browserSync !== false, config.browserSync.stream({match: "**/*.css"})))
        .on('end', function () {
          notifier.notify({
            title: config.stylesheets.notify.title,
            message: config.stylesheets.notify.message,
            sound: false
          });
        });
    }
  });
  // SASS for production without sourcemaps.
  gulp.task('sass-production', function () {
    for (var key in config.stylesheets.files) {
      gulp.src(path.join(config.basePath, config.stylesheets.src))
        .pipe(sassGlob())
        // @todo: what does this do?
        //.pipe(filter(function (file) {
        //  return !/^_/.test(path.basename(file.path));
        //}))
        .pipe(sass(config.stylesheets.sassOptions).on('error', sass.logError))
        // @todo: activate in second phase.
        // .pipe(autoprefixer(config.stylesheets.autoprefixerOptions))
        .pipe(gulp.dest(config.stylesheets.files[key].dest))
        .on('end', function () {
          notifier.notify({
            title: config.stylesheets.notify.title,
            message: config.stylesheets.notify.message,
            // @todo: add icon?
            //icon: config.notify.successIcon,
            sound: false
          });
        });
    }
  });
};
