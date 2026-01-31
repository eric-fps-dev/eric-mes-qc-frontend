<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <!-- el-upload增加:name="field.options.name"后，会导致又拍云上传失败！故删除之！！ -->
    <el-upload ref="fieldEditor" :disabled="field.options.disabled"
               :style="styleVariables" class="file-upload-widget"
               :action="realUploadURL" :headers="uploadHeaders" :data="uploadData"
               :http-request="customUploadHandler"
               :with-credentials="field.options.withCredentials"
               :multiple="field.options.multipleSelect" :file-list="fileList"
               :show-file-list="field.options.showFileList" :class="{'hideUploadDiv': uploadBtnHidden}"
               :limit="field.options.limit" :on-exceed="handleFileExceed" :before-upload="beforeFileUpload"
               :on-success="handleFileUpload" :on-error="handleUploadError"
               drag
               :accept="acceptTypes">
      <template #default>
        <div class="upload-drag-area">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            {{ i18nt('render.hint.dragFileHere') }} <em>{{ i18nt('render.hint.clickToUpload') }}</em>
          </div>
        </div>
      </template>
      <template #tip>
        <div class="el-upload__tip"
             v-if="!!field.options.uploadTip">{{field.options.uploadTip}}</div>
      </template>
      <template #file="{ file }">
        <div class="upload-file-list">
          <span class="upload-file-name" :title="file.name">{{file.name}}</span>
          <a :href="getAbsoluteFileUrl(file.url)" download="" target="_blank">
            <span class="el-icon-download file-action" :title="i18nt('render.hint.downloadFile')">
              <svg-icon icon-class="el-download" />
            </span></a>
          <span class="file-action" :title="i18nt('render.hint.removeFile')" v-if="!field.options.disabled"
            @click="removeUploadFile(file.name, file.url, file.uid)"><svg-icon icon-class="el-delete" /></span>
        </div>
      </template>
    </el-upload>
  </form-item-wrapper>
</template>

