<template>
  <div>
    <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 10px">
      {{ translate('FormEdit.title') }} - {{ formTitle }}
    </h2>

    <el-scrollbar height="calc(100vh - 180px)">
      <v-form-render ref="vFormRef" :form-json="templateJson" :form-data="formData" :option-data="optionData" />

      <!-- Form Basic Fields Section -->
      <div style="margin-top: 20px; padding: 0 20px;">
        <h4>{{ translate('FormDisplay.formBasicFields') }}</h4>
        <el-form label-width="120px">
          <!-- Related Products -->
          <el-form-item :label="translate('FormDisplay.relatedProducts')">
            <el-select
                v-model="selectedProductIds"
                multiple
                filterable
                clearable
                :placeholder="translate('FormDisplay.selectProducts')"
                style="width: 100%;"
            >
              <el-option
                  v-for="item in productOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>{{ item.name }}</span>
                  <div style="display: flex; align-items: center;">
                    <div>
                          <span style="color: var(--el-text-color-secondary); font-size: 13px;">
                            {{ item.code }}
                          </span>
                      <el-icon
                          class="edit-icon"
                          @click="handleEditProduct(item)"
                          @click.stop
                      >
                        <Edit />
                      </el-icon>
                      <el-popconfirm
                          :title="translate('FormDisplay.deleteProductConfirm')"
                          :confirm-button-text="translate('FormDisplay.deleteButton')"
                          :cancel-button-text="translate('common.cancel')"
                          @confirm="handleDeleteProduct(item.id)"
                          width="250"
                      >
                        <template #reference>
                          <el-icon
                              class="delete-icon"
                              @click.stop
                          >
                            <Close />
                          </el-icon>
                        </template>
                      </el-popconfirm>
                    </div>
                  </div>
                </div>
              </el-option>
              <template #footer>
                <el-button text bg size="small" @click="showAddProductDialog = true">{{ translate('FormDisplay.addNewProduct') }}</el-button>
              </template>
            </el-select>
          </el-form-item>

          <!-- Related Batches -->
          <el-form-item :label="translate('FormDisplay.relatedBatches')">
            <el-select
                v-model="selectedBatchIds"
                multiple
                filterable
                clearable
                :placeholder="translate('FormDisplay.selectBatches')"
                style="width: 100%;"
            >
              <el-option
                  v-for="item in batchOptions"
                  :key="item.id"
                  :label="item.code"
                  :value="item.id"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <span style="color: var(--el-text-color-secondary); font-size: 13px;">
                          {{ item.code }}
                        </span>
                  <div>
                    <el-icon
                        class="edit-icon"
                        @click="handleEditBatch(item)"
                        @click.stop
                    >
                      <Edit />
                    </el-icon>
                    <el-popconfirm
                        :title="translate('FormDisplay.deleteBatchConfirm')"
                        :confirm-button-text="translate('FormDisplay.deleteButton')"
                        :cancel-button-text="translate('common.cancel')"
                        @confirm="handleDeleteBatch(item.id)"
                        width="250"
                    >
                      <template #reference>
                        <el-icon
                            class="delete-icon"
                            @click.stop
                        >
                          <Close />
                        </el-icon>
                      </template>
                    </el-popconfirm>
                  </div>
                </div>
              </el-option>

              <template #footer>
                <el-button text bg size="small" @click="showAddBatchDialog = true">{{ translate('FormDisplay.addNewBatch') }}</el-button>
              </template>
            </el-select>
          </el-form-item>

          <!-- QC Personnel -->
          <el-form-item :label="translate('FormDisplay.qcPersonnel')">
            <el-select
                v-model="selectedInspectorIds"
                multiple
                filterable
                clearable
                :placeholder="translate('FormDisplay.selectQcPersonnel')"
                style="width: 100%;"
            >
              <el-option
                  v-for="user in qcUsers"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
              />
            </el-select>
          </el-form-item>

          <!-- Belonging Shift -->
          <el-form-item :label="translate('FormDisplay.belongingShift')">
            <el-select
                v-model="selectedShiftId"
                filterable
                clearable
                :placeholder="translate('FormDisplay.selectShift')"
                style="width: 100%;"
            >
              <el-option
                  v-for="shift in shifts"
                  :key="shift.id"
                  :label="shift.name"
                  :value="shift.id"
              />
            </el-select>
          </el-form-item>

          <!-- Belonging Team -->
          <el-form-item :label="translate('FormDisplay.belongingTeam')">
            <el-tree-select
                v-model="selectedTeamId"
                :data="teamTreeData"
                :placeholder="translate('FormDisplay.selectTeam')"
                style="width: 100%;"
                check-strictly
                clearable
            />
          </el-form-item>
        </el-form>
      </div>
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

  <el-dialog v-model="showAddProductDialog" :title="translate('FormDisplay.addNewProductTitle')" width="30%">
    <el-form label-width="120px">
      <el-form-item :label="translate('FormDisplay.productName')" required>
        <el-input v-model="newProduct.name" />
      </el-form-item>
      <el-form-item :label="translate('FormDisplay.productCode')" required>
        <el-input v-model="newProduct.code" />
      </el-form-item>
      <el-form-item :label="translate('FormDisplay.description')">
        <el-input v-model="newProduct.description" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showAddProductDialog = false">{{ translate('common.cancel') }}</el-button>
      <el-button type="primary" :disabled="!newProduct.name || !newProduct.code" @click="handleAddProduct">{{ translate('FormDisplay.addButton') }}</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="showAddBatchDialog" :title="translate('FormDisplay.addNewBatchTitle')" width="30%">
    <el-form label-width="120px">
      <el-form-item :label="translate('FormDisplay.batchCode')" required>
        <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
          <el-input v-model="newBatch.code" style="flex: 1;" />
          <el-switch
              v-model="autoGenerateBatchCode"
              inline-prompt
              :active-text="translate('FormDisplay.autoGenerate')"
              :inactive-text="translate('FormDisplay.manual')"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showAddBatchDialog = false">{{ translate('common.cancel') }}</el-button>
      <el-button type="primary" :disabled="!newBatch.code" @click="handleAddBatch">{{ translate('FormDisplay.addButton') }}</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="showEditProductDialog" :title="translate('FormDisplay.editProductTitle')" width="30%">
    <el-form label-width="120px">
      <el-form-item :label="translate('FormDisplay.productName')" required>
        <el-input v-model="editProduct.name" />
      </el-form-item>
      <el-form-item :label="translate('FormDisplay.productCode')" required>
        <el-input v-model="editProduct.code" disabled />
      </el-form-item>
      <el-form-item :label="translate('FormDisplay.description')">
        <el-input v-model="editProduct.description" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showEditProductDialog = false">{{ translate('common.cancel') }}</el-button>
      <el-button type="primary" :disabled="!editProduct.name || !editProduct.code" @click="handleUpdateProduct">{{ translate('FormDisplay.saveButton') }}</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="showEditBatchDialog" :title="translate('FormDisplay.editBatchTitle')" width="30%">
    <el-form label-width="120px">
      <el-form-item :label="translate('FormDisplay.batchCode')" required>
        <el-input v-model="editBatch.code" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showEditBatchDialog = false">{{ translate('common.cancel') }}</el-button>
      <el-button type="primary" :disabled="!editBatch.code" @click="handleUpdateBatch">{{ translate('FormDisplay.saveButton') }}</el-button>
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
import { ref, reactive, onMounted, watch } from 'vue';
import VFormRender from '@/components/form-render/index';
import { useRoute } from 'vue-router';
import { getRawMongoDocument } from '@/services/qcTaskSubmissionLogsService';
import { fetchFormTemplate } from '@/services/qcFormTemplateService';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getChangedFields, getLabelMapFromTemplate } from '@/utils/compareFormChanges'
import SignaturePadComponent from '@/components/form-manager/SignaturePad.vue'
import { editFormData } from '@/services/qcFormDataService';
import { getFormTemplateFieldList } from '@/services/qcFormTemplateService';
import {useStore} from "vuex";
import { translate, translateWithParams } from '@/utils/i18n';
import dayjs from 'dayjs';

