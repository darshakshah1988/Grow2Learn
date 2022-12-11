import './sass/headway.scss'

import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import { makeHot, reload } from './util/hot-reload'
import { createRouter } from './router'

import './sass/fa/fontawesome.scss'
import './sass/fa/fa-light.scss'
import './sass/fa/fa-solid.scss'

import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/css/froala_editor.pkgd.min.css'
import 'font-awesome/css/font-awesome.css'
import 'froala-editor/css/froala_style.min.css'

import './components/shared/Tabs/Tabs.scss'

// Sync Router and Store
import store from './store'
const router = createRouter()
sync(store, router)

// Global Components
import { Modal } from './components/shared/Modal'
import { Card } from './components/shared/Card'
import { Header } from './components/shared/Header'
import { Tabs, Tab } from 'vue-tabs-component'
import VueAnalytics from 'vue-ua'
import VueFroala from 'vue-froala-wysiwyg'
import Notifications from 'vue-notification'
import { focus } from 'vue-focus'


Vue.component('Card', Card)
Vue.component('Modal', Modal)
Vue.component('Header', Header)
Vue.component('Tabs', Tabs)
Vue.component('Tab', Tab)
Vue.use(Notifications)
Vue.directive('focus', focus)



Vue.use(VueFroala)


Vue.use(require('vue-moment'))

Vue.use(VueAnalytics, {
    appName: 'Headway',
    appVersion: '1',
    trackingId: 'UA-110929649-2',
    vueRouter: router,
})

declare module 'vue/types/vue' {
    interface Vue {
        $ua: VueAnalytics
    }
}

// tslint:disable-next-line:no-unused-expression
new Vue({
    el: '#app-main',
    router,
    store,
})

