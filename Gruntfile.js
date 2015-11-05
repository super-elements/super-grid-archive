var vm = require('vm')
var fs = require('fs')

module.exports = function(grunt) {
    // Reads from a built Dojo file (out.js) to inline all define's as required by
    // RequireJS and outputs dgrid-out.js
    // TODO: Filenames should be passed as arguments!
    grunt.registerTask('dojo2requirejs', function () {
        var file = fs.readFileSync('./build/dojo/out.js.uncompressed.js', 'utf-8')

        var sandbox = {
            // Replaces the cache
            require: function (obj) {

                //The dojo build creates a requirejs incompatible
                //`cache: <>` object.
                var cache = obj.cache;

                //Flush the file, since we have to use `append()` later on
                fs.writeFileSync('./lib/dgrid.js', '')
                for (var path in cache){
                    var func = cache[path]
                        .toString()

                        //RequireJS just wants blank `define()` calles with the
                        //first argument being the name / path of the module to
                        //be registered.
                        .replace('define([', 'define("' + path + '", [')
                        fs.appendFileSync('./lib/dgrid.js', func.substring(func.indexOf('{') + 1, func.lastIndexOf('}') ))
                }
            },
            // Empty just so the vm won't throw an error
            define: function () {}
        }

        vm.createContext(sandbox)
        vm.runInContext(file, sandbox)

    })

	grunt.initConfig({
		shell: {
			options: {
				stdout: true
			},
			dgridBuild: {
				command: 'node ' +
					'../dojo/dojo.js' +
					' load=build ' +
					' --profile ./lib/supergrid.profile.js' +
					' --dojoConfig ./dojo.config.js' +
					' --releaseDir ./build'
			}
		},


        requirejs: {
			build: {
				options: {
                    baseUrl: '.',
					name: 'lib/dgrid.js',
					out: 'lib/dgrid.js',
					optimize: 'none'
				}

			}
		},


		clean: {

			//The Dojo build system makes a copy of all the src folders
			//including dijit, dijitx, dojox etc. We don't need these so
			//delete (clean) them.
			cleanBuild: {
				src: [
					'./build'
				]
			}
		}
	})

	grunt.registerTask('default', [
		'shell:dgridBuild',
		'dojo2requirejs',
		'requirejs:build',
		'clean:cleanBuild'
	])

	grunt.loadNpmTasks('grunt-shell')
	grunt.loadNpmTasks('grunt-contrib-clean')
	grunt.loadNpmTasks('grunt-contrib-requirejs')
}
