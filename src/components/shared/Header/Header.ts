import { Component, Prop, Vue, Inject } from 'vue-property-decorator'

import './Header.scss'
import { State } from 'vuex-class'

import store from '../../../store'

@Component({
    template: require('./Header.html'),
    name: 'Header',
    components: { }
})

export class Header extends Vue {
    @State user
    @State subscription
    @Prop({ default: false }) authed: boolean
    @Inject() toggleModal
}
