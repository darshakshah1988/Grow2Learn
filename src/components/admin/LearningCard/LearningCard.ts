/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component, Prop, Vue, Watch, Inject } from "vue-property-decorator";
import { State, Getter, Mutation } from "vuex-class";
import * as vue2Dropzone from "vue2-dropzone";
import * as moment from "moment";
import "./LearningCard.scss";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import { ProgressBar } from "../../shared/ProgressBar";
import { QuizBuilder } from "../QuizBuilder";
import { AudioPlayer } from "../../shared/AudioPlayer";
import { Quiz } from "../../student/Quiz";
import store from "../../../store";
import { BASE_URL } from "../../../constants";
import { Action, Agenda } from "../../../interfaces";
import Axios from "axios";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";

@Component({
  template: require("./LearningCard.html"),
  name: "LearningCard",
  components: {
    ProgressBar,
    QuizBuilder,
    Quiz,
    AudioPlayer,
    vueDropzone: vue2Dropzone,
    DatePicker,
    quillEditor
  },
  filters: {
    formatDate: function(value) {
      if (value) {
        return moment(String(value)).format("DD MMM YYYY");
      }
    }
  }
})
export class LearningCard extends Vue {
  @Inject() toggleModal;

  quizVisible = false;
  taskVisible = false;

  @Getter currentCard;
  @State route;
  @State courses;
  @State admin;
  @State subscription;
  @State storageUsage;
  @State sponsors;

  name = "";
  ready = false;
  content = "";
  evidence = "";
  quiz = [];
  audioUploadPercent = 0;
  audioIsUploading = false;
  videoUploadPercent = 0;
  videoIsUploading = false;
  youtubeUploadPercent = 0;
  youtubeIsUploading = false;
  cardType = "";
  time = "";
  timeSlots = [];
  date = null;
  location = "";
  attendees = [
    { name: "Test", role: "Facilitator" },
    { name: "Test", role: "Timer" }
  ];
  agendaTopic = "";
  agendaActions = [];
  roles = ["Facilitator", "Timer", "Attendee"];

  sponsorName = "";
  submitting = false;
  sponsorMessage = "";
  sponsorWebsite = "";
  logo = null;
  fileId = null;
  toggleYouTube: string;
  typeYoutube:boolean;

  sharedConfig = {
    key: "OD2G2D4I4D3A13hC7D6C5D4D2E3J4C6A6C6cgsmtJ2C8eheE5kC-8==",
    iconsTemplate: "font_awesome_5",
    pastePlain: true,
    fontSizeSelection: true,
    fontSize: ["20", "18", "16"],
    charCounterCount: false,
    quickInsertTags: [""],
    // WARNING! These fields are not even named correctly. See from docs they should be:
    // • imageUploadURL is the URL where the upload request is being made.
    // • imageUploadMethod is the HTTP request type.
    // fileUpload: true,
    // fileUploadMethod: 'PUT',
    // fileUploadURL: '/api/card/2',
    toolbarButtons: [
      "undo",
      "redo",
      "|",
      "fontSize",
      "bold",
      "italic",
      "underline",
      "outdent",
      "indent",
      "clearFormatting",
      "|",
      "insertImage"
    ],
    imageInsertButtons: ["imageBack", "|", "imageUpload", "imageByURL"]
  };

  contentConfig = Object.assign({}, this.sharedConfig, {
    placeholderText: "Start writing",
    height: 400,
    events: {
      "froalaEditor.image.beforeUpload": function(e, editor, files) {
        if (files.length) {
          // Create a File Reader.
          const reader = new FileReader();

          // Set the reader to insert images when they are loaded.
          reader.onload = function(e) {
            const target = <any>e.target;
            const result = target.result;
            editor.image.insert(result, null, null, editor.image.get());
            console.log("yay");
          };

          // Read image as base64.
          reader.readAsDataURL(files[0]);
        }

        editor.popups.hideAll();

        // Stop default upload chain.
        return false;
      },
      "froalaEditor.contentChanged": (e, editor) => {
        this.content = editor.html.get();
        setTimeout(() => {
          this.save();
        }, 500);
      }
    }
  });

  evidenceConfig = Object.assign({}, this.sharedConfig, {
    placeholderText:
      "Ask your users to perform a practical task related to the content in this card",
    height: 150,
    events: {
      "froalaEditor.image.beforeUpload": function(e, editor, files) {
        if (files.length) {
          // Create a File Reader.
          const reader = new FileReader();

          // Set the reader to insert images when they are loaded.
          reader.onload = function(e) {
            const target = <any>e.target;
            const result = target.result;
            editor.image.insert(result, null, null, editor.image.get());
            console.log("yay");
          };

          // Read image as base64.
          reader.readAsDataURL(files[0]);
        }

        editor.popups.hideAll();

        // Stop default upload chain.
        return false;
      },
      "froalaEditor.contentChanged": (e, editor) => {
        this.evidence = editor.html.get();
        setTimeout(() => {
          this.save();
        }, 500);
      }
    }
  });

