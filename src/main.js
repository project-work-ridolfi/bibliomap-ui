import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/global.css'
import VueFeather from 'vue-feather';
import 'maplibre-gl/dist/maplibre-gl.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component(VueFeather.name, VueFeather);
app.mount('#app')