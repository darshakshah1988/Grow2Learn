import { Component, Prop, Watch, Vue, Provide } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import { StudentOnboard, StudentHeader, StudentHome, StudentCourse, StudentCard } from '../../'

import './Student.scss'

import store from '../../../store'

import { BASE_URL, PUSHER } from '../../../constants'
import io from 'socket.io-client'
import { throws } from 'assert'


const toggleModal = k => store.commit('toggleModal', k)

@Component({
    template: require('./Student.html'),
    name: 'Student',
    components: {
        StudentOnboard,
        StudentHeader,
        StudentHome,
        StudentCourse,
        StudentCard,
    }
})

export class Student extends Vue {
    io: object
    @State student
    @State socket

    @Provide() toggleModal = toggleModal

    @Watch('$route', { deep: true })
    watchRoute(newVal, oldVal) {
        this.updateRoute(newVal)
    }

    updateRoute(route) {
        store.dispatch('getStudent')
            .then(student => {
                const Pusher = require('pusher-js') 
                const studentId = student.id

                //Pusher.logToConsole = true

                // const pusher = new Pusher(PUSHER.KEY, {
                //     cluster: PUSHER.CLUSTER
                // })

            //     const channel = pusher.subscribe('headway')

            //     channel.bind(`studentId:${studentId}`, (data) => {
            //         this.$notify({
            //             group: 'student_notifs',
            //             text: data.notification.message,
            //             duration: 10000
            //         })
            //         store.dispatch('getStudent')
            //     })
            // })
            // .then(email => {
            //     store.commit('setSocket', email)
                
            //     this.socket.on('update-student', () => {
            //         store.dispatch('getStudent')
            //             .then(({ notifications }) => {
            //                 this.$notify({
            //                     group: 'student_notifs',
            //                     text: notifications[notifications.length - 1].message,
            //                     duration: 10000
            //                 })
            //             })
            //     })
             })
        store.dispatch('setAppView', route.name)
    }

    mounted () {
        this.updateRoute(this.$route)
    }

}
