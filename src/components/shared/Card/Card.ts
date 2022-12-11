import { Component, Prop, Vue } from 'vue-property-decorator'

import './Card.scss'

@Component({
    template: require('./Card.html'),
    name: 'Card',
    components: {}
})

export class Card extends Vue {
    @Prop() title: string
    @Prop() centeredTitle: boolean
    @Prop() subTitle: string
    @Prop() icon: string
    @Prop() tight: boolean
}
