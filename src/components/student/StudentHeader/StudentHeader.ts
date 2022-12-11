import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './StudentHeader.scss'

import { AudioPlayer } from '../../shared/AudioPlayer'

import store from '../../../store'

@Component({
    template: require('./StudentHeader.html'),
    name: 'StudentHeader',
    components: {
        AudioPlayer
    }
})

export class StudentHeader extends Vue {
    show = false
    @Getter activeStudentCourse
    @Getter activeStudentUnitName
    @State activeStudentCard
    @State appView
    @State student
    @State route

    $refs: {
        player: AudioPlayer
    }

    @Watch('activeStudentCard')
    watchActiveStudentCard(newVal, oldVal) {
        if (newVal && newVal.audio) {
            this.$nextTick(() => {
                this.updateFileSrc(newVal.audio.type)
            })
        }
    }

    get backLink() {
        if (this.route.name === 'studentHome') {
            return ''
        } else if (this.route.name === 'studentCourse') {
            return '/app'
        } else if (this.route.name === 'studentCard') {
            return '/app/' + this.route.params.courseId
        }
    }

    get courseName() {
        if (this.activeStudentCourse) {
            return this.activeStudentCourse.name
        }
    }

    get initials() {
        if (this.student.first_name) {
            return this.student.first_name.charAt(0) + this.student.last_name.charAt(0)
        }
    }

    get notifications() {
        return this.student.notifications || []
    }

    get notificationCount() {
        return this.notifications && (this.notifications.length > 99 ? 99 : this.notifications.length)
    }

    updateFileSrc(format) {
        store.dispatch('getFileUrl', {
            cardId: this.activeStudentCard.id,
            format: format
        }).then(url => {
            switch (format) {
                case 'audio':
                    this.$refs.player.audioSrc = url
                break
            }
        })
    }

}
