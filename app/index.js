import Vue from 'vue';
import router from '@/router/index';
import VModal from 'vue-js-modal';

Vue.use(VModal);

new Vue({
  el: '#app',
  template: '<div><router-view></router-view></div>',
  router,
});
