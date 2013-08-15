module.exports = function (grunt) {
    var config = {}, build = [];

    var path = {
        src: {
            js:   'src/js',
            sass: 'src/sass',
            ejs:  'src/ejs'
        },
        dist: {
            js:   'js',
            css:  'css',
            html: '',
            img:  'img',
            httpPath: '/'
        },
        examples: {
            js:   'examples/js',
            css:  'examples/css',
            html: 'examples',
            img:  'examples/img',
            httpPath: '/examples/'
        },
        test: 'test',
        namespaces: {
        }
    };

    // basic
    {
        config.pkg =  grunt.file.readJSON('package.json');

        grunt.loadNpmTasks('grunt-contrib-watch');
        config.watch = {};
    }


    // js
    {
        grunt.loadNpmTasks('grunt-auto-deps');
        config.auto_deps = {
            examples: {
                scripts: [
                    // 'FlickPageSlide-example'
                ],
                dest: path.examples.js,
                loadPath: [path.src.js + '/*.js']
            },
            dist: {
                scripts: [
                    // 'FlickPageSlide'
                ],
                dest: path.dist.js,
                loadPath: [path.src.js + '/*.js']
            }
        };

        config.watch.js = {
            files: [path.src.js + '/*.js'],
            tasks: [
                'auto_deps:examples',
                'auto_deps:dist'
            ]
        };

        build.push('auto_deps:examples');
        build.push('auto_deps:dist');
    }


    // css
    {
        grunt.loadNpmTasks('grunt-contrib-compass');

        config.compass =  {
            examples: {
                options: {
                    sassDir: path.src.sass,
                    cssDir: path.examples.css,
                    javascriptsDir: path.examples.js,
                    imagesDir: path.examples.img,
                    httpImagesPath: path.examples.httpPath + path.examples.img,
                    environment: 'development'
                }
            }
        };

        config.watch.css = {
            files: [path.src.sass + '/*.scss', path.src.sass + '/**/*.scss'],
            tasks: ['compass:examples']
        };

        build.push('compass:examples');
    }


    // ejs
    {
        grunt.loadNpmTasks('grunt-simple-ejs');

        config.ejs = {
            examples: {
                template: [path.src.ejs + '/*.ejs'],
                dest: path.examples.html,
                options: 'src/options.examples.yaml'
            }
        };
        build.push('ejs:examples');

        config.watch.ejs = {
            files: [
                path.src.ejs + '/*.ejs',
                path.src.ejs + '/**/*.ejs',
                'src/options.examples.yaml'
            ],
            tasks: ['ejs:examples']
        };
    }
    // 


    // test
    {
        grunt.loadNpmTasks('grunt-mocha-html');
        grunt.loadNpmTasks('grunt-mocha-phantomjs');

        config.mocha_html =  {
            all: {
                src   : [ path.dist.js + '/FlickPageSlide.js' ],
                test  : [ path.test + '/*-test.js' ],
                assert : 'chai'
            }
        };
        build.push('mocha_html');

        config.watch.test = {
            files: [path.test + '/*-test.js'],
            tasks: ['mocha_phantomjs']
        };
        config.watch.js.tasks.push('mocha_html');

        config.mocha_phantomjs =  {
            all: [ path.test + '/*.html' ]
        };

        grunt.registerTask('test', ['mocha_phantomjs']);

    }
    // 


    // server
    {
        grunt.loadNpmTasks('grunt-koko');
        config.koko = {
            examples: {
                openPath: path.examples.html
            },
            dist: {
                openPath: path.dist.html || '/'
            },
            test: {
                openPath: path.test
            }
        };

        grunt.registerTask('server', ['koko:examples']);
    }

    // release
    {
        grunt.loadNpmTasks('grunt-release');

        config.release = {
            options: {
                file: 'bower.json',
                npm: false
            }
        };
    }

    // init
    grunt.initConfig(config);
    grunt.registerTask('build', build);
    grunt.registerTask('default', ['build']);
};