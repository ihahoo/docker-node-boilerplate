const gulp = require('gulp');
const uglify = require('gulp-uglify');
const pump = require('pump');

gulp.task('compress', function (cb) {
  pump([
    gulp.src('lib/*.js'),
    uglify(),
    gulp.dest('lib')
  ], cb);
});