// Basic fields imports
import { fetchUsers } from '@/services/userService';
import { getAllShifts } from '@/services/shiftService';
import { getAllTeamTree } from '@/services/teamService';
import {
  getAlActiveSuggestedProducts,
  createSuggestedProduct,
  deleteSuggestedProduct, updateSuggestedProduct
} from '@/services/production/suggestedProductService';
import {
  getAllActiveSuggestedBatches,
  createSuggestedBatch,
  deleteSuggestedBatch, updateSuggestedBatch
} from '@/services/production/suggestedBatchService';
import {Close, Edit} from "@element-plus/icons-vue";

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

// Basic fields options
const productOptions = ref([]);
const batchOptions = ref([]);
const qcUsers = ref([]);
const shifts = ref([]);
const teamTreeData = ref([]);

// Basic fields selected values
const selectedProductIds = ref([]);
const selectedBatchIds = ref([]);
const selectedInspectorIds = ref([]);
const selectedShiftId = ref(null);
const selectedTeamId = ref(null);

// Initial basic fields snapshot for change detection
const initialBasicFields = ref({});

// CRUD related
const showAddProductDialog = ref(false);
const showAddBatchDialog = ref(false);
const showEditProductDialog = ref(false);
const showEditBatchDialog = ref(false);
const newProduct = reactive({ name: '', code: '', description: '' });
const newBatch = reactive({ code: '' });
const editProduct = reactive({ id: null, name: '', code: '', description: '' });
const editBatch = reactive({ id: null, code: '' });
const autoGenerateBatchCode = ref(false);
let userId = store.getters.getUser.id;

