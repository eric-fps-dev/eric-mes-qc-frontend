<template>
  <div>
    <el-form-item label-width="0">
      <el-divider class="custom-divider">{{i18nt('designer.setting.uploadSetting')}}</el-divider>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.uploadURL')">
      <el-input type="text" v-model="optionModel.uploadURL" disabled></el-input>
      <div class="upload-hint">Files are stored in MinIO object storage</div>
    </el-form-item>
  </div>
</template>

<script>
  import i18n from "@/utils/i18n"

  export default {
    name: "uploadURL-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
  }
</script>

<style scoped>
.upload-hint {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
}
</style>
