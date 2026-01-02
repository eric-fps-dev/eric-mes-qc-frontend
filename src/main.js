import { createApp } from 'vue'
import axios from 'axios'
import App from './App.vue'
import ElementPlus from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import 'element-plus/dist/index.css'
import '@/styles/index.scss'
import '@/iconfont/iconfont.css'
import Draggable from '@/../lib/vuedraggable/dist/vuedraggable.umd.js'
import VForm3 from 'vform3-builds'; // 确保路径正确
import VFormRender from '@/components/form-render/index'
import {registerIcon} from '@/utils/el-icons'
import 'virtual:svg-icons-register'
import router from './router'; // Import the router
import store from './store'; // Import the store
import ContainerWidgets from '@/components/form-designer/form-widget/container-widget/index'
import ContainerItems from '@/components/form-render/container-item/index'

import { addDirective } from '@/utils/directive'
import { installI18n } from '@/utils/i18n'
import { loadExtension } from '@/extension/extension-loader'

import 'element-plus/dist/index.css'  //引入element-plus样式
import 'vform3-builds/dist/designer.style.css'  //引入VForm3样式

import '@vue-js-cron/element-plus/dist/element-plus.css'
import CronElementPlusPlugin from '@vue-js-cron/element-plus'


if (typeof window !== 'undefined') {
  window.axios = axios
}

const vfApp = createApp(App)

vfApp.use(router)
vfApp.use(ElementPlus, { locale: en })
vfApp.use(store)
vfApp.use(VForm3)
vfApp.use(CronElementPlusPlugin)
registerIcon(vfApp)
vfApp.component('draggable', Draggable)
addDirective(vfApp)
installI18n(vfApp)

vfApp.use(ContainerWidgets)
vfApp.use(ContainerItems)
loadExtension(vfApp)

vfApp.mount('#app')
