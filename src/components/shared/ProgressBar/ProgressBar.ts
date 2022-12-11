import { Component, Prop, Vue } from 'vue-property-decorator'

import './ProgressBar.scss'

@Component({
    template: require('./ProgressBar.html'),
    name: 'ProgressBar',
    components: {}
})
export class ProgressBar extends Vue {
    @Prop({ default: 0 }) completed: number
    @Prop() total: number
    @Prop() collection: string
    @Prop({ default: true }) showLabel: boolean
    @Prop({ default: 1 }) height: number

    get computedProgress() {
        return this.completed / this.total * 100
    }

}
