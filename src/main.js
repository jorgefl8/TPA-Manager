import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';

import '@/assets/main.css'
import 'primevue/resources/themes/lara-light-teal/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';          
import 'primeflex/primeflex.css' 
import './assets/styles/layout.scss';

createApp(App)
    .use(router)
    .use(PrimeVue)
    .mount('#app');
