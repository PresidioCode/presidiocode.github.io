module.exports = function( grunt ) {
    // load time-grunt and all grunt plugins found in the package.json
    require( 'time-grunt' )( grunt );
    require( 'load-grunt-tasks' )( grunt );

    grunt.initConfig({

        //variables
        site_name: 'presidio-git-io',

        //copy files
        copy: {
            npm: {
                files: [

                //bootstrap less
                {expand: true, cwd: 'node_modules/bootstrap/less/', src: ['**'], dest: '_less/'},

                //bootstap js
                {expand: true, cwd: 'node_modules/bootstrap/dist/js', src: ['bootstrap.js'], dest: '_js/'},

                //bootstap fonts
                {expand: true, cwd: 'node_modules/bootstrap/fonts', src: ['**'], dest: 'fonts/'},

                //jquery js
                {expand: true, cwd: 'node_modules/jquery/dist', src: ['jquery.js'], dest: '_js/'},

                //font awesome
                {expand: true, cwd: 'node_modules/font-awesome/fonts', src: ['**'], dest: 'fonts/'},
                {expand: true, cwd: 'node_modules/font-awesome/css', src: ['font-awesome.css'], dest: '_css/'},

                ],
            },
        },

        //compile less to css
        less : {
            all: {
               files: {
                "_css/bootstrap.css": "_less/bootstrap.less",
                "_css/<%= site_name %>.less.css": "_assets/**/*.less",
                },
            },
        },

        //validate _css/<%= site_name %>.css and _assets/**.*.css
        csslint : {
            test : {
                options : {
                    import : 2
                },
                src : [
                    '_css/<%= site_name %>.less.css',
                    '_assets/**/*.css',
                ],
            },
        },

        //concatenate css files
        concat : {
            css : {
                src : ['_css/bootstrap.css', '_css/font-awesome.css', '_css/<%= site_name %>.less.css', '_assets/**/*.css'],
                dest : 'css/<%= site_name %>.css',
            },
        },

        //take all the css files and minify them into <%= site_name %>.min.css
        cssmin : {
            css : {
                src : 'css/<%= site_name %>.css',
                dest : 'css/<%= site_name %>.min.css',
            },
        },

        //take all the js files and minify them into <%= site_name %>.min.js
        uglify: {
            build : {
                files: {
                //jquery must be before bootstap
                'js/<%= site_name %>.min.js': ['_js/jquery.js','_js/bootstrap.js', '_assetts/*.js']
                },
            },
        },


        //shell
        shell : {
            jekyllBuild : {
                command : 'bundle exec jekyll build'
            },
            jekyllServe : {
                command : 'bundle exec jekyll serve --watch'
            }
        },

        //content to watch for changes
        watch : {

            images : {
                files : [ 'images/**/*' ],
                tasks : [ 'shell:jekyllBuild' ],
                options : { debounceDelay: 250 },
            },

            less : {
                files : [ '_assets/**/*.less' ],
                tasks : [ 'less', 'concat', 'cssmin', 'shell:jekyllBuild' ],
                options : { debounceDelay: 250 },
            },

            css : {
                files : [ '_assets/**/*.css' ],
                tasks : [ 'concat', 'cssmin', 'shell:jekyllBuild' ],
                options : { debounceDelay: 250 },
            },

            js : {
                files : [ '_assets/**/*.js' ],
                tasks : [ 'uglify', 'shell:jekyllBuild' ],
                options : { debounceDelay: 250 },
            },

            jekyll : {
                files : [ '_includes/**/*.html', '_layouts/**/*.html', 'index.html', '404.html', '_config.yml' ],
                tasks : [ 'shell:jekyllBuild' ],
                options : { debounceDelay: 250 },
            },

        },

        // run jekyll server and watch at the same time
        concurrent: {
            options: {
                logConcurrentOutput: true,
            },
            tasks: [ 'shell:jekyllServe', 'watch' ],
        },


        clean: {

            //remove all dynamic content
            //remove generated files from:
            //'npm install', 'grunt build', 'bundle exec jekyll build'
            generated: [
                'fonts',
                'js',
                'css',
            ],

            //remove non-required staging folders
            temp: [
                '_js',
                '_css',
                '_less',
                '_site',
                'Gemfile.lock',
            ],

            //remove all local npm files (requires 'npm install' to re-gen)
            npm: [
                'node_modules',
            ],

        }

    });

    // register custom grunt tasks

    //validate pre-minified css files
    grunt.registerTask( 'test', [ 'less', 'csslint' ] );

    //build dev
    grunt.registerTask( 'build', [ 'clean:temp', 'clean:generated', 'copy', 'less', 'concat', 'cssmin', 'uglify', 'clean:temp', 'shell:jekyllBuild' ] );

    //start local dev server (http://localhost:4000) and monitor changes to watched folders to kick off recompilation
    //default for when grunt is ran with no options
    grunt.registerTask( 'default', [ 'concurrent' ] );

    //build deploy files and remove dev files for git commit/push
    grunt.registerTask( 'deploy', [ 'clean:temp', 'clean:generated', 'copy', 'less', 'concat', 'cssmin', 'uglify', 'clean:temp', 'clean:npm' ] );
};
