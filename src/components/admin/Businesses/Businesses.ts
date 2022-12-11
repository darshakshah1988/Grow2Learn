import { Component, Prop, Vue } from 'vue-property-decorator'

import './Businesses.scss'

@Component({
    template: require('./Businesses.html'),
    name: 'Businesses',
    components: {
    }
})

export class Businesses extends Vue {
    @Prop() businesses: any[]
}