onMounted(async () => {
  try {
    // Load form template
    const res1 = await fetchFormTemplate(templateId);
    templateJson.value = JSON.parse(res1.data?.data?.form_template_json || '{}');
    formTitle.value = res1.data?.data?.name || translate('FormEdit.defaultFormTitle');

    // Load option items for form fields
    const optionRes = await getFormTemplateFieldList(templateId);
    optionRes.data.forEach(field => {
      if (field.optionItems) {
        optionItemsMap.value[field.name] = {};
        field.optionItems.forEach(opt => {
          optionItemsMap.value[field.name][opt.value] = opt.label;
        });
      }
    });

    // Load basic field options in parallel
    await Promise.all([
      loadBasicFieldOptions(),
    ]);

    // Load the original document
    const res2 = await getRawMongoDocument(submissionId, templateId, createdAt);
    initialSnapshot.value = JSON.parse(JSON.stringify(res2.data)); // hard copy for comparison
    console.log("Initial:", initialSnapshot.value)
    formData.value = res2.data;

    // Pre-populate basic fields from the document
    selectedProductIds.value = res2.data.related_product_ids || [];
    selectedBatchIds.value = res2.data.related_batch_ids || [];
    selectedInspectorIds.value = res2.data.related_inspector_ids || [];
    selectedShiftId.value = res2.data.related_shift_id || null;
    selectedTeamId.value = res2.data.related_team_id || null;

    // Store initial basic fields for change detection
    initialBasicFields.value = {
      related_product_ids: [...(res2.data.related_product_ids || [])],
      related_batch_ids: [...(res2.data.related_batch_ids || [])],
      related_inspector_ids: [...(res2.data.related_inspector_ids || [])],
      related_shift_id: res2.data.related_shift_id || null,
      related_team_id: res2.data.related_team_id || null,
    };

    vFormRef.value?.setFormJson(templateJson.value);
    vFormRef.value?.setFormData(formData.value);
  } catch (err) {
    console.error(translate('FormEdit.loadFailed'), err);
  }
});

