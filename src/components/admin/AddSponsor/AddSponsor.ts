
import { Component, Prop, Vue, Inject, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import * as vue2Dropzone from 'vue2-dropzone'

import './AddSponsor.scss'
import store from '../../../store'
import axios from 'axios'
import { BASE_URL } from '../../../constants'

@Component({
    template: require('./AddSponsor.html'),
    name: 'AddSponsor',
    components: {
        vueDropzone: vue2Dropzone
    }
})

export class AddSponsor extends Vue {
    @Inject() toggleModal
    @Inject() unitService

    @State activeUnit
    @State route
    @State modals
    @State addCardUnitId
    @State sponsors

    sponsorName = ''
    submitting = false
    sponsorMessage = ''
    sponsorWebsite = ''
    logo = null
    id=''

    dropzoneOptions= {
        url: BASE_URL + '/admin/sponsor/logo',
        thumbnailHeight: 100,
        addRemoveLinks: true,
        acceptedFiles: ".jpg, .jpeg, .png",
        dictDefaultMessage: ``,
        maxFiles: 1,
        thumbnailMethod:'contain'
      }
    $refs: {
        imgDropZone
    }
    imageSendingEvent(file, xhr, formData) {
        //this.audioIsUploading = true
        //formData.append('cardId', this.currentCard.id)
        formData.append('size', file.size)
    }
    afterComplete(file,response){
        this.logo = response.id
    }
    updateFileSrc(fileId){
        store.dispatch('getSponsorLogo', {
            fileId
        }).then(url => {
            if(url){
                const file = { size: 123, name: "Icon", type: "image/png" };
                this.$refs.imgDropZone.manuallyAddFile(file, url); 
            }else{
                this.$refs.imgDropZone.removeAllFiles(true);
            }
        })
    }
    submit() {
        if (this.submitting) {
            return
        }
        this.submitting = true
        if(!this.id){
            store.dispatch('addSponsor', {
                courseId: parseInt(this.$route.params.courseId),
                name: this.sponsorName,
                message:this.sponsorMessage,
                website:this.sponsorWebsite,
                logo :this.logo
            }).then(d => {
                this.sponsorName = ''
                this.sponsorWebsite = ''
                this.sponsorMessage = ''
                this.submitting = false
                this.$refs.imgDropZone.removeAllFiles(true);
                this.toggleModal('addSponsor')
            })
        }else{
            store.dispatch('editSponsor', {
                name: this.sponsorName,
                message:this.sponsorMessage,
                website:this.sponsorWebsite,
                logo :this.logo,
                id:this.id
            }).then(d => {
                
                this.submitting = false
                this.toggleModal('addSponsor')
            })
        }
        
    }
    @Watch('sponsors')
    watchMenuOpen(newVal, oldVal) {
        console.log('watch',newVal);
        
        if (newVal && newVal.length > 0) {
            this.sponsorName = newVal[0].name
            this.sponsorWebsite = newVal[0].website
            this.sponsorMessage = newVal[0].message
            this.logo = newVal[0].logo
            this.id = newVal[0].id 
            document.getElementById('addSponsorbtn').innerHTML = '<i class="fal fa-edit"></i> Edit Sponsor'
            document.querySelector('.sponsor-modal .Card__title').innerHTML = 'Edit Sponsor'
            document.getElementById('btnSponsor').innerHTML = 'Save Sponsor'
            
            this.$refs.imgDropZone.removeAllFiles(true);
            this.updateFileSrc(newVal[0].logo)
        }else{
            this.sponsorName = ''
            this.sponsorWebsite = ''
            this.sponsorMessage = ''
            this.id = ''
            this.logo = ''
            document.getElementById('addSponsorbtn').innerHTML = '<i class="fal fa-plus"></i> Add Sponsor'
            document.getElementById('btnSponsor').innerHTML = 'Save Sponsor'
            document.querySelector('.sponsor-modal .Card__title').innerHTML = 'Add Sponsor'
            //var file = { size: 0, name: "", type: "" };
            //var url = "";
            this.$refs.imgDropZone.removeAllFiles(true);
        }
    }
    
}