  $refs: {
    audio: HTMLAudioElement;
    AudioDropzone: any;
    video: HTMLVideoElement;
    youtube: HTMLIFrameElement;
    mobileVideo: HTMLVideoElement;
    mobileYoutube: HTMLIFrameElement;
    VideoDropzone: any;
    YoutubeDropzone: any;
    name: HTMLInputElement;
    player: AudioPlayer;
  };

  @Watch("currentCard", { deep: true })
  watchCurrentCard(newVal, oldVal) {
    console.log(newVal);

    if (newVal && newVal.content) {
      this.content = newVal.content;
    }
    if (newVal && newVal.evidence_task) {
      this.evidence = newVal.evidence_task;
    }
    if (newVal && newVal.quiz) {
      this.quiz = JSON.parse(newVal.quiz);
    }
    if (newVal && newVal.name) {
      this.name = newVal.name;
    }
    if (newVal && newVal.location) {
      this.location = newVal.location;
    }
    if (newVal && newVal.agendaTopic) {
      this.agendaTopic = newVal.agendaTopic;
    }
    if (newVal && newVal.attendees) {
      this.attendees = JSON.parse(newVal.attendees);
    }
    if (newVal && newVal.agendaActions) {
      if (newVal.agendaActions == "") {
        this.agendaActions = [];
      } else {
        this.agendaActions = JSON.parse(newVal.agendaActions);
      }
    }
    if (newVal && newVal.cardType) {
      this.date = moment(String(newVal.cardType)).format("Do MMM YYYY");
    }
    if (newVal && newVal.cardType) {
      this.cardType = newVal.cardType;
    }
    if (newVal && newVal.time) {
      this.time = newVal.time;
    }
    if (newVal && newVal.videoId) {
      this.$nextTick(() => {
        this.updateFileSrc("video");
      });
    }
    if (newVal && newVal.audioId) {
      this.$nextTick(() => {
        console.log("Audio" + newVal.audio + "<=>" + newVal.audioId);
        this.updateFileSrc("audio");
      });
    }
    if(newVal && newVal.mediaId == '10') {
      this.typeYoutube= true;
    }
    else {
      this.typeYoutube= false;
    }
  }

  @Watch("$route", { deep: true })
  watchRoute(newVal, oldVal) {
    this.updateRoute(newVal);
  }

  @Watch("sponsors")
  watchMenuOpen(newVal, oldVal) {
    console.log("watch", newVal);

    if (newVal && newVal.length > 0) {
      this.sponsorName = newVal[0].name;
      this.sponsorWebsite = newVal[0].website;
      this.sponsorMessage = newVal[0].message;

      this.fileId = newVal[0].logo;
      store
        .dispatch("getSponsorLogo", {
          fileId: this.fileId
        })
        .then(url => {
          this.logo = url;
        });
    } else {
      this.sponsorName = "";
      this.sponsorWebsite = "";
      this.sponsorMessage = "";
      this.logo = "";
    }
  }
  get maxFileSize() {
    if (this.subscription && this.subscription.product && this.storageUsage) {
      return (
        (this.subscription.product.metadata.storageInBytes -
          this.storageUsage.sizeInBytes) /
        1048576
      );
    }
    return 0;
  }

  audioDropzoneOptions = {
    url: BASE_URL + "/admin/upload/audio",
    thumbnailWidth: 150,
    maxFiles: 1,
    maxFilesize: 5, // mb
    timeout: 99999999,
    uploadprogress: this.audioUploadProgress
  };

  awss3 = {
    signingURL: this.signingUrl,
    headers: {},
    params: {},
    sendFileToServer: false, // switching to false causes issues. try again
    withCredentials: false
  };
  signingUrl(f) {
    return (
      "/s3-policy?format=video&file=" +
      f.name +
      "&cardId=" +
      this.currentCard.id
    );
  }

  videoDropzoneOptions = {
    url: BASE_URL + "/admin/upload/video",
    //url: "https://hashtagmails.com/s3/s3upload.php",
    thumbnailWidth: 150,
    maxFiles: 1,
    maxFilesize: 25, // mb
    timeout: 99999999,
    uploadprogress: this.videoUploadProgress
  };

  youtubeDropzoneOptions = {
    url: BASE_URL + "/admin/upload/youtube",
    thumbnailWidth: 150,
    maxFiles: 1,
    maxFilesize: 25, // mb
    timeout: 99999999,
    uploadprogress: this.youtubeUploadProgress
  };

