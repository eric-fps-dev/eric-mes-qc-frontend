<template>
  <div>
    <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 10px">
      {{ translate('FormEdit.title') }} - {{ formTitle }}
    </h2>

    <el-scrollbar height="calc(100vh - 180px)">
      <v-form-render ref="vFormRef" :form-json="templateJson" :form-data="formData" :option-data="optionData" />
    </el-scrollbar>

    <div style="display: flex; justify-content: center; gap: 10px; margin-top: 30px">
      <el-button type="primary" @click="handleSubmit">
        {{ translate('FormEdit.submitChanges') }}
      </el-button>
      <el-button type="warning" @click="handleReset">
        {{ translate('FormEdit.reset') }}
      </el-button>
    </div>
  </div>

  <el-dialog
      v-model="showDialog"
      :title="translate('FormEdit.confirmChangesTitle')"
      width="40%"
      top="15vh"
  >
    <div v-html="tableHtml"></div>

    <template #footer>
      <el-button @click="showDialog = false">{{ translate('common.cancel') }}</el-button>
      <el-button type="primary" @click="submitConfirmed">{{ translate('FormEdit.confirmSubmit') }}</el-button>
    </template>
  </el-dialog>

  <SignaturePadComponent
      v-if="showSignaturePad"
      :visible="showSignaturePad"
      @close="showSignaturePad = false"
      @save="handleSignatureSave"
  />

</template>

<script setup>
import { ref, onMounted } from 'vue';
import VFormRender from '@/components/form-render/index';
import { useRoute } from 'vue-router';
import { getRawMongoDocument } from '@/services/qcTaskSubmissionLogsService';
import { fetchFormTemplate } from '@/services/qcFormTemplateService';
import { ElMessageBox } from 'element-plus';
import { getChangedFields, getLabelMapFromTemplate } from '@/utils/compareFormChanges'
import SignaturePadComponent from '@/components/form-manager/SignaturePad.vue'
import { editFormData } from '@/services/qcFormDataService';
import { getFormTemplateFieldList } from '@/services/qcFormTemplateService';
import {useStore} from "vuex";
import { translate } from '@/utils/i18n';

const route = useRoute();

const templateId = route.query.templateId;
const submissionId = route.query.submissionId;
const createdAt = route.query.createdAt;

const showDialog = ref(false)
const showSignaturePad = ref(false)
const signatureData = ref(null)
const tableHtml = ref('')

const vFormRef = ref(null);
const optionData = ref({});

const formTitle = ref('');
const templateJson = ref({});
const formData = ref({});

const initialSnapshot = ref({});

const optionItemsMap = ref({})
const store = useStore();

onMounted(async () => {
  try {
    const res1 = await fetchFormTemplate(templateId);
    templateJson.value = JSON.parse(res1.data?.data?.form_template_json || '{}');
    formTitle.value = res1.data?.data?.name || translate('FormEdit.defaultFormTitle');

    const optionRes = await getFormTemplateFieldList(templateId);
    optionRes.data.forEach(field => {
      if (field.optionItems) {
        optionItemsMap.value[field.name] = {};
        field.optionItems.forEach(opt => {
          optionItemsMap.value[field.name][opt.value] = opt.label;
        });
      }
    });

    const res2 = await getRawMongoDocument(submissionId, templateId, createdAt);
    initialSnapshot.value = JSON.parse(JSON.stringify(res2.data)); // hard copy for comparison
    console.log("Initial:", initialSnapshot.value)
    formData.value = res2.data;

    vFormRef.value?.setFormJson(templateJson.value);
    vFormRef.value?.setFormData(formData.value);
  } catch (err) {
    console.error(translate('FormEdit.loadFailed'), err);
  }
});

