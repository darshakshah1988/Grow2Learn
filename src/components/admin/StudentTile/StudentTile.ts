import { Component, Prop, Watch, Vue } from 'vue-property-decorator'

import { ProgressBar } from '../../shared/ProgressBar'

import './StudentTile.scss'

import store from '../../../store'

@Component({
    template: require('./StudentTile.html'),
    name: 'StudentTile',
    components: {
        ProgressBar
    }
})

export class StudentTile extends Vue {
    @Prop({ default: () => {} }) student: Object

    progress = []

    @Watch('student', { deep: true })
    onStudentChanged(newVal, oldVal) {
        if (newVal.BusinessStudent) {
            store.dispatch('fetchStudentProgress', newVal.BusinessStudent)
                .then(progress => {
                    this.progress = progress
                })
        }
    }
}
