'use strict';

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    del = require('del'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    server = require('browser-sync'),
    notify = require('gulp-notify'),
    runSequence = require('run-sequence'),
    path = require('path'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    assets = require('postcss-assets'),
    mqpacker = require('css-mqpacker'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    cache = require('gulp-cache'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    spritesmith = require('gulp.spritesmith-multi'),
    assets = require('gulp-asset-hash');
    // gulpIf = require('gulp-if')

var buildPath = 'build';
var srcPath = 'src';

/*
  --- JS ---
*/

gulp.task('js', function() {
  gulp.src([
    // Должно падать если файла нет
    '../../node_modules/jquery/dist/jquery.js',
    'lib/**',
    'modules/**',
    'app.js'
  ], {cwd: path.join(srcPath, 'js')})
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(concat('script.js'))
    .pipe(gulp.dest(path.join(buildPath, 'js')))
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest(path.join(buildPath, 'js')));
});

/*
  --- IMG ---
*/

gulp.task('img', function() {
  gulp.src(['!sprites', '!sprites/**', '**/*.{jpg,png,svg}'], {cwd: path.join(srcPath, 'img')})
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
    .pipe(gulp.dest(path.join(buildPath, 'img')))
});


// gulp.task('clearcache', function () { return cache.clearAll(); });

/*
  --- SPRITES ---
*/

var spritesDirPath = 'src/img/sprites';
var imgPath = '../img/sprites/';
var cssTemplate = 'scss_retina.template.handlebars';

gulp.task('sprites', function() {
  var spriteData = gulp.src(['src/img/sprites/**/*.png', '!src/img/sprites/*.png'])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(spritesmith({
      spritesmith(options) {
        options.imgPath = imgPath + options.imgName;
        options.retinaImgPath = imgPath + options.retinaImgName;
        options.cssName = options.cssName.replace(/\.css$/, '.scss');
        options.cssFormat = 'scss';
        options.cssTemplate = cssTemplate;
        options.algorithm = 'binary-tree';
        options.padding = 8;

        return options;
      }
    }));

  spriteData.img.pipe(gulp.dest(path.join(buildPath, 'img/sprites')));
  spriteData.css.pipe(gulp.dest('src/sass/global/sprites'));
});

/*
  --- FONT ---
*/

gulp.task('font', function() {
  gulp.src('**/*{woff,woff2,ttf}', {cwd: path.join(srcPath, 'fonts')})
    .pipe(gulp.dest(path.join(buildPath, 'fonts')))
});

/*
  --- HTML ---
*/

gulp.task('html', function() {
  gulp.src('*.html', {cwd: path.join(srcPath)})
    .pipe(gulp.dest(path.join(buildPath)));
});

/*
  --- STYLE ---
*/

gulp.task('style', function() {
  gulp.src('style.sass', {cwd: path.join(srcPath, 'sass')})
    .pipe(plumber({
      errorHandler: notify.onError('Error:  <%= error.message %>')
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      mqpacker,
      autoprefixer({
        browsers: [
          'last 4 version',
          'last 4 Chrome versions',
          'last 4 Firefox versions',
          'last 4 Opera versions',
          'last 4 Edge versions'
        ]
      }),
      // Проверить
      assets({
        loadPaths: [path.join(srcPath, 'img')]
      }),
      cssnano({
        safe: true
      })
    ]))
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.join(buildPath, 'css')))
    .pipe(server.stream({match: '**/*.css'}));
});

/*
  --- DEL ---
*/

gulp.task('del', function() {
  return del([path.join(buildPath)]);
});

/*
  --- SERVE ---
*/

gulp.task('serve', function() {
  server.init({
    server: {
      baseDir: buildPath
    },
    notify: true,
    open: false,
    ui: false
  });
});

/*
  --- BUILD ---
*/

gulp.task('build', ['del'], function (callback) {
  runSequence(
    'sprites',
    'img',
    ['js', 'font'],
    'style',
    'html',
    callback)
});

/*
  --- DEFAULT ---
*/

var allTasks = ['build'];
allTasks.push('serve');

gulp.task('default', allTasks, function() {
  gulp.watch('**/*.js', {cwd: path.join(srcPath, 'js')}, ['js', server.reload]);
  gulp.watch('sprites/**/*.{jpg,png}', {cwd: path.join(srcPath, 'img')}, ['sprites', server.reload]);
  gulp.watch(['**/*.{jpg,png,svg}'], {cwd: path.join(srcPath, 'img')}, ['img', server.reload]);
  gulp.watch('**/*{ttf,woff,woff2}', {cwd: path.join(srcPath, 'fonts')}, ['font', server.reload]);
  gulp.watch('**/*.{sass,scss}', {cwd: path.join(srcPath, 'sass')}, ['style', server.stream]);
  gulp.watch('**/*.html', {cwd: path.join(srcPath)}, ['html', server.reload]);
});