const handleSubmit = async () => {
  try {
    const updatedData = await vFormRef.value.getFormData();
    console.log("Updated:", updatedData)
    const changedKeys = getChangedFields(initialSnapshot.value, updatedData)
        .map(item => item.key);

    if (changedKeys.length === 0) {
      await ElMessageBox.alert(translate('FormEdit.noChangesMessage'), translate('FormEdit.infoTitle'), {type: 'info'});
      return;
    }

    const labelMap = getLabelMapFromTemplate(templateJson.value);

    const htmlTable = `
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px; width: 300px;">${translate('FormEdit.fieldColumn')}</th>
            <th style="border: 1px solid #ccc; padding: 8px; width: 300px;">${translate('FormEdit.originalValueColumn')}</th>
            <th style="border: 1px solid #ccc; padding: 8px; width: 300px;">${translate('FormEdit.currentValueColumn')}</th>
          </tr>
        </thead>
        <tbody>
          ${changedKeys.map(key => {
          const prev = initialSnapshot.value[key];
          const curr = updatedData[key];

          const prevStr = formatValue(prev, key);
          const currStr = formatValue(curr, key);

          return `
              <tr>
                <td style="border: 1px solid #ccc; padding: 15px;">${labelMap[key] || key}</td>
                <td style="border: 1px solid #ccc; padding: 15px;">${prevStr}</td>
                <td style="border: 1px solid #ccc; padding: 8px; color: var(--el-color-primary);">${currStr}</td>
              </tr>
            `;
        }).join('')}
        </tbody>
      </table>
    `;

    tableHtml.value = htmlTable;
    showDialog.value = true;

    console.log('🟢 User confirmed submission, changed fields:', changedKeys);
    // TODO: send updatedData to backend

  } catch (err) {
    console.error('❌ ' + translate('FormEdit.submitFailed') + ':', err);
  }
};

const handleReset = () => {
  ElMessageBox.confirm(
      translate('FormEdit.resetConfirmMessage'),
      translate('FormEdit.resetConfirmTitle'),
      {
        confirmButtonText: translate('common.confirm'),
        cancelButtonText: translate('common.cancel'),
        type: 'warning',
      }
  ).then(() => {
    if (vFormRef.value) {
      const snapshotClone = JSON.parse(JSON.stringify(initialSnapshot.value));
      vFormRef.value.setFormData(snapshotClone);
    }
  }).catch(() => {
    // User cancelled, no action needed
  });
};

const submitConfirmed = async () => {
  showDialog.value = false
  showSignaturePad.value = true // ⬅️ Open signature panel
}

const handleSignatureSave = async (data) => {
  signatureData.value = data;
  showSignaturePad.value = false;
  console.log('🟢 Ready to submit data with signature:', signatureData.value);

  try {
    const updatedData = await vFormRef.value.getFormData();

    // Add the signature data into the updated form (you can customize the key name)
    updatedData['e-signature'] = signatureData.value;

    const userId = store.getters.getUser.id
    const collectionName = getCollectionNameFromCreatedAt(createdAt); // Store to its original collection
    await editFormData(userId, collectionName, submissionId, templateId, updatedData);

    await ElMessageBox.alert(translate('FormEdit.submitSuccessMessage'), translate('FormEdit.successTitle'), {type: 'success'});
    window.close();
    if (window.opener?.refreshQcRecordsTableAfterEditRecord) {
      window.opener.refreshQcRecordsTableAfterEditRecord()
    }
  } catch (error) {
    console.error('❌ ' + translate('FormEdit.submitEditFailed') + ':', error);
    await ElMessageBox.alert(translate('FormEdit.submitFailedMessage'), translate('FormEdit.errorTitle'), {type: 'error'});
  }
};


function formatValue(val, key = '') {
  if (val === null || val === undefined || val === '') return '-';

  // If optionItems exists for this key
  if (optionItemsMap.value[key]) {
    const map = optionItemsMap.value[key];
    if (Array.isArray(val)) {
      return val.map(v => map[v] || v).join(', ');
    } else {
      return map[val] || val;
    }
  }

  // Fallback default
  if (Array.isArray(val)) return val.join(', ');
  return val.toString();
}


function getCollectionNameFromCreatedAt(createdAtString) {
  const date = new Date(createdAtString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `form_template_${templateId}_${year}${month}`;
}

</script>

<style scoped>
</style>
