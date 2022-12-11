import { Component, Prop, Vue } from 'vue-property-decorator'

import { Card } from '../Card'

import './Modal.scss'

@Component({
    template: require('./Modal.html'),
    name: 'modal',
    components: {
        Card
    }
})

export class Modal extends Vue {

    @Prop({ default: false }) wide: boolean

    emitClose() {
        this.$emit('close')
    }

    stopEmitClose(e) {
        e.stopPropagation()
    }

    handleKeyup(e) {
        if (e.keyCode === 27) {
            this.emitClose()
        }
    }

}
