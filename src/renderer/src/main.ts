import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Main from './Main.vue'
createApp(Main).use(createPinia()).mount('#main');