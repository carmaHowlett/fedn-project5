// include gulp
var gulp = require('gulp'); 
 
// include plug-ins
var concat = require('gulp-concat');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var changed = require('gulp-changed');
 
// CSS concat, auto-prefix and minify
gulp.task('styles', function() {
  gulp.src(['./src/css/*.css'])
    .pipe(concat('style.css'))
    .pipe(autoprefix('last 2 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/css/'));
});
