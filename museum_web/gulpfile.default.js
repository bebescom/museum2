var gulp = require('gulp'),
    lib = require('./lib'),
    path = require('path'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),           //重命名
    concat = require('gulp-concat'),          //合并文件
    clean = require('gulp-clean'),             //清空文件夹
    cleanCSS = require('gulp-clean-css');    //css压缩

var dest_path = './dist/';//输出目录

lib.set('version', "2.2.03");
lib.set('root', __dirname + "/src/");
lib.set('api_url', "http://192.168.8.11/museum_develop/base_api");//api地址,prod才启用,强制使用API大写进行替换
lib.set('test_url', (__dirname.indexOf('www') > -1 ? __dirname.split('www')[1] : '/').replace(/\\/g, '/') + '/test/');//test/*.json地址, "/museum_base/web/test"

//生产环境，产出，需指定api地址
gulp.task('prod', function () {
    lib.set('prod', true);
    gulp.start('default');
});
gulp.task('min', function () {
    lib.set('min', true);
    gulp.start('default');
});

////////////////////////////////////////////

// css处理
gulp.task('css', function () {

    gulp.src('./src/**/*.css')
        .pipe(lib.build())
        //.pipe(gulp.dest(cssDst))
        //.pipe(rename({ suffix: '.min' }))
        //.pipe(cleanCSS())
        .pipe(gulp.dest(dest_path));
});

// js处理
gulp.task('js', function () {
    return gulp.src('./src/**/*.js')
        .pipe(lib.build({isMod: true}))
        .pipe(gulp.dest(dest_path));
});
// lib js处理
gulp.task('js_libs', function () {
    gulp.src('./js/**/*')
        .pipe(gulp.dest(dest_path + 'js/'));
});

// HTML处理
gulp.task('html', ['js'], function () {
    return gulp.src('./src/**/*.{vue,htm,html}')
        .pipe(lib.build())
        .pipe(gulp.dest(dest_path));
});

// 图片处理
gulp.task('images', function () {
    gulp.src('./src/**/*.{png,jpg,gif,ico}')
        .pipe(gulp.dest(dest_path));
});

// 删除文件夹
gulp.task('clean', function () {
    return gulp.src(dest_path, {read: false})
        .pipe(clean({force: true}));
});

gulp.task('copy',function(){
    gulp.src('./src/.htaccess')
        .pipe(gulp.dest(dest_path));
});

// 默认任务 清空图片、样式、js并重建 运行语句 gulp
gulp.task('default', ['clean'], function () {
    gulp.start('js_libs', 'css', 'images', 'js', 'html','copy');
});

// 监听任务 运行语句 gulp watch
gulp.task('watch', function () {
    gulp.start('default');
    // 监听html,js
    gulp.watch('./src/**/*.{vue,htm,html,js}', function () {
        gulp.start('js', 'html');
    });
    // 监听css
    gulp.watch('./src/**/*.css', function () {
        gulp.start('css');
    });
    // 监听images
    gulp.watch('./src/**/*.{png,jpg,gif}', function () {
        gulp.start('images');
    });
    // 监听js_libs
    gulp.watch('./js/**/*', function () {
        gulp.start('js_libs');
    });
});