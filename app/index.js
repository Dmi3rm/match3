import Vue from 'vue';
import router from '@/router/index';

new Vue({
  el: '#app',
  template: '<div><router-view></router-view></div>',
  router,
});