// Load basic field options
const loadBasicFieldOptions = async () => {
  try {
    // Load products and batches
    const [productResp, batchResp, userResp, shiftResp, teamResp] = await Promise.all([
      getAlActiveSuggestedProducts(),
      getAllActiveSuggestedBatches(),
      fetchUsers(),
      getAllShifts(),
      getAllTeamTree(),
    ]);

    productOptions.value = productResp.data || [];
    batchOptions.value = batchResp.data || [];
    qcUsers.value = userResp.data.data || [];
    shifts.value = shiftResp.data.data || [];
    teamTreeData.value = transformTeamTreeToTreeSelectFormat(teamResp.data.data || []);
  } catch (err) {
    console.error('Failed to load basic field options:', err);
  }
};

// Transform team tree to el-tree-select format
function transformTeamTreeToTreeSelectFormat(teams) {
  return teams.map(team => ({
    value: team.id,
    label: team.name,
    children: (team.children || []).map(child => ({
      value: child.id,
      label: child.name
    }))
  }));
}

// Find team name by ID for display purposes
function findTeamNameById(id) {
  let name = '';
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.value === id) {
        name = node.label;
        return;
      }
      if (node.children) traverse(node.children);
    }
  };
  traverse(teamTreeData.value || []);
  return name;
}

