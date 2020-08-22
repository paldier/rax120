module.exports = function(grunt) {

    grunt.file.expand('../node_modules/grunt-*/tasks').forEach(grunt.loadTasks);

    grunt.initConfig({
        includes: {
	    css: {
		cwd: 'www.out/style/',
		src: ['*.css'],
		dest: 'www.out/style/',
	        options: {
	            flatten: false,
		    duplicates: false,
		    debug: true,
		    silent:true
	        }
	    }
	},

	uglify: {
            target: {
                options: {
		    mangle: false,
		    compress: {
		        evaluate: false
		    }
		},
		files: [{
                    expand: true,
                    cwd: 'www.out',
                    src: ["*.js", "*/*.js", "*/*/*.js"],
		    dest: 'www.out',
		    filter: p => {
			let ignores = [];
		    	let isIgnore = ignores.some(f => p.includes(f));
			let isCLang = /languages-[a-z]{2,3}.js/g.test(p);
			return !(p.endsWith(".min.js") || isIgnore || isCLang);
		    }
                }]
            },
	    handleMin: {
	        options: {
		    mangle: true,
		    output: {
		        comments: '/License|Copyright/i'
		    }
		},
		files: [{
		    expand: true,
		    cwd: 'www.out',
		    src: ['materialize.min.js'],
		    dest: 'www.out',
		}]
	    }
        },

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'www.out',
                    src: ['dtree.css', 'style/*.css'],
		    dest: 'www.out',
		    filter: p => {
		        let ignores = ['material_styles.css'];
			let isIgnore = ignores.some(f => p.includes(f));
			return !(p.endsWith(".min.css") || isIgnore);
		    }
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-includes');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('build_null', []);
    grunt.registerTask('build_css', ['includes', 'cssmin']);
    grunt.registerTask('build_js', ['uglify']);
    grunt.registerTask('build_css_js', ['includes', 'cssmin', 'uglify']);
    grunt.registerTask('build_js_css', ['includes', 'cssmin', 'uglify']);
};
