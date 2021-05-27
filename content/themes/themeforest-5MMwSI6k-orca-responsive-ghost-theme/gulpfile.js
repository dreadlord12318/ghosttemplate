/*
 *  ECKOTHEMES - GHOST BUILD GULPFILE
 *  v2.2.0
 */

'use strict';


/*
 *  DEPENDENCIES
 */

const gulp = require('gulp');
const _ = require('lodash');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const livereload = require('gulp-livereload');
const zip = require('gulp-zip');
const inject = require('gulp-inject');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const del = require('del');
const gscan = require('gscan');
const chalk = require('chalk');
const through = require('through2');
const fs = require('fs');

/*
 * CONFIG
 */

const pkg = require('./package.json');


/*
 *  STYLES
 */

function stylesClean() {
    return del([
        './**/.DS_Store',
        './assets/css/',
    ]);
}

function stylesScreen() {
    return gulp.src(['./src/sass/screen.scss'])
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename('screen.min.css'))
        .pipe(gulp.dest('assets/css'))
        .pipe(livereload());
}

function stylesCritical() {
    return gulp.src(['./src/sass/critical.scss'])
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename('critical.min.css'))
        .pipe(gulp.dest('assets/css'))
        .pipe(livereload());
}

function stylesInject() {
    return gulp.src('./default.hbs')
        .pipe(inject(gulp.src('./assets/css/critical.min.css', { read: true }), {
            starttag: '/* critical:css */',
            endtag: '/* endinject */',
            transform: (filePath, file) => file.contents.toString(),
        }))
        .pipe(gulp.dest('./'));
}

function styles(done) {
    return gulp.series(
        stylesClean,
        gulp.parallel(stylesScreen, stylesCritical),
        stylesInject,
    )(done);
}


/*
 *  SCRIPTS
 */

function scripts() {
    return gulp.src(['./src/js/polyfill/*.js', './src/js/plugin/*.js', './src/js/theme.js'])
        .pipe(gulpif(['theme.js'], babel({ presets: ['@babel/env'] })))
        .pipe(uglify())
        .pipe(concat('theme.min.js'))
        .pipe(gulp.dest('./assets/js'));
}


/*
 *  SVG
 */

function svg() {
    return gulp.src('./src/svg/*.svg')
        .pipe(svgmin({
            plugins: [
                {
                    removeAttrs: {
                        attrs: '(stroke|fill|stroke-width|stroke-linecap|stroke-linejoin)',
                    },
                },
            ],
        }))
        .pipe(svgSprite({
            mode: {
                symbol: true,
            },
        }))
        .pipe(rename('icons.svg'))
        .pipe(gulp.dest('./assets/svg/'))
        .pipe(livereload());
}


/*
 *  FONTS
 */

function fonts() {
    return gulp.src(['./src/font/**/*'])
        .pipe(gulp.dest('./assets/font/'));
}


/*
 *  IMAGES
 */

function images() {
    return gulp.src(['./src/img/**/*'])
        .pipe(gulp.dest('./assets/img/'));
}


/*
 *  LOCALIZATION
 */

function localization() {
    const translationStrings = [];
    return gulp.src(['./**/*.hbs'])
        .pipe(through.obj((file, enc, cb) => {
            const regex = /{{t "([^"\r\n]*)"/gm;
            if (file.isBuffer()) {
                const fileContents = file.contents.toString();
                const localizationHandlebarMatches = fileContents.matchAll(regex);
                // eslint-disable-next-line
                for (const localizationHandlebarMatch of localizationHandlebarMatches) {
                    const currentMatch = localizationHandlebarMatch[1];
                    translationStrings.push(currentMatch);
                }
            }
            cb(null, file);
        }))
        .on('end', () => {
            const localizationCollection = {};
            const uniqueTranslationStrings = _.uniq(translationStrings);
            uniqueTranslationStrings.forEach((uniqueTranslationString) => {
                localizationCollection[uniqueTranslationString] = '';
            });
            fs.writeFileSync('./locales/en.json', JSON.stringify(localizationCollection, null, 4));
        });
}


/*
 *  GSCAN
 */

function gscanCheck(done) {
    const levels = {
        error: chalk.red,
        warning: chalk.yellow,
        recommendation: chalk.yellow,
        feature: chalk.green,
    };
    function outputResult(result) {
        console.warn('-', levels[result.level](result.level), result.rule);
    }
    function outputResults(results) {
        const theme = gscan.format(results);
        console.warn(chalk.bold.underline('\nRule Report:'));
        if (!_.isEmpty(theme.results.error)) {
            console.warn(chalk.red.bold.underline('\n! Must fix:'));
            _.each(theme.results.error, outputResult);
        }
        if (!_.isEmpty(theme.results.warning)) {
            console.warn(chalk.yellow.bold.underline('\n! Should fix:'));
            _.each(theme.results.warning, outputResult);
        }
        if (!_.isEmpty(theme.results.recommendation)) {
            console.warn(chalk.red.yellow.underline('\n? Consider fixing:'));
            _.each(theme.results.recommendation, outputResult);
        }
        if (!_.isEmpty(theme.results.pass)) {
            console.warn(chalk.green.bold.underline('\n\u2713', theme.results.pass.length, 'Passed Rules'));
        }
        done();
    }
    gscan.checkZip({
        path: `./dist/${pkg.name}.zip`,
        name: pkg.name,
    }).then(outputResults);
}


/*
 *  BUILD
 */

function buildCleanBefore() {
    return del([
        './.DS_Store',
        './**/.DS_Store',
        'dist',
    ]);
}

function buildCleanAfter() {
    return del([
        './.DS_Store',
        './**/.DS_Store',
        'build',
    ]);
}

function buildOther() {
    return gulp.src('./other/**')
        .pipe(gulp.dest('./build/'));
}

function buildThemeMove() {
    return gulp.src(['./**', '!./dist', '!./dist/**', '!./build', '!./build/**', '!./other', '!./other/**', '!./node_modules', '!./node_modules/**', '!./.git/', '!./.git/**', '!./gitignore'])
        .pipe(gulp.dest(`./build/theme/${pkg.name}`));
}

function buildThemeZip() {
    return gulp.src('./build/theme/**')
        .pipe(zip(`${pkg.name}.zip`))
        .pipe(gulp.dest('./build/theme/'));
}

function buildPack() {
    return gulp.src('./build/**')
        .pipe(zip(`${pkg.name}.zip`))
        .pipe(gulp.dest('dist'));
}

function build(done) {
    return gulp.series(
        gulp.parallel(styles, scripts, svg, fonts, images),
        localization,
        buildCleanBefore,
        buildOther,
        buildThemeMove,
        buildThemeZip,
        buildPack,
        buildCleanAfter,
        gscanCheck,
    )(done);
}


/*
 *  WATCH
 */

function watch() {
    livereload.listen();
    gulp.watch('./src/sass/**/*.scss', styles);
    gulp.watch('./src/js/*.js', scripts);
    gulp.watch('./src/svg/*.svg', svg);
    gulp.watch('./src/font/**/*', fonts);
    gulp.watch('./src/images/**/*', images);
    gulp.watch(['./**/*.hbs']).on('change', livereload.changed);
    gulp.watch(['*']).on('change', livereload.changed);
}


/*
 *  EXPORT
 */

exports.build = build;
exports.gscanCheck = gscanCheck;
exports.watch = watch;
exports.localization = localization;


/*
 *  DEFAULT
 */

exports.default = gulp.series(
    gulp.parallel(styles, scripts, svg, fonts, images),
    watch,
);
