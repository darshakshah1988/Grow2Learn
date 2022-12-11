import { Component, Prop, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import AvatarCropper from 'vue-avatar-cropper'

import './EditProfile.scss'
import store from '../../../store'
import axios from 'axios'

@Component({
  template: require('./EditProfile.html'),
  name: 'EditProfile',
  components: {
    AvatarCropper
  }
})

export class EditProfile extends Vue {
  @State modals
  @State admin

  name = ''
  uploading = false
  submitting = false
  labels = {
    submit: 'Submit',
    cancel: 'Cancel'
  }

  handleUploading() {
    this.uploading = true
  }

  handleUploaded(resp) {
    this.uploading = false
    store.commit('setLogoUrl', resp)
  }

  handleChange(theme) {
    console.log(theme);  // To get the selected theme
    store.dispatch('updateTheme', theme)
  }
}