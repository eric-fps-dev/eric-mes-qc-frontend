<template>
  <el-form-item>
    <template #label>
      <span>{{i18nt('designer.setting.fileTypes')}}
        <el-tooltip effect="light" :content="i18nt('designer.setting.fileTypesHelp')">
          <svg-icon icon-class="el-info" /></el-tooltip>
      </span>
    </template>
    <el-select multiple allow-create filterable default-first-option
               v-model="optionModel.fileTypes" style="width: 100%">
      <el-option v-for="(ft, ftIdx) in uploadFileTypes"
                 :key="ftIdx"
                 :label="ft.label"
                 :value="ft.value">
      </el-option>
    </el-select>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"
  import SvgIcon from "@/components/svg-icon/index";

  export default {
    name: "file-upload-fileTypes-editor",
    mixins: [i18n],
    components: {
      SvgIcon
    },
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    data() {
      return {
        uploadFileTypes: [
          /* Documents */
          {value: 'doc', label: 'doc'},
          {value: 'docx', label: 'docx'},
          {value: 'xls', label: 'xls'},
          {value: 'xlsx', label: 'xlsx'},
          {value: 'ppt', label: 'ppt'},
          {value: 'pptx', label: 'pptx'},
          {value: 'pdf', label: 'pdf'},
          {value: 'txt', label: 'txt'},
          {value: 'rtf', label: 'rtf'},
          {value: 'odt', label: 'odt'},
          {value: 'ods', label: 'ods'},
          {value: 'odp', label: 'odp'},
          /* Data formats */
          {value: 'csv', label: 'csv'},
          {value: 'json', label: 'json'},
          {value: 'xml', label: 'xml'},
          {value: 'yaml', label: 'yaml'},
          {value: 'yml', label: 'yml'},
          /* Archives */
          {value: 'zip', label: 'zip'},
          {value: 'rar', label: 'rar'},
          {value: '7z', label: '7z'},
          {value: 'tar', label: 'tar'},
          {value: 'gz', label: 'gz'},
          /* Video */
          {value: 'mp4', label: 'mp4'},
          {value: 'avi', label: 'avi'},
          {value: 'mov', label: 'mov'},
          {value: 'wmv', label: 'wmv'},
          {value: 'flv', label: 'flv'},
          {value: 'mkv', label: 'mkv'},
          {value: 'webm', label: 'webm'},
          {value: 'm4v', label: 'm4v'},
          {value: 'mpeg', label: 'mpeg'},
          {value: 'mpg', label: 'mpg'},
          {value: '3gp', label: '3gp'},
          /* Audio */
          {value: 'mp3', label: 'mp3'},
          {value: 'wav', label: 'wav'},
          {value: 'flac', label: 'flac'},
          {value: 'aac', label: 'aac'},
          {value: 'ogg', label: 'ogg'},
          {value: 'wma', label: 'wma'},
          {value: 'm4a', label: 'm4a'},
          /* Images */
          {value: 'jpg', label: 'jpg'},
          {value: 'jpeg', label: 'jpeg'},
          {value: 'png', label: 'png'},
          {value: 'gif', label: 'gif'},
          {value: 'bmp', label: 'bmp'},
          {value: 'webp', label: 'webp'},
          {value: 'svg', label: 'svg'},
          /* CAD/Design */
          {value: 'dwg', label: 'dwg'},
          {value: 'dxf', label: 'dxf'},
          {value: 'ai', label: 'ai'},
          {value: 'psd', label: 'psd'},
          {value: 'eps', label: 'eps'},
        ],
      }
    }
  }
</script>

<style scoped>

</style>
