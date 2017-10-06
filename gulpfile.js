var gulp = require('gulp');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var browserSync = require('browser-sync').create();


gulp.task('build', function () {
    spawn('jekyll.bat', ['build', '--watch'], {stdio: 'inherit'});
});

gulp.task('env-prod', function () {
    exec('setx JEKYLL_ENV production');
});

gulp.task('env-dev', function () {
    exec('setx JEKYLL_ENV development');
});

gulp.task('serve', function () {

	browserSync.init({server: {baseDir: '_site/'}});

	gulp.watch('_site/**/*.*').on('change', browserSync.reload);

});


gulp.task('default', ['build','serve']);