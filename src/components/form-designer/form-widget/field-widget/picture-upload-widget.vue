<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <!-- el-upload增加:name="field.options.name"后，会导致又拍云上传失败！故删除之！！ -->
    <el-upload ref="fieldEditor" :disabled="field.options.disabled"
               :action="realUploadURL" :headers="uploadHeaders" :data="uploadData"
               :http-request="customUploadHandler"
               :with-credentials="field.options.withCredentials"
               :multiple="field.options.multipleSelect" :file-list="fileList" :show-file-list="field.options.showFileList"
               list-type="picture-card" :class="{'hideUploadDiv': uploadBtnHidden}"
               :limit="field.options.limit" :on-exceed="handlePictureExceed"
               :before-upload="beforePictureUpload" :on-preview="handlePictureCardPreview"
               :on-success="handlePictureUpload" :on-error="handleUploadError"
               :accept="acceptTypes" >
      <template #file="{ file }">
        <el-image
          ref="imageRef"
          style="width: 100%; height: 100%"
          :src="getAbsoluteFileUrl(file.url)"
          :preview-src-list="previewList"
          :initial-index="previewIndex"
          fit="cover"
          preview-teleported
        />
        <!-- 上传成功状态 -->
        <label class="el-upload-list__item-status-label">
          <i class="el-icon--upload-success" style="color: #FFF"><svg-icon class="" icon-class="el-check" /></i>
        </label>
        <!-- 图片操作按钮 -->
        <span class="el-upload-list__item-actions">
          <!-- 预览 -->
          <span
            class="el-upload-list__item-preview"
            @click="handlePictureCardPreview(file)"
          >
            <svg-icon icon-class="el-zoom-in" />
          </span>
          <!-- 删除 -->
          <span
            class="el-upload-list__item-delete"
            @click="handlePictureRemove(file)"
          >
            <svg-icon icon-class="el-delete" />
          </span>
        </span>
      </template>
      <template #tip>
        <div class="el-upload__tip"
             v-if="!!field.options.uploadTip">{{field.options.uploadTip}}</div>
      </template>
      <div class="uploader-icon"><svg-icon icon-class="el-plus" /></div>
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

  export default {
    name: "picture-upload-widget",
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
      FormItemWrapper,
      SvgIcon,
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
        fileListBeforeRemove: [],  //删除前的文件列表
        uploadBtnHidden: false,

        previewIndex: 1,  // 初始预览图像索引
      }
    },
    computed: {
      previewList() {
        return this.fileList.map(el => this.getAbsoluteFileUrl(el.url));
      },

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
        // Generate accept attribute from fileTypes array (for images, use image/* prefix)
        if (this.field.options.fileTypes && this.field.options.fileTypes.length > 0) {
          return this.field.options.fileTypes.map(ext => `image/${ext}`).join(',')
        }
        return 'image/*'
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

      handlePictureExceed() {
        let uploadLimit = this.field.options.limit
        this.$message.warning( this.i18nt('render.hint.uploadExceed').replace('${uploadLimit}', uploadLimit) )
      },

      beforePictureUpload(file) {
        let fileTypeCheckResult = false
        if (!!this.field.options && !!this.field.options.fileTypes) {
          let uploadFileTypes = this.field.options.fileTypes
          if (uploadFileTypes.length > 0) {
            fileTypeCheckResult = uploadFileTypes.some( (ft) => {
              return file.type === 'image/' + ft
            })
          }
        }
        if (!fileTypeCheckResult) {
          this.$message.error(this.i18nt('render.hint.unsupportedFileType') + file.type)
          return false;
        }

        let fileSizeCheckResult = false
        let uploadFileMaxSize = 5  //5MB
        if (!!this.field.options && !!this.field.options.fileMaxSize) {
          uploadFileMaxSize = this.field.options.fileMaxSize
        }
        fileSizeCheckResult = file.size / 1024 / 1024 <= uploadFileMaxSize
        if (!fileSizeCheckResult) {
          this.$message.error(this.$('render.hint.fileSizeExceed') + uploadFileMaxSize + 'MB')
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
        // Ensure fieldModel is an array (it may be null if form was loaded with null value)
        if (!Array.isArray(this.fieldModel)) {
          this.fieldModel = []
        }
        let oldValue = deepClone(this.fieldModel)
        // Save only the URL string to fieldModel, not the full object
        // Prioritize customResult, then defaultResult - never fall back to fileList (which has blob URLs)
        let urlToSave = null
        if (!!customResult && !!customResult.url) {
          urlToSave = customResult.url
        } else if (!!defaultResult && !!defaultResult.url) {
          urlToSave = defaultResult.url
        }

        if (urlToSave) {
          this.fieldModel.push(urlToSave)
        } else {
          console.warn('[Picture Upload] No valid URL found in upload response')
        }

        this.syncUpdateFormModel(this.fieldModel)
        this.emitFieldDataChange(this.fieldModel, oldValue)
      },

      handlePictureUpload(res, file, fileList) {
        if (file.status === 'success') {
          let customResult = null
          if (!!this.field.options.onUploadSuccess) {
            let customFn = new Function('result', 'file', 'fileList', this.field.options.onUploadSuccess)
            customResult = customFn.call(this, res, file, fileList)
          }

          this.updateFieldModelAndEmitDataChangeForUpload(fileList, customResult, res)
          // Update file.url with the MinIO URL before cloning (same as file-upload-widget)
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
        // Ensure fieldModel is an array
        if (!Array.isArray(this.fieldModel)) {
          this.fieldModel = []
        }
        let oldValue = deepClone(this.fieldModel)
        // fieldModel is an array of URL strings
        const idx = this.fieldModel.indexOf(fileUrl)
        if (idx > -1) {
          this.fieldModel.splice(idx, 1)
        }

        this.syncUpdateFormModel(this.fieldModel)
        this.emitFieldDataChange(this.fieldModel, oldValue)
      },

      handleBeforeRemove(fileList) {
        /* 保留删除之前的文件列表！！ */
        this.fileListBeforeRemove = deepClone(fileList)
      },

      async handlePictureRemove(file) {
        this.handleBeforeRemove(this.fileList) // 由于自定义了 #file slot，需要手动调用 handleBeforeRemove，并移除 @before-remove 和 @remove

        const fileUrl = file.url

        // NOTE: We intentionally do NOT delete from MinIO storage here.
        // This ensures that old versions of form submissions can still display the images.
        // Files are only removed from the form data (fieldModel), not from storage.

        this.fileList.splice(this.fileList.indexOf(file), 1) // 删除所点击的文件
        this.updateFieldModelAndEmitDataChangeForRemove(fileUrl)
        let fileList = deepClone(this.fileList); // 进行深拷贝，避免用户自定义函数对 fileList 进行修改时，影响组件内的数据
        this.uploadBtnHidden = fileList.length >= this.field.options.limit

        if (!!this.field.options.onFileRemove) {
          let customFn = new Function('file', 'fileList', this.field.options.onFileRemove)
          customFn.call(this, file, fileList)
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

      handlePictureCardPreview({ url }) {
        // 设置图片索引为当前点击的图片
        this.previewIndex = this.previewList.indexOf(url)
        // 模拟点击 <el-image> 组件下的 img 标签（点击事件被绑定在的每张 img 上）
        this.$refs['imageRef'].$el.children[0].click()
      }

    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */

  .full-width-input {
    width: 100% !important;
  }

  .hideUploadDiv {
    :deep(div.el-upload--picture-card) { /* 隐藏最后的图片上传按钮 */
      display: none;
    }

    :deep(div.el-upload--text) { /* 隐藏最后的文件上传按钮 */
      display: none;
    }

    :deep(div.el-upload__tip) { /* 隐藏最后的文件上传按钮提示 */
      display: none;
    }
  }

  .uploader-icon {
    height: 100%;
    display: flex;
    color: #8c939d;
    font-size: 28px;
    justify-content: center;
    align-items: center;
  }

</style>