const handleSubmit = async () => {
  try {
    const updatedData = await vFormRef.value.getFormData();
    console.log("Updated:", updatedData)

    // Get changed form fields
    const changedFormFields = getChangedFields(initialSnapshot.value, updatedData)
        .map(item => item.key);

    // Get changed basic fields
    const changedBasicFields = getChangedBasicFields();

    const allChangedKeys = [...changedFormFields, ...changedBasicFields];

    if (allChangedKeys.length === 0) {
      await ElMessageBox.alert(translate('FormEdit.noChangesMessage'), translate('FormEdit.infoTitle'), {type: 'info'});
      return;
    }

    const labelMap = {
      ...getLabelMapFromTemplate(templateJson.value),
      // Add basic fields labels
      related_product_ids: translate('FormDisplay.relatedProducts'),
      related_batch_ids: translate('FormDisplay.relatedBatches'),
      related_inspector_ids: translate('FormDisplay.qcPersonnel'),
      related_shift_id: translate('FormDisplay.belongingShift'),
      related_team_id: translate('FormDisplay.belongingTeam'),
    };

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
          ${allChangedKeys.map(key => {
          let prev, curr;

          // Check if it's a basic field
          if (key.startsWith('related_')) {
            prev = initialBasicFields.value[key];
            curr = getCurrentBasicFieldValue(key);

            // Format basic field values (IDs to Names)
            if (key === 'related_product_ids') {
              const formatIds = (ids) => ids ? ids.map(id => productOptions.value.find(p => p.id === id)?.name || id).join(', ') : '-';
              prev = formatIds(prev);
              curr = formatIds(curr);
            } else if (key === 'related_batch_ids') {
              const formatIds = (ids) => ids ? ids.map(id => batchOptions.value.find(b => b.id === id)?.code || id).join(', ') : '-';
              prev = formatIds(prev);
              curr = formatIds(curr);
            } else if (key === 'related_inspector_ids') {
              const formatIds = (ids) => ids ? ids.map(id => qcUsers.value.find(u => u.id === id)?.name || id).join(', ') : '-';
              prev = formatIds(prev);
              curr = formatIds(curr);
            } else if (key === 'related_shift_id') {
              const formatId = (id) => shifts.value.find(s => s.id === id)?.name || id || '-';
              prev = formatId(prev);
              curr = formatId(curr);
            } else if (key === 'related_team_id') {
              const formatId = (id) => findTeamNameById(id) || id || '-';
              prev = formatId(prev);
              curr = formatId(curr);
            }
          } else {
            prev = initialSnapshot.value[key];
            curr = updatedData[key];
          }

          const prevStr = key.startsWith('related_') ? prev : formatValue(prev, key);
          const currStr = key.startsWith('related_') ? curr : formatValue(curr, key);

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

    console.log('🟢 User confirmed submission, changed fields:', allChangedKeys);

  } catch (err) {
    console.error('❌ ' + translate('FormEdit.submitFailed') + ':', err);
  }
};

// Get changed basic fields
function getChangedBasicFields() {
  const changed = [];

  // Compare arrays
  const arraysEqual = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  };

  if (!arraysEqual(initialBasicFields.value.related_product_ids, selectedProductIds.value)) {
    changed.push('related_product_ids');
  }
  if (!arraysEqual(initialBasicFields.value.related_batch_ids, selectedBatchIds.value)) {
    changed.push('related_batch_ids');
  }
  if (!arraysEqual(initialBasicFields.value.related_inspector_ids, selectedInspectorIds.value)) {
    changed.push('related_inspector_ids');
  }
  if (initialBasicFields.value.related_shift_id !== selectedShiftId.value) {
    changed.push('related_shift_id');
  }
  if (initialBasicFields.value.related_team_id !== selectedTeamId.value) {
    changed.push('related_team_id');
  }

  return changed;
}

// Get current basic field value
function getCurrentBasicFieldValue(key) {
  switch (key) {
    case 'related_product_ids': return selectedProductIds.value;
    case 'related_batch_ids': return selectedBatchIds.value;
    case 'related_inspector_ids': return selectedInspectorIds.value;
    case 'related_shift_id': return selectedShiftId.value;
    case 'related_team_id': return selectedTeamId.value;
    default: return null;
  }
}

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
    // Reset form fields
    if (vFormRef.value) {
      const snapshotClone = JSON.parse(JSON.stringify(initialSnapshot.value));
      vFormRef.value.setFormData(snapshotClone);
    }
    // Reset basic fields
    selectedProductIds.value = [...(initialBasicFields.value.related_product_ids || [])];
    selectedBatchIds.value = [...(initialBasicFields.value.related_batch_ids || [])];
    selectedInspectorIds.value = [...(initialBasicFields.value.related_inspector_ids || [])];
    selectedShiftId.value = initialBasicFields.value.related_shift_id;
    selectedTeamId.value = initialBasicFields.value.related_team_id;
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

    // Add the signature data
    updatedData['e-signature'] = signatureData.value;

    // Add basic fields IDs
    updatedData['related_product_ids'] = selectedProductIds.value;
    updatedData['related_batch_ids'] = selectedBatchIds.value;
    updatedData['related_inspector_ids'] = selectedInspectorIds.value;
    updatedData['related_shift_id'] = selectedShiftId.value;
    updatedData['related_team_id'] = selectedTeamId.value;

    // Add readable display values for basic fields
    const selectedProductNames = selectedProductIds.value
        .map(id => productOptions.value.find(p => p.id === id)?.name)
        .filter(Boolean);
    const selectedBatchCodes = selectedBatchIds.value
        .map(id => batchOptions.value.find(b => b.id === id)?.code)
        .filter(Boolean);
    const selectedInspectorNames = selectedInspectorIds.value
        .map(id => qcUsers.value.find(u => u.id === id)?.name)
        .filter(Boolean);
    const selectedShiftName = shifts.value.find(s => s.id === selectedShiftId.value)?.name || '';
    const selectedTeamName = findTeamNameById(selectedTeamId.value);

    updatedData['related_products'] = selectedProductNames.join(', ');
    updatedData['related_batches'] = selectedBatchCodes.join(', ');
    updatedData['related_inspectors'] = selectedInspectorNames.join(', ');
    updatedData['related_shifts'] = selectedShiftName;
    updatedData['related_teams'] = selectedTeamName || '';

    console.log('📦 Submitting updated data with basic fields:', updatedData);

    const userId = store.getters.getUser.id
    const collectionName = getCollectionNameFromCreatedAt(createdAt); // Store to its original collection
    await editFormData(userId, collectionName, submissionId, templateId, updatedData);

    await ElMessageBox.alert(translate('FormEdit.submitSuccessMessage'), translate('FormEdit.successTitle'), {type: 'success'});
    window.close();
    if (window.opener?.refreshQcRecordsTableAfterEditRecord) {
      window.opener.refreshQcRecordsTableAfterEditRecord()
    }
    if (window.opener?.refreshDrilldownDialogAfterEditRecord) {
      window.opener.refreshDrilldownDialogAfterEditRecord()
    }
  } catch (error) {
    console.error('❌ ' + translate('FormEdit.submitEditFailed') + ':', error);
    await ElMessageBox.alert(translate('FormEdit.submitFailedMessage'), translate('FormEdit.errorTitle'), {type: 'error'});
  }
};


