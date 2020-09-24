const project_folder = 'shelter';
const source_folder = 'src';

const fs = require('fs');

const path = {
   build: {
      html: project_folder + '/',
      css: project_folder + '/assets/css/',
      js: project_folder + '/assets/js/',
      img: project_folder + '/assets/img/',
      fonts: project_folder + '/assets/fonts/',
      lib: project_folder + '/assets/lib/'
   },
   src: {
      pug: source_folder + '/index.pug',
      normalize: source_folder + '/scss/normalize.scss',
      css: source_folder + '/scss/style.scss',
      js: source_folder + '/js/**/*.js',
      img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
      fonts: source_folder + '/fonts/*.ttf',
      lib: source_folder + '/lib/*.js'
   },
   watch: {
      pug: source_folder + '/**/*.pug',
      normalize: source_folder + '/scss/normalize.scss',
      css: source_folder + '/scss/**/*.scss',
      js: source_folder + '/js/**/*.js',
      img: source_folder + '/img/**/*.{jpg, png, svg, gif, ico, webp}'
   },
   clean: './' + project_folder + '/'
}

let { src, dest } = require('gulp'),
   gulp = require('gulp'),
   browsersync = require('browser-sync').create(),
   fileinclude = require('gulp-file-include'),
   pug = require('gulp-pug'),
   htmlbeautify = require('gulp-html-beautify'),
   htmlmin = require('gulp-htmlmin'),
   del = require('del'),
   scss = require('gulp-sass'),
   autoprefexir = require('gulp-autoprefixer'),
   group_media = require('gulp-group-css-media-queries'),
   clean_css = require('gulp-clean-css'),
   rename = require('gulp-rename'),
   uglify = require('gulp-uglify-es').default,
   imagemin = require('gulp-imagemin'),
   webp = require('gulp-webp'),
   webpcss = require('gulp-webp-css'),
   svgsprite = require('gulp-svg-sprite'),
   ttf2woff = require('gulp-ttf2woff'),
   ttf2woff2 = require('gulp-ttf2woff2'),
   fonter = require('gulp-fonter');


function browserSync(params) {
   browsersync.init({
      server: {
         baseDir: path.clean
      },
      port: 3000,
      notify: false
   })
}

function pughtml() {
   return src(path.src.pug)
      .pipe(pug())
      .pipe(htmlbeautify({
         indentSize: 2
      }))
      .pipe(dest(path.build.html))
      .pipe(
         rename({
            extname: '.min.html'
         })
      )
      .pipe(htmlmin({
         collapseWhitespace: true
      }))
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
}

function css() {
   return src(path.src.css)
      .pipe(scss({
         outputStyle: 'expanded'
      }))
      .pipe(
         group_media()
      )
      .pipe(
         autoprefexir({
            overrideBrowserslist: ['last 2 versions'],
            cascade: true
         })
      )
      .pipe(webpcss())
      .pipe(dest(path.build.css))
      .pipe(clean_css())
      .pipe(
         rename({
            extname: '.min.css'
         })
      )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
}

function normalize() {
   return src(path.src.normalize)
      .pipe(scss({
         outputStyle: 'expanded'
      }))
      .pipe(
         autoprefexir({
            overrideBrowserslist: ['last 2 versions'],
            cascade: true
         })
      )
      .pipe(dest(path.build.css))
      .pipe(clean_css())
      .pipe(
         rename({
            extname: '.min.css'
         })
      )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
}

function js() {
   return src(path.src.js)
      .pipe(fileinclude())
      .pipe(dest(path.build.js))
      .pipe(
         uglify()
      )
      .pipe(
         rename({
            extname: '.min.js'
         })
      )
      .pipe(dest(path.build.js))
      .pipe(browsersync.stream())
}

function images() {
   return src(path.src.img)
      // .pipe(
      //    webp({
      //       quality: 70
      //    })
      // )
      // .pipe(dest(path.build.img))
      // .pipe(src(path.src.img))
      .pipe(
         imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3
         })
      )
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
}

function fonts() {
   src(path.src.fonts)
      .pipe(ttf2woff())
      .pipe(dest(path.build.fonts))
   return src(path.src.fonts)
      .pipe(ttf2woff2())
      .pipe(dest(path.build.fonts))
}

gulp.task('otf2ttf', () => {
   return src([source_folder + '/fonts/*.otf'])
      .pipe(fonter({
         formats: ['ttf']
      }))
      .pipe(dest(source_folder + '/fonts/'))
});

gulp.task('svgSprite', () => {
   return gulp.src([source_folder + '/iconsprite/*.svg'])
      .pipe(svgsprite({
         mode: {
            stack: {
               sprite: '../icons/icons.svg',
               example: true
            }
         }
      }))
      .pipe(dest(path.build.img));
});

gulp.task('lib', () => {
   return src(path.src.lib)
      .pipe(dest(path.build.lib))
});


function cb() {

}

function watchFiles() {
   gulp.watch([path.watch.pug], pughtml);
   gulp.watch([path.watch.normalize], normalize);
   gulp.watch([path.watch.css], css);
   gulp.watch([path.watch.js], js);
   gulp.watch([path.watch.img], images);
}

function clean(params) {
   return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, normalize, css, pughtml, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.imagemin = images;
exports.js = js;
exports.normalize = normalize;
exports.css = css;
exports.pughtml = pughtml;
exports.build = build;
exports.watch = watch;
exports.default = watch;