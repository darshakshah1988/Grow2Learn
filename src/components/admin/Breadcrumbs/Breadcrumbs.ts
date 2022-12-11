import { Component, Prop, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import './Breadcrumbs.scss'

import store from '../../../store'

@Component({
    template: require('./Breadcrumbs.html'),
    name: 'Breadcrumbs',
    components: {}
})

export class Breadcrumbs extends Vue {
    @Prop({default: []}) crumbs: any[]

    @State route

    $refs: {
        courseName: HTMLTextAreaElement
    }

    editing = false

    get courseName() {
        return this.crumbs[0].label
    }

    handleKeypress(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
            this.editing = false
            this.save()
        }
    }

    edit() {
        if (this.route.name === 'course') {
            this.editing = true
            this.$nextTick(() => {
                this.$refs.courseName[0].focus()
                this.$refs.courseName[0].select()
            })
        }
    }

    save() {
        this.crumbs[0].label = this.$refs.courseName[0].value
        store.dispatch('editCourseName', {
            courseId: parseInt(this.route.params.courseId),
            name: this.$refs.courseName[0].value,
        })
    }
}