// Image file extensions
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

// Check if a URL is an image URL based on extension
function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const lowercaseUrl = url.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lowercaseUrl.includes(`.${ext}`));
}

// Check if a value is an array of file/image URLs
function isFileUrlArray(value) {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(item =>
    typeof item === 'string' &&
    (item.startsWith('http://') || item.startsWith('https://') || item.includes('/files/'))
  );
}

// Extract filename from URL
function getFilenameFromUrl(url) {
  if (!url || typeof url !== 'string') return 'file';
  const parts = url.split('/');
  let filename = parts[parts.length - 1] || 'file';
  // Remove timestamp suffix if present
  filename = filename.replace(/-\d{17}\./, '.');
  return filename;
}

// Format file/image URLs as HTML
function formatFileUrls(urls) {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return '-';

  return urls.map(url => {
    if (isImageUrl(url)) {
      return `<img src="${url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin: 2px; cursor: pointer;" onclick="window.open('${url}', '_blank')" title="${getFilenameFromUrl(url)}" />`;
    } else {
      const filename = getFilenameFromUrl(url);
      return `<a href="${url}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #f5f7fa; border: 1px solid #dcdfe6; border-radius: 4px; margin: 2px; text-decoration: none; color: #409eff; font-size: 12px;">📄 ${filename}</a>`;
    }
  }).join('');
}

