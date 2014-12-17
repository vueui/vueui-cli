var Command = require('ronin').Command,
    prompt = require('prompt'),
    colors = require('colors')

var path = require('path'),
    gulp = require('gulp'),
    template = require('gulp-template'),
    print = require('gulp-print'),
    set = require('101/set'),
    last = require('101/last')

var templates = [ 'package.json', 'README.md', 'LICENSE' ]


var Module = Command.extend({
  desc: 'Scaffold the boilerplate for a new Vue-UI module',
  
  options: {
    type: {
      type: 'string'
    }
  },
  
  run: function (type, module) {
      var data = {}

      if(!module) {
          throw new Error('a name for the new module must be specified')
      }
      
      set(data, 'module', module)
      
      prompt.start()
      
      var schema = {
          properties: {
              description: {
                  type: 'string',
                  description: 'Enter a description for this module:',
                  default: 'A Vue-UI module.'
              },
              repo: {
                  description: 'A Github repo where the module will live:',
                  default: 'github.com/vueui/' + module,
                  type: 'string'
              }
          }
      }
      
      prompt.get(schema, function(err, results) {          
          if(err) {
              throw new Error(err.message)
          }
          
          set(data, 'description', results.description)
          set(data, 'repo', results.repo)
      
          templates.forEach(function(fileName) {
              gulp.src(path.join(__dirname, '../templates', fileName))
                  .pipe(template(data))
                  .pipe(print(function(path) {
                      console.log('created '.green + last(path.split('/')))
                  }))
                  .pipe(gulp.dest('dist'))
          })
      })
  }
})

module.exports = Module