<script>
  import FormItemWrapper from './form-item-wrapper'
  import emitter from '@/utils/emitter'
  import i18n, {translate} from "@/utils/i18n";
  import {deepClone, evalFn} from "@/utils/util";
  import fieldMixin from "@/components/form-designer/form-widget/field-widget/fieldMixin";
  import SvgIcon from "@/components/svg-icon/index";
  import { uploadToMinio, deleteObjectList } from "@/api/minio";
  import { ENV_CONFIG } from "@/utils/env";
  import { UploadFilled } from '@element-plus/icons-vue';

  let selectFileText = "'" + translate('render.hint.selectFile') + "'"

  export default {
    name: "file-upload-widget",
    componentName: 'FieldWidget',  //必须固定为FieldWidget，用于接收父级组件的broadcast事件
    mixins: [emitter, fieldMixin, i18n],
    props: {
      field: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,
      designer: Object,

      designState: {
        type: Boolean,
        default: false
      },

      subFormRowIndex: { /* 子表单组件行索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormColIndex: { /* 子表单组件列索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormRowId: { /* 子表单组件行Id，唯一id且不可变 */
        type: String,
        default: ''
      },

    },
    components: {
      SvgIcon,
      FormItemWrapper,
      UploadFilled,
    },
    data() {
      return {
        oldFieldValue: null, //field组件change之前的值
        fieldModel: [],
        rules: [],

        uploadHeaders: {},
        uploadData: {
          key: '',  //七牛云上传文件名
          //token: '',  //七牛云上传token

          //policy: '',  //又拍云上传policy
          //authorization: '',  //又拍云上传签名
        },
        fileList: [],  //上传文件列表
        uploadBtnHidden: false,

        styleVariables: {
          '--select-file-action': selectFileText,
        },
      }
    },
    computed: {
      realUploadURL() {
        let uploadURL = this.field.options.uploadURL
        if (!!uploadURL && ((uploadURL.indexOf('DSV.') > -1) || (uploadURL.indexOf('DSV[') > -1))) {
          let DSV = this.getGlobalDsv()
          console.log('test DSV: ', DSV)  //防止DSV被打包工具优化！！！
          uploadURL = evalFn(this.field.options.uploadURL, DSV)
        }

        // Prepend API base URL for relative paths
        if (!!uploadURL && uploadURL.startsWith('/') && !uploadURL.startsWith('//')) {
          const apiBaseUrl = import.meta.env.VITE_API_URL || ''
          return apiBaseUrl + uploadURL
        }

        return uploadURL
      },

      acceptTypes() {
        // Generate accept attribute from fileTypes array
        if (this.field.options.fileTypes && this.field.options.fileTypes.length > 0) {
          return this.field.options.fileTypes.map(ext => `.${ext}`).join(',')
        }
        return ''
      },

    },
    beforeCreate() {
      /* 这里不能访问方法和属性！！ */
    },

    created() {
      /* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
         需要在父组件created中初始化！！ */
      this.initFieldModel()
      this.registerToRefList()
      this.initEventHandler()
      this.buildFieldRules()

      this.handleOnCreated()
    },

    mounted() {
      this.handleOnMounted()
    },

    beforeUnmount() {
      this.unregisterFromRefList()
    },

    methods: {
      getAbsoluteFileUrl(url) {
        if (!url) return url

        // Already absolute URL (MinIO or external)
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url
        }

        // Legacy local URL - prepend API base URL
        if (url.startsWith('/') && !url.startsWith('//')) {
          const apiBaseUrl = import.meta.env.VITE_API_URL || ''
          return apiBaseUrl + url
        }

        return url
      },

      async customUploadHandler({ file, onSuccess, onError }) {
        console.log('[MinIO Upload] Starting upload for:', file.name)
        try {
          const response = await uploadToMinio(file)
          console.log('[MinIO Upload] Response:', response)
          // MinIO returns {data: "https://..."} - the URL is directly in data
          const fileUrl = typeof response.data === 'string' ? response.data : (response.data?.objectUrl || response.data?.url || response.url)
          const result = {
            name: file.name,
            url: fileUrl
          }
          onSuccess(result, file)
        } catch (error) {
          console.error('MinIO upload failed:', error)
          onError(error)
        }
      },

      handleFileExceed() {
        let uploadLimit = this.field.options.limit
        this.$message.warning( this.i18nt('render.hint.uploadExceed').replace('${uploadLimit}', uploadLimit) )
      },

      beforeFileUpload(file) {
        let fileTypeCheckResult = false
        let extFileName = file.name.substring(file.name.lastIndexOf('.') + 1)
        if (!!this.field.options && !!this.field.options.fileTypes) {
          let uploadFileTypes = this.field.options.fileTypes
          if (uploadFileTypes.length > 0) {
            fileTypeCheckResult = uploadFileTypes.some( (ft) => {
              return extFileName.toLowerCase() === ft.toLowerCase()
            })
          }
        }
        if (!fileTypeCheckResult) {
          this.$message.error(this.i18nt('render.hint.unsupportedFileType') + extFileName)
          return false;
        }

        let fileSizeCheckResult = false
        let uploadFileMaxSize = 5  //5MB
        if (!!this.field.options && !!this.field.options.fileMaxSize) {
          uploadFileMaxSize = this.field.options.fileMaxSize
        }
        fileSizeCheckResult = file.size / 1024 / 1024 <= uploadFileMaxSize
        if (!fileSizeCheckResult) {
          this.$message.error(this.i18nt('render.hint.fileSizeExceed') + uploadFileMaxSize + 'MB')
          return false;
        }

        this.uploadData.key = file.name
        return this.handleOnBeforeUpload(file)
      },

      handleOnBeforeUpload(file) {
        if (!!this.field.options.onBeforeUpload) {
          let bfFunc = new Function('file', this.field.options.onBeforeUpload)
          let result = bfFunc.call(this, file)
          if (typeof result === 'boolean') {
            return result
          } else {
            return true
          }
        }

        return true
      },

      updateFieldModelAndEmitDataChangeForUpload(fileList, customResult, defaultResult) {
        let oldValue = deepClone(this.fieldModel)
        // Save only the URL string to fieldModel, not the full object
        // Prioritize customResult, then defaultResult - never fall back to fileList (which may have blob URLs)
        let urlToSave = null
        if (!!customResult && !!customResult.url) {
          urlToSave = customResult.url
        } else if (!!defaultResult && !!defaultResult.url) {
          urlToSave = defaultResult.url
        }

        if (urlToSave) {
          this.fieldModel.push(urlToSave)
        } else {
          console.warn('[File Upload] No valid URL found in upload response')
        }

        this.syncUpdateFormModel(this.fieldModel)
        this.emitFieldDataChange(this.fieldModel, oldValue)
      },

      handleFileUpload(res, file, fileList) {
        if (file.status === 'success') {
          let customResult = null
          if (!!this.field.options.onUploadSuccess) {
            let mountFunc = new Function('result', 'file', 'fileList', this.field.options.onUploadSuccess)
            customResult = mountFunc.call(this, res, file, fileList)
          }

          this.updateFieldModelAndEmitDataChangeForUpload(fileList, customResult, res)
          if (!!customResult && !!customResult.name) {
            file.name = customResult.name
          } else {
            file.name = file.name || res.name || res.fileName || res.filename
          }
          if (!!customResult && !!customResult.url) {
            file.url = customResult.url
          } else {
            file.url = file.url || res.url
          }
          this.fileList = deepClone(fileList)
          this.uploadBtnHidden = fileList.length >= this.field.options.limit
        }
      },

      updateFieldModelAndEmitDataChangeForRemove(fileUrl) {
        let oldValue = deepClone(this.fieldModel)
        // fieldModel is an array of URL strings
        const idx = this.fieldModel.indexOf(fileUrl)
        if (idx > -1) {
          this.fieldModel.splice(idx, 1)
        }
        this.syncUpdateFormModel(this.fieldModel)
        this.emitFieldDataChange(this.fieldModel, oldValue)
      },

      async removeUploadFile(fileName, fileUrl, fileUid) {
        let foundIdx = -1
        let foundFile = null
        this.fileList.forEach((file, idx) => {
          if ((file.name === fileName) && ((file.url === fileUrl) || (!!fileUid && file.uid === fileUid))) {
            foundIdx = idx
            foundFile = file
          }
        })

        if (foundIdx >= 0) {
          // NOTE: We intentionally do NOT delete from MinIO storage here.
          // This ensures that old versions of form submissions can still access the files.
          // Files are only removed from the form data (fieldModel), not from storage.

          this.fileList.splice(foundIdx, 1)
          this.updateFieldModelAndEmitDataChangeForRemove(fileUrl)
          this.uploadBtnHidden = this.fileList.length >= this.field.options.limit

          if (!!this.field.options.onFileRemove) {
            let customFn = new Function('file', 'fileList', this.field.options.onFileRemove)
            customFn.call(this, foundFile, this.fileList)
          }
        }
      },

      handleUploadError(err, file, fileList) {
        if (!!this.field.options.onUploadError) {
          let customFn = new Function('error', 'file', 'fileList', this.field.options.onUploadError)
          customFn.call(this, err, file, fileList)
        } else {
          this.$message({
            message: this.i18nt('render.hint.uploadError') + err,
            duration: 3000,
            type: 'error',
          })
        }
      },

    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */

  .full-width-input {
    width: 100% !important;
  }

  .file-upload-widget {
    :deep(.el-upload-dragger) {
      padding: 20px;
      width: 100%;
    }

    .upload-drag-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;

      .el-icon--upload {
        font-size: 48px;
        color: #909399;
        margin-bottom: 8px;
      }

      .el-upload__text {
        color: #606266;
        font-size: 14px;

        em {
          color: $--color-primary;
          font-style: normal;
        }
      }
    }
  }

  .hideUploadDiv {
    :deep(div.el-upload--picture-card) { /* 隐藏最后的图片上传按钮 */
      display: none;
    }

    :deep(.el-upload-dragger) { /* 隐藏drag上传区域 */
      display: none;
    }

    :deep(div.el-upload__tip) { /* 隐藏最后的文件上传按钮提示 */
      display: none;
    }
  }

  .upload-file-list {
    font-size: 12px;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-top: 8px;

    .upload-file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-action {
      color: $--color-primary;
      margin-left: 8px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

</style>
