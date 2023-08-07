import { createApp, markRaw } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia'
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import '@/assets/main.css'
import '@/assets/styles/layout.scss';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';          
import 'primeflex/primeflex.css' 

const pinia = createPinia()
pinia.use(({ store }) => { store.router = markRaw(router) });

createApp(App)
    .use(router)
    .use(pinia)
    .use(PrimeVue)
    .use(ToastService)
    .use(ConfirmationService)
    .mount('#app');
