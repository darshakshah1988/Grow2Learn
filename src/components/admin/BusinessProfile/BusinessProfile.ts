import { Component, Prop, Vue, Watch, Inject } from "vue-property-decorator";
import { State, Getter, Mutation } from "vuex-class";
import * as vue2Dropzone from "vue2-dropzone";
import { ProgressBar } from "../../shared/ProgressBar";
import { Breadcrumbs } from "../Breadcrumbs";
import { BASE_URL } from "../../../constants";
import { StudentTile } from "../StudentTile";

import "./BusinessProfile.scss";
import store from "../../../store";
import Axios from "axios";

const crumbs = () => [
  {
    label: "Your students",
    link: "/dashboard"
  }
];

@Component({
  template: require("./BusinessProfile.html"),
  name: "BusinessProfile",
  components: {
    StudentTile,
    ProgressBar,
    vueDropzone: vue2Dropzone
  }
})
export class BusinessProfile extends Vue {
  @State courses;
  @State breadcrumbs;
  @State activeBusinessProfile;

  editing = false;
  showDocModal = false;
  docUploadPercent = 0;
  docIsUploading = false;
  businessName = "";
  businessId = "";
  docs = [];
  @Inject() toggleModal;

  loaded = false;

  $refs: {
    businessName: HTMLTextAreaElement;
    docDropzone: any;
  };

  docDropzoneOptions = {
    url: BASE_URL + "/admin/document/upload",
    thumbnailWidth: 150,
    paramName: "docs",
    maxFiles: 1,
    maxFilesize: 5, // mb
    timeout: 99999999,
    uploadprogress: this.docUploadProgress,
    acceptedFiles: ".jpeg,.jpg,.png,.doc,.pdf",
    error: function(file, message, xhr) {
      if (xhr == null) this.removeFile(file); // perhaps not remove on xhr errors
      alert(message);
    }
  };

  docUploadProgress(file, percent, size) {
    this.docUploadPercent = Math.round(percent);
  }

  docSuccess(file) {
    const payload = {
      // courseId: parseInt(route.params.courseId),
      // unitId: parseInt(this.route.params.unitId),
      // cardId: parseInt(this.route.params.cardId),
      file: {
        name: file.name,
        type: "audio"
      }
    };
    console.log("payload", payload);

    this.docIsUploading = false;
    this.$refs.docDropzone.removeAllFiles(true);
    Axios.get(BASE_URL + "/admin/document/" + this.businessId).then(d => {
      this.docs = d.data;
    });
    this.showDocModal = false;
  }

  deleteFile(fileId: string) {
    Axios.delete(BASE_URL + "/admin/document/" + fileId).then(d => {
      Axios.get(BASE_URL + "/admin/document/" + this.businessId).then(d => {
        this.docs = d.data;
      });
      alert("File deleted successfully");
    });
  }
  docSendingEvent(file, xhr, formData) {
    this.docIsUploading = true;
    formData.append("businessId", this.businessId);
    formData.append("size", file.size);
    formData.append("type", file.type);
  }

  checkDocType(type) {
    if (type.indexOf("pdf") > -1) {
      return "pdf";
    } else if (type.indexOf("msword") > -1) {
      return "doc";
    } else {
      return "image";
    }
  }

  @Watch("$route", { deep: true })
  watchRoute(newVal, oldVal) {
    this.updateRoute(newVal);
  }

  @Watch("activeBusinessProfile", { deep: true })
  watchBusinessProfile(newVal, oldVal) {
    if (newVal) {
      this.loaded = true;
      this.businessName = newVal.name;
    }
  }

  updateRoute(route) {
    const { params } = route;
    this.businessId = params.businessId;
    Axios.get(BASE_URL + "/admin/document/" + params.businessId).then(d => {
      this.docs = d.data;
    });
    store.dispatch("getBusinessProfile", parseInt(params.businessId));
  }

  confirmRemoveCourse(courseId) {
    store.commit("set", {
      key: "removeBusinessCourseId",
      value: courseId
    });
    this.toggleModal("removeBusinessCourse");
  }

  mounted() {
    this.updateRoute(this.$route);
  }

  edit() {
    this.editing = true;
    this.$nextTick(() => {
      this.$refs.businessName.select();
    });
  }

  cancel() {
    this.businessName = this.activeBusinessProfile.name;
    this.editing = false;
  }

  togleDocModal() {
    if (this.docs.length < 4) {
      this.showDocModal = !this.showDocModal;
    } else {
      alert("You can't upload more then 4 documents");
    }
  }
  save() {
    store
      .dispatch("editBusinessName", {
        businessId: this.activeBusinessProfile.id,
        name: this.businessName
      })
      .then(() => {
        this.editing = false;
        store.dispatch(
          "getBusinessProfile",
          parseInt(this.$route.params.businessId)
        );
      });
  }
}
