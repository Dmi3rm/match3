import vue from 'vue';
import vuerouter from 'vue-router';
import matchPage from '@/components/matchPage.vue';

vue.use(vuerouter);


const routes = [
  {
    path: '/',
    component: matchPage,
  },
];

export default new vuerouter({
  routes,
  mode: 'history',
});
