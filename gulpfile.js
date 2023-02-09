import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import rename from 'gulp-rename';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import { stacksvg } from 'gulp-stacksvg';
import { deleteAsync } from 'del';

// Styles
export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe (rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML
const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({collapseWhitespace:false}))
  .pipe(gulp.dest('build'));
}

//Scripts
const scripts = () => {
  return gulp.src('source/js/*.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'))
}

//Images
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

//Copy
const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(gulp.dest('build/img'))
}

//Webp
const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(squoosh({
    webp:{}
  }))
  .pipe(gulp.dest('build/img'))
}

//Svg
const svg = () => {
  return gulp.src('source/img/*.svg')
  .pipe(svgo())
  .pipe(gulp.dest('build/img'))
}

//Stack-svg
const stack = () => {
  return gulp.src('source/img/svg/*.svg')
  .pipe(svgo())
  .pipe(stacksvg({inlineSvg:true}))
  .pipe(rename('stack.svg'))
  .pipe(gulp.dest('build/img/svg'))
}

//Copy
const copy = (done) => {
  gulp.src(['source/fonts/*.{woff2,woff}',
  'source/*.ico',
  'source/*.webmanifest'
], {
  base:'source'
})
.pipe(gulp.dest('build'))
done();
}

//Clean
const clean = () => {
  return  deleteAsync('build');
};

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload
const reload = (done) => {
  browser.reload();
  done();
  }

// Watcher
const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

//Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    stack,
    createWebp
    ),
);

//Default
export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    stack,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
