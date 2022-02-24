const rollup = require('@rollup/stream');
const babel = require('@rollup/plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const project_folder = 'dist';
const source_folder = 'src';

const fs = require('fs');

let cache;

const path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/',
    },
    src: {
        html: source_folder + '/*.html',
        css: source_folder + '/styles/*.scss',
        js: source_folder + '/js/app.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,jpeg}',
        fonts: source_folder + '/fonts/**/*.ttf',
        json: source_folder + '/js/map/**/*.json',
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/styles/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/',
        json: source_folder + '/js/map/*.json',
    },
    clean: './' + project_folder + '/'
}

const {src, dest} = require('gulp'),
    gulp = require('gulp'),
    ghPages = require('gulp-gh-pages'),
    browsersync = require('browser-sync').create(),
    del = require('del'),
    scss = require('gulp-sass')(require('sass')),
    fileinclude = require('gulp-file-include'),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2');

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify: false,
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function json() {
    return src(path.src.json).pipe(dest(path.build.html))
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded'
            })
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
            })
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return rollup({
        input: path.src.js,
        plugins: [babel, commonjs(), nodeResolve({preferBuiltins: false})],
        sourcemap: true,
        cache: cache,
        output: {
            format: 'iife',
            sourcemap: true
        },
        format: 'iife',
    }).on('bundle', function (bundle) {
        cache = bundle;
    })
        .pipe(source('main.js'))
        .pipe(buffer())

        // The use of sourcemaps here might not be necessary,
        // Gulp 4 has some native sourcemap support built in
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('.'))

        // Where to send the output file
        .pipe(gulp.dest(path.build.js))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.img)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                interlaced: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts(params) {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.json], json);
    gulp.watch([path.watch.img], images); // ([way], function)
}

function clean(params) {
    return del(path.clean);
}

gulp.task('deploy', function () {
    return gulp.src('./dist/**/*')
      .pipe(ghPages());
});

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts, json));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.json = json;
exports.build = build;
exports.watch = watch;
exports.default = watch;