  updateFileSrc(format) {
    store
      .dispatch("getFileUrl", {
        cardId: this.currentCard.id,
        format: format
      })
      .then(url => {
        console.log("format is:" + format);
        switch (format) {
          case "audio":
            this.$refs.audio.setAttribute("src", url);
            console.log("i am in audio case" + url);
            this.$refs.player.audioSrc = url;
            break;
          case "video":
            this.$refs.video.setAttribute("src", url);
            this.$refs.mobileVideo.setAttribute("src", url);
            break;
          case "youtube":
            this.$refs.youtube.setAttribute("src", url);
            this.$refs.mobileYoutube.setAttribute("src", url);
            break;
          default:
            console.log("format value is incorrect" + format);
            break;
        }
      });
  }

  videoUploadProgress(file, percent, size) {
    this.videoUploadPercent = Math.round(percent);
  }

  youtubeUploadProgress(file, percent, size) {
    this.youtubeUploadPercent = Math.round(percent);
  }

  videoSendingEvent(file, xhr, formData) {
    this.videoIsUploading = true;
    formData.append("cardId", this.currentCard.id);
    formData.append("size", file.size);
  }

  youtubeSendingEvent(file, xhr, formData) {
    this.youtubeIsUploading = true;
    formData.append("cardId", this.currentCard.id);
    formData.append("size", file.size);
  }

  audioSendingEvent(file, xhr, formData) {
    this.audioIsUploading = true;
    formData.append("cardId", this.currentCard.id);
    formData.append("size", file.size);
  }

  audioUploadProgress(file, percent, size) {
    this.audioUploadPercent = Math.round(percent);
  }

  audioSuccess(file) {
    const payload = {
      courseId: parseInt(this.route.params.courseId),
      unitId: parseInt(this.route.params.unitId),
      cardId: parseInt(this.route.params.cardId),
      file: {
        name: file.name,
        type: "audio"
      }
    };
    console.log("payload", payload);

    this.audioIsUploading = false;
    this.$refs.AudioDropzone.removeAllFiles(true);
    this.currentCard.audioId = file.name;
    this.updateFileSrc("audio");
    store.commit("setActiveCardAudio", payload);
    store.dispatch("getStorageUsage");
  }

  updateVideoSrc() {
    if (!this.currentCard.videoId) {
      console.log("abort updateVideoSrc", this.currentCard.video);
      return;
    }
    Axios.get(BASE_URL + "/admin/card/" + this.currentCard.id + "/video").then(
      d => {
        console.log(d.data);
        if (this.$refs.video) {
          this.$refs.video.setAttribute("src", d.data);
        }
        if (this.$refs.mobileVideo) {
          this.$refs.mobileVideo.setAttribute("src", d.data);
        }
      }
    );
  }

  videoSuccess(file) {
    console.log("videoSuccess", file);
    this.videoIsUploading = false;
    this.$refs.VideoDropzone.removeAllFiles(true);
    this.currentCard.videoId = file.name;
    this.updateVideoSrc();
    // store.commit('setActiveCardVideo', payload) // WARNING: this overwrites content edited during upload
  }
  youtubeVideoUrl(url, id)
  {
    Axios.post('/admin/youtubeUpdate', {"url":url,"cardId":id}).then(result=>{
      console.log(result);
    });
  }
  checkYoutubeOption() {
    if(!this.typeYoutube)
    {
      this.$refs.youtube.setAttribute("src", '');
      this.$refs.mobileYoutube.setAttribute("src", '');
      this.$refs.video.setAttribute("style","display:''");
      this.$refs.mobileVideo.setAttribute("style","display:''");
      this.$refs.VideoDropzone.setAttribute("style","display:''");
    } 
  }

  youtubeSuccess(file, response) {
    const payload = {
      courseId: parseInt(this.route.params.courseId),
      unitId: parseInt(this.route.params.unitId),
      cardId: parseInt(this.route.params.cardId),
      file: {
        name: response.id,
        type: "youtube"
      }
    };
    this.youtubeIsUploading = false;
    this.$refs.YoutubeDropzone.removeAllFiles(true);
    this.updateFileSrc("youtube");
    this.currentCard.videoId = response.id;
    store.commit("setActiveCardVideo", payload); // WARNING: this overwrites content edited during upload
    store.dispatch("getStorageUsage");
  }

  removeAudio() {
    if (this.$refs.audio) {
      this.$refs.audio.pause();
    }
    store.commit("set", {
      key: "removeAudioCardId",
      value: this.$route.params.cardId
    });
    this.currentCard.audioId = null;
    this.toggleModal("removeAudio");
  }

