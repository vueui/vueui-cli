var Command = require('ronin').Command,
    prompt = require('prompt'),
    colors = require('colors'),
    fs = require('fs')

var path = require('path'),
    gulp = require('gulp'),
    template = require('gulp-template'),
    print = require('gulp-print'),
    rename = require('gulp-rename'),
    git = require('gulp-git'),
    set = require('101/set'),
    last = require('101/last')


var Module = Command.extend({
  desc: 'Scaffold the boilerplate for a new Vue-UI module',
  
  run: function (module) {
      var data = {}

      if(!module) {
          throw new Error('a name for the new module must be specified')
      }
      
      set(data, 'module', module)
      
      // Attempt to create the plugin folder with the 'module' name
      var pluginPath = path.join('./', module)
      
      if(fs.existsSync(pluginPath)) {
          throw new Error('A directory with the name of ' + module + ' already exists in this directory')
      } else {
          fs.mkdirSync(pluginPath)
      }
      
      
      // Prompt for the data we need to generate the templates      
      prompt.start()
      
      var schema = {
          properties: {
              description: {
                  type: 'string',
                  description: 'Enter a description for this module',
                  default: 'A Vue-UI module.'
              },
              username: {
                  description: 'Github username',
                  default: 'vueui',
                  type: 'string'
              },
              repo: {
                  description: 'A Github repo where the module will live',
                  default: module,
                  type: 'string'
              }
          }
      }
      
      prompt.get(schema, function(err, results) {          
          if(err) {
              throw new Error(err.message)
          }
          
          set(data, 'description', results.description)
          set(data, 'username', results.username)
          set(data, 'repo', results.repo)
          
          // Init an empty Git repo
          gulp.task('init', function(cb) {
              git.init({ cwd: pluginPath }, function(err) {
                  if(err) {
                      throw new Error(err.message)
                  }
                  cb()
              })
          })
          
          gulp.task('addRemote', function(cb) {
              var repo = 'git@github.com:' + results.username + '/' + repo + '.git'
              git.addRemote('origin', repo, {cwd: pluginPath}, function(err) {
                  if(err) {
                      throw new Error(err.message)
                  }
                  cb()
              })
          })
          
          // Interpolate and copy the template files for this module
          gulp.task('templates', [ 'init' ], function() {
              return gulp.src(path.join(__dirname, '../templates/**'), { dot: true })
                  .pipe(template(data, {
                      interpolate: /{{([\s\S]+?)}}/g 
                  }))
                  .pipe(rename(function(path) {
                      if(path.basename === 'module') path.basename = module
                  }))
                  .pipe(gulp.dest(module))
                  .pipe(print(function(path) {
                      console.log('created '.green + last(path.split('/')))
                  }))
                  .pipe(git.add({cwd: pluginPath}))
                  .pipe(git.commit('first commit', {cwd: pluginPath}))
          })
          
          
          gulp.task('all', [ 'templates'], function() {
              console.log('Completed everything')
          })
          
          gulp.start('all')
      })
  }
})

module.exports = Module
