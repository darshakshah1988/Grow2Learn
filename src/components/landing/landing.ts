import { Component, Prop,  Vue } from 'vue-property-decorator'

import './landing.scss'

@Component({
    template: require('./landing.html'),
    components: {
    }
})

export class LandingComponent extends Vue {
}