  removeVideo() {
    if (this.subscription.product.name === "Free Plan") {
      const youtubeSrc = this.$refs.youtube.src;
      this.$refs.youtube.src = youtubeSrc;
      const mobileYoutubeSrc = this.$refs.youtube.src;
      this.$refs.youtube.src = mobileYoutubeSrc;
    } else {
      this.$refs.video.pause();
      this.$refs.video.pause();
    }
    store.commit("set", {
      key: "removeVideoCardId",
      value: this.$route.params.cardId
    });
    this.currentCard.videoId = null;
    this.toggleModal("removeVideo");
  }

  updateRoute(route) {
    store.dispatch("getAdmin").then(() => {
      store.dispatch("fetchUnit", parseInt(this.$route.params.unitId));
    });
  }

  fetchUnit() {
    store.dispatch("fetchUnit", parseInt(this.$route.params.unitId));
  }

  mounted() {
    this.updateRoute(this.$route);
    setTimeout(() => {
      this.ready = true;
      this.$forceUpdate();
    }, 2000);

    for (let hr = 0; hr < 24; hr++) {
      const H = hr;
      const h = H % 12 || 12;
      const ampm = H < 12 ? "AM" : "PM";
      const hrStr = h.toString().padStart(2, "0") + ":";
      let val = hrStr + "00" + ampm;
      this.timeSlots.push(val);

      val = hrStr + "30" + ampm;
      this.timeSlots.push(val);
    }
    console.log("this.sponsors", this.sponsors);
    store.dispatch("fetchCurrentCourse");
    if (this.sponsors && this.sponsors.length > 0) {
      this.sponsorName = this.sponsors[0].name;
      this.sponsorWebsite = this.sponsors[0].website;
      this.sponsorMessage = this.sponsors[0].message;

      this.fileId = this.sponsors[0].logo;
      store
        .dispatch("getSponsorLogo", {
          fileId: this.fileId
        })
        .then(url => {
          this.logo = url;
        });
    } else {
      this.sponsorName = "";
      this.sponsorWebsite = "";
      this.sponsorMessage = "";
      this.logo = "";
    }
  }

  save() {
    if (!this.currentCard) {
      return;
    }
    store.dispatch("updateActiveCard", {
      id: this.currentCard.id,
      name: this.name,
      evidence_task: this.evidence,
      content: this.content
    });
  }

  updateYoutubeURL()
  {
    
    if(this.toggleYouTube.length > 0)
    {
      this.youtubeVideoUrl("https://youtube.com/embed/"+this.toggleYouTube, this.currentCard.id);
      this.typeYoutube = true;
      this.$refs.youtube.setAttribute("style", "width: 100%;height: 350px;");
      this.$refs.youtube.setAttribute("src", "https://youtube.com/embed/"+this.toggleYouTube);
      this.$refs.mobileYoutube.setAttribute("src", "https://youtube.com/embed/"+this.toggleYouTube);
      this.$refs.video.setAttribute("style","display:none");
      this.$refs.mobileVideo.setAttribute("style","display:none");
      
    }
    else
    {
      this.typeYoutube = false;
      this.$refs.youtube.setAttribute("src", '');
      this.$refs.mobileYoutube.setAttribute("src", '');
      this.$refs.video.setAttribute("style","display:''");
      this.$refs.mobileVideo.setAttribute("style","display:''");
      this.$refs.VideoDropzone.setAttribute("style","display:''");
      
    }
    
  }

  addAction(a, aIndex) {
    const action: Action = {
      text: ""
    };
    this.agendaActions[a].actions.push(action);
    console.log(this.agendaActions);

    this.$nextTick(() => {
      document
        .getElementById("action-" + (this.agendaActions.length - 1))
        .focus();
      document
        .getElementById("action-" + (this.agendaActions.length - 1))
        .scrollIntoView(true);
    });
  }
  addAgenda() {
    const action: Agenda = {
      topic: "",
      actions: [
        {
          text: ""
        }
      ]
    };
    this.agendaActions.push(action);
    console.log(this.agendaActions);
  }
  removeAction(a, aIndex) {
    this.agendaActions = this.agendaActions[a].filter(
      (text, i) => i !== aIndex
    );
    this.savemeeting();
  }
  removeAgenda(aIndex) {
    this.agendaActions = this.agendaActions.filter((text, i) => i !== aIndex);
    this.savemeeting();
  }
  savemeeting() {
    if (!this.currentCard) {
      return;
    }
    store.dispatch("updateActiveCard", {
      id: this.currentCard.id,
      name: this.name,
      location: this.location,
      agendaActions: JSON.stringify(this.agendaActions),
      agendaTopic: this.agendaTopic,
      attendees: JSON.stringify(this.attendees)
    });
  }
}
