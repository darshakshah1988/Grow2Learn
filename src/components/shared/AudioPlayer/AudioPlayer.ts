import { Component, Prop, Vue } from 'vue-property-decorator'

import './AudioPlayer.scss'

import { BASE_URL } from '../../../constants'

@Component({
    template: require('./AudioPlayer.html'),
    name: 'AudioPlayer',
    components: {}
})

export class AudioPlayer extends Vue {

    audioSrc = ''

    $refs: {
        player: HTMLAudioElement
    }

    playing = false
    expanded = false
    running = false

    play() {
        this.playing = true
        this.$refs.player.play()
        this.running = true
    }

    pause() {
        this.playing = false
        this.$refs.player.pause()
    }

    handleEnd() {
        this.playing = false
        this.expanded = false
        this.running = false
    }

    get srcWithBaseUrl() {
        if (this.audioSrc) {
            return this.audioSrc
        }
    }

}

