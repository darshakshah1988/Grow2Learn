import { Component, Prop, Watch, Vue, Inject } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'
import { SlickList, SlickItem } from 'vue-slicksort'

import { UnitList } from '../UnitList'

import { dragscroll } from 'vue-dragscroll'

import './Course.scss'
import store from '../../../store'

@Component({
    template: require('./Course.html'),
    name: 'Course',
    components: {
        UnitList,
        SlickList,
        SlickItem,
    },
    directives: {
        'dragscroll': dragscroll
    }
})

export class Course extends Vue {

    @Getter currentCourse

    @State breadcrumbs
    @State route

    sortOrder = ''

    @Inject() toggleModal

    @Watch('$route', { deep: true})
    watchRoute(newVal, oldVal) {
        this.updateRoute(newVal)
    }

    updateRoute(route) {
        store.dispatch('fetchCurrentCourse')
    }

    mounted() {
        this.updateRoute(this.$route)
    }

    sortUnits(units) {
        const sortableUnits = units || this.currentCourse.units
        const sortOrder = sortableUnits.map(card => card.id)
        this.sortOrder = JSON.stringify(sortOrder)
        store.dispatch('editCourseSortOrder', {
            courseId: parseInt(this.route.params.courseId),
            sortOrder: this.sortOrder,
        })
    }
}
