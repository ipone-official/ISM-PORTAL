// Core Components
import Toolbar from '../components/core/PageToolbar.vue';
import Navigation from '../components/core/NavigationDrawer.vue';
import Breadcrumbs from '../components/core/PageBreadcrumbs.vue';
import PageFooter from '../components/core/PageFooter.vue';

function setupComponents(Vue){

  Vue.component('page-toolbar', Toolbar);
  Vue.component('page-navigation', Navigation);
  Vue.component('page-breadcrumbs', Breadcrumbs);
  Vue.component('page-footer', PageFooter);
  
}


export {
  setupComponents
}