function formatValue(val, key = '') {
  if (val === null || val === undefined || val === '') return '-';

  // Check if it's a file/image URL array
  if (isFileUrlArray(val)) {
    return formatFileUrls(val);
  }

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

// CRUD Operations
const handleAddProduct = async () => {
  if (!newProduct.name || !newProduct.code) return;

  // Check if same product code already exists
  const exists = productOptions.value.some(p => p.code === newProduct.code);
  if (exists) {
    ElMessage.error(translateWithParams('FormDisplay.productCodeExists', { code: newProduct.code }));
    return;
  }

  try {
    const resp = await createSuggestedProduct({ ...newProduct, created_by: userId });
    await loadBasicFieldOptions(); // Reload to get the new ID
    // If the API returns the created object, we could optimize, but reloading is safer
    // Try to find the new product to select it
    const created = productOptions.value.find(p => p.code === newProduct.code);
    if (created) {
      selectedProductIds.value.push(created.id);
    }
    
    ElMessage.success(translateWithParams('FormDisplay.productAddSuccess', { name: newProduct.name }));
    showAddProductDialog.value = false;
    Object.assign(newProduct, { name: '', code: '', description: '' });
  } catch (err) {
    console.error(translate('FormDisplay.productAddFailed') + ':', err);
    ElMessage.error(translateWithParams('FormDisplay.productAddFailed', { name: newProduct.name }));
  }
};

const handleAddBatch = async () => {
  if (!newBatch.code) return;

  // Check if same batch code already exists
  const exists = batchOptions.value.some(b => b.code === newBatch.code);
  if (exists) {
    ElMessage.error(translateWithParams('FormDisplay.batchCodeExists', { code: newBatch.code }));
    return;
  }

  try {
    await createSuggestedBatch({ ...newBatch, created_by: userId });
    await loadBasicFieldOptions();
    
    const created = batchOptions.value.find(b => b.code === newBatch.code);
    if (created) {
      selectedBatchIds.value.push(created.id);
    }

    ElMessage.success(translateWithParams('FormDisplay.batchAddSuccess', { code: newBatch.code }));
    showAddBatchDialog.value = false;
    newBatch.code = '';
  } catch (err) {
    console.error(translate('FormDisplay.batchAddFailed') + ':', err);
    ElMessage.error(translateWithParams('FormDisplay.batchAddFailed', { code: newBatch.code }));
  }
};

const handleEditProduct = (product) => {
  Object.assign(editProduct, product);
  showEditProductDialog.value = true;
};

const handleEditBatch = (batch) => {
  Object.assign(editBatch, batch);
  showEditBatchDialog.value = true;
};

const handleUpdateProduct = async () => {
  try {
    await updateSuggestedProduct({ ...editProduct });
    await loadBasicFieldOptions();
    ElMessage.success(translateWithParams('FormDisplay.productUpdateSuccess', { name: editProduct.name }));
    showEditProductDialog.value = false;
  } catch (err) {
    ElMessage.error(translate('FormDisplay.productUpdateFailed'));
    console.error(err);
  }
};

const handleUpdateBatch = async () => {
  try {
    await updateSuggestedBatch({ ...editBatch });
    await loadBasicFieldOptions();
    ElMessage.success(translateWithParams('FormDisplay.batchUpdateSuccess', { code: editBatch.code }));
    showEditBatchDialog.value = false;
  } catch (err) {
    ElMessage.error(translate('FormDisplay.batchUpdateFailed'));
    console.error(err);
  }
};

const handleDeleteProduct = async (id) => {
  try {
    const product = productOptions.value.find(p => p.id === id)
    if (!product) {
      ElMessage.error(translate('FormDisplay.productNotFound'))
      return
    }

    await deleteSuggestedProduct(id)

    // Update local state
    productOptions.value = productOptions.value.filter(item => item.id !== id)
    selectedProductIds.value = selectedProductIds.value.filter(itemId => itemId !== id)

    ElMessage.success(translateWithParams('FormDisplay.productDeleteSuccess', { name: product.name, code: product.code }))
  } catch (err) {
    ElMessage.error(translate('FormDisplay.productDeleteFailed'))
    console.error(translate('common.deleteFailed') + ':', err)
  }
}

const handleDeleteBatch = async (id) => {
  try {
    const batch = batchOptions.value.find(b => b.id === id)
    if (!batch) {
      ElMessage.error(translate('FormDisplay.batchNotFound'))
      return
    }

    await deleteSuggestedBatch(id)

    // Update local state
    batchOptions.value = batchOptions.value.filter(item => item.id !== id)
    selectedBatchIds.value = selectedBatchIds.value.filter(itemId => itemId !== id)

    ElMessage.success(translateWithParams('FormDisplay.batchDeleteSuccess', { code: batch.code }))
  } catch (err) {
    ElMessage.error(translate('FormDisplay.batchDeleteFailed'))
    console.error(translate('common.deleteFailed') + ':', err)
  }
}

const generateBatchCode = () => {
  const today = dayjs().format('YYMMDD');
  let counter = 1;
  let newCode = '';

  do {
    const padded = String(counter).padStart(3, '0');
    newCode = `GY${today}${padded}`;
    counter++;
  } while (batchOptions.value.some(b => b.code === newCode));

  return newCode;
};

watch(autoGenerateBatchCode, (newVal) => {
  if (newVal) {
    newBatch.code = generateBatchCode();
  } else {
    newBatch.code = '';
  }
});

</script>

<style scoped>
.edit-icon {
  font-size: 16px;
  transition: transform 0.2s ease;
  margin-left: 8px;
  color: #409EFF;
  cursor: pointer;
}

.delete-icon {
  font-size: 16px;
  transition: transform 0.2s ease;
  margin-left: 8px;
  color: red;
  cursor: pointer;
}

.edit-icon:hover {
  transform: scale(1.4);
  color: rgb(51.2, 126.4, 204);
}

.delete-icon:hover {
  transform: scale(1.4);
  color: #ff4d4f;
}
</style>