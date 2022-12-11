import { Component, Prop, Vue } from 'vue-property-decorator'

import './Task.scss'

@Component({
    template: require('./Task.html'),
    name: 'Task',
    components: {}
})

export class Task extends Vue {
    @Prop() task: string

    close() {
        this.$emit('close')
    }
}
