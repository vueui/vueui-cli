
var domReady     = require('domready'),
    Vue          = require('vue'),
    {{ module }} = require('..')

Vue.use({{ module }})

domReady(function () {
     
     window.app = new Vue().$mount('#app')
     window.Vue = Vue
     
});
