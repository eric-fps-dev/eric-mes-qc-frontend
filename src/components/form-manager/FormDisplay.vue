<template>
  <div v-if="formId">
    <div class="header-container">
      <div style="display: flex; align-items: center;">
        <h1 class="form-title" style="margin-right: 10px">{{ props.currentForm?.label || formTitle }}</h1>
        <el-switch
            v-model="enable_form"
            v-if="switchDisplayed"
            v-show="!props.accessByTeam"
            inline-prompt
            :active-text="translate('FormDisplay.available')"
            :inactive-text="translate('FormDisplay.unavailable')"
        />
      </div>

      <div>

      <template v-if="switchDisplayed" v-show="!props.accessByTeam">
        <el-button type="success" @click="openRecipeDrawer">
          {{ translate('FormDisplay.setAlertValues') }}
        </el-button>

        <el-button type="primary" @click="openApprovalDialog">
          {{ translate('FormDisplay.editApprovalFlow') }}
        </el-button>


        <!--        <el-button type="primary" v-if="switchDisplayed" @click="handleQuickDispatch">-->
<!--          {{ translate('FormDisplay.quickDispatch') }}-->
<!--        </el-button>-->
      </template>

<!--      <el-button type="success" v-if="props.accessByTeam" @click="openQcRecordsDialog" style="margin-left: 10px">-->
<!--        {{ translate('FormDataSummary.viewRecords') }}-->
<!--      </el-button>-->

        <el-button
            type="info"
            @click="saveDraft"
            v-show="props.accessByTeam"
        >
          {{ translate('FormDisplay.saveDraft') }}
        </el-button>

<!--        <el-button-->
<!--            v-if="props.accessByTeam !== null"-->
<!--            type="success"-->
<!--            @click="loadDraft"-->
<!--        >-->
<!--          Load Draft-->
<!--        </el-button>-->

        <el-button
            type="primary"
            v-if="props.accessByTeam"
            @click="prepareSecureAction('view')"
            style="margin-left: 10px"
        >
          {{ translate('FormDataSummary.viewRecords') }}
        </el-button>

        <el-button
            type="success"
            v-if="props.accessByTeam"
            @click="prepareSecureAction('export')"
            style="margin-left: 10px"
        >
          {{ translate('FormDisplay.exportSummary') }}
        </el-button>


      </div>

      <el-countdown
          v-if="remainingTime > 0"
          :value="countdownEndTime"
          format="HH:mm:ss"
      >
        <template #title>
          <span style="font-weight: bold; font-size: 15px">{{ translate('FormDisplay.countdownTitle') }}</span>
        </template>
      </el-countdown>

    </div>
    <el-scrollbar :height="scrollBarHeight" width="100%">
      <v-form-render :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef" />

      <div>

        <h4>{{ translate('FormDisplay.formBasicFields') }}</h4>
        <!-- Common fields: select products and batches -->
        <div style="margin-top: 20px;">
          <el-form label-width="120px">
            <el-form-item :label="translate('FormDisplay.relatedProducts')">
              <el-select
                    v-model="selectedProductCodes"
                    multiple
                    filterable
                    clearable
                    :placeholder="translate('FormDisplay.selectProducts')"
                    style="width: 100%;"
                    :disabled="!(enable_form || enable_common_fields)"
                >
                  <el-option
                      v-for="item in productOptions"
                      :key="item.code"
                      :label="item.name"
                      :value="item.code"
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
                              @confirm="handleDeleteProduct(item.code)"
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

            <el-form-item :label="translate('FormDisplay.relatedBatches')">
                  <el-select
                      v-model="selectedBatchCodes"
                      multiple
                      filterable
                      clearable
                      :placeholder="translate('FormDisplay.selectBatches')"
                      style="width: 100%;"
                      :disabled="!(enable_form || enable_common_fields)"
                  >
                    <el-option
                        v-for="item in batchOptions"
                        :key="item.code"
                        :label="item.code"
                        :value="item.code"
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
                              @confirm="handleDeleteBatch(item.code)"
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

                <!-- Added: QC Personnel -->
                <el-form-item :label="translate('FormDisplay.qcPersonnel')">
                  <el-select
                      v-model="selectedQcUserIds"
                      multiple
                      filterable
                      clearable
                      :placeholder="translate('FormDisplay.selectQcPersonnel')"
                      style="width: 100%;"
                      :disabled="!(enable_form || enable_common_fields)"
                  >
                    <el-option
                        v-for="user in qcUsers"
                        :key="user.id"
                        :label="user.name"
                        :value="user.id"
                    />
                  </el-select>
                </el-form-item>

                <!-- Added: Belonging Shift -->
                <el-form-item :label="translate('FormDisplay.belongingShift')">
                  <el-select
                      v-model="selectedShift"
                      filterable
                      clearable
                      :placeholder="translate('FormDisplay.selectShift')"
                      style="width: 100%;"
                      :disabled="!(enable_form || enable_common_fields)"
                  >
                    <el-option
                        v-for="shift in shifts"
                        :key="shift.id"
                        :label="shift.name"
                        :value="shift.name"
                    />
                  </el-select>
                </el-form-item>

                <!-- Added: Belonging Team -->
              <el-form-item :label="translate('FormDisplay.belongingTeam')">
                <el-tree-select
                    v-model="selectedTeamId"
                    :data="teamTreeData"
                    :placeholder="translate('FormDisplay.selectTeam')"
                    style="width: 100%;"
                    check-strictly
                    clearable
                    :disabled="!(enable_form || enable_common_fields)"
                />
              </el-form-item>

          </el-form>
        </div>

        <!-- Signature Buttons and Display -->
        <div style="margin-bottom: 20px; text-align: left;">
          <el-button type="primary" @click="showSignaturePad = true" :disabled="!(enable_form || enable_common_fields)">
            {{ translate('FormDisplay.eSignature') }}
          </el-button>

          <el-button v-if="signatureData !== null" type="info" @click="handleSignatureClear" :disabled="!(enable_form || enable_common_fields)">
            {{ translate('FormDisplay.clearSignature') }}
          </el-button>
          <div v-if="signatureData" class="signature-preview">
            <img :src="signatureData" :alt="translate('FormDisplay.signatureImage')" class="signature-image"/>
          </div>
        </div>

        <!-- Submit and Reset Form Buttons (Center-Aligned) -->
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
          <el-button type="primary" v-if="props.usable || enable_form" @click="submitForm">
            {{ translate('FormDisplay.submit') }}
          </el-button>

          <el-button type="warning" v-if="props.usable || enable_form" @click="showClearConfirmation = true">
            {{ translate('FormDisplay.reset') }}
          </el-button>
        </div>

        <SignaturePadComponent
            v-if="showSignaturePad"
            :visible="showSignaturePad"
            @close="showSignaturePad = false"
            @save="handleSignatureSave"
            @clear="handleSignatureClear"
        />
      </div>

      <p class="node-id">Node ID: {{ props.currentForm?.id || 'Unneeded info for you' }}</p>
      <p class="node-id">QC Template Form ID: {{ props.currentForm?.qcFormTemplateId || route.params.qcFormTemplateId || 'N/A' }}</p>
    </el-scrollbar>

  </div>

  <el-dialog
      v-model="showQuickDispatch"
      :title="translate('FormDisplay.quickDispatchDialogTitle')"
      width="50%"
      @close="showQuickDispatch = false"
  >
    <QuickDispatch
        :visible.sync="showQuickDispatch"
        :qcFormTreeNodeId="props.currentForm?.id"
        @close="showQuickDispatch = false"
        @dispatch="handleDispatch"
    />
  </el-dialog>

  <el-dialog
      v-model="showConfirmation"
      :title="translate('FormDisplay.confirmSubmissionTitle')"
      width="30%"
      :before-close="cancelSubmission"
  >
    <span>{{ translate('FormDisplay.confirmSubmissionMessage') }}</span>
    <template #footer>
      <el-button @click="cancelSubmission">{{ translate('FormDisplay.cancel') }}</el-button>
      <el-button type="primary" @click="confirmSubmission">{{ translate('FormDisplay.confirm') }}</el-button>
    </template>
  </el-dialog>

  <el-dialog
      v-model="showResetConfirmation"
      :title="translate('FormDisplay.submissionSuccessTitle')"
      width="30%"
      :before-close="cancelReset"
  >
    <span>{{ translate('FormDisplay.submissionSuccessMessage') }}</span>
    <template #footer>
      <el-button @click="cancelReset">{{ translate('FormDisplay.no') }}</el-button>
      <el-button type="primary" @click="confirmReset">{{ translate('FormDisplay.yes') }}</el-button>
    </template>
  </el-dialog>

  <el-dialog
      v-model="showClearConfirmation"
      :title="translate('FormDisplay.resetConfirmTitle')"
      width="30%"
      :before-close="cancelClear"
  >
    <span>{{ translate('FormDisplay.resetConfirmMessage') }}</span>
    <template #footer>
      <el-button @click="cancelClear">{{ translate('FormDisplay.cancel') }}</el-button>
      <el-button type="warning" @click="confirmClear">{{ translate('FormDisplay.confirm') }}</el-button>
    </template>
  </el-dialog>

  <el-dialog
      v-model="showCountdownEnded"
      :title="translate('FormDisplay.countdownEndedTitle')"
      width="30%"
      :before-close="closeCountdownEnded"
  >
    <span>{{ translate('FormDisplay.countdownEndedMessage') }}</span>
    <template #footer>
      <el-button type="warning" @click="closeCountdownEnded">{{ translate('FormDisplay.confirm') }}</el-button>
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

  <el-drawer
      v-model="showRecipeDrawer"
      :title="translate('FormDisplay.setAlertValues')"
      direction="ltr"
      size="100%"
      :with-header="true"
      :close-on-click-modal="false"
      :modal="false"
      id="recipe_setting"
  >
    <RecipeSetting :qcFormTemplateId="props.currentForm?.qcFormTemplateId || route.params.qcFormTemplateId" />

  </el-drawer>

<!--  <QcRecordsTable-->
<!--      v-if="props.accessByTeam"-->
<!--      :visible="qcRecordsDialogVisible"-->
<!--      :loading="loadingQcRecords"-->
<!--      :form-label="props.currentForm?.label"-->
<!--      :paginated-qc-records="qcRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize)"-->
<!--      :displayed-column-headers="reorderedColumnHeaders"-->
<!--      :total="qcRecords.length"-->
<!--      v-model:visible="qcRecordsDialogVisible"-->
<!--      :shortcuts="[]"-->
<!--      :table-height="qcRecordsTableHeight"-->
<!--      @close="qcRecordsDialogVisible = false"-->
<!--      @page-change="currentPage = $event"-->
<!--  />-->

  <QcRecordsDialog
      v-model:visible="qcRecordsDialogVisible"
      :selectedForm="props.currentForm"
      :dateRange="[getStartOfMonth(), getEndOfMonth()]"
  />

  <PasswordPrompt
      v-model="showPasswordDialog"
      @verified="handlePasswordVerified"
  />

  <EditApprovalFlowDialog
      v-if="selectedApprovalType"
      :visible="showApprovalDialog"
      :template-id="props.currentForm?.qcFormTemplateId"
      :initial-approval-type="selectedApprovalType"
      @update-success="handleApprovalUpdated"
      @update:visible="val => showApprovalDialog = val"
  />

  <ExportDocumentDialog
      v-if="selectedTeamId !== null"
      v-model:visible="exportDialogVisible"
      :default-team-id=selectedTeamId
      :default-date-range="[new Date(), new Date()]"
  />
</template>

<script setup>
import { onBeforeRouteLeave } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {ref, reactive, watch, onMounted, onUnmounted, nextTick, computed} from 'vue'
import {translate, translateWithParams} from "@/utils/i18n";
import { useStore } from 'vuex'
import {ElMessage} from 'element-plus'
import VFormRender from '@/components/form-render/index'
import { useRoute } from 'vue-router'
import testFormJsonData from '@/tests/form_json_data.json'; // Import the JSON data - original code
import api from '@/services/api'
import { fetchFormTemplate } from '@/services/qcFormTemplateService.js';
import { insertFormData } from '@/services/qcFormDataService.js';
import QuickDispatch from "@/components/dispatch/QuickDispatch.vue";
import {insertTaskSubmissionLog} from "@/services/qcTaskSubmissionLogsService";
import PasswordPrompt from '@/components/common/PasswordPrompt.vue';
import dayjs from 'dayjs';
import dispatchedTaskList from "@/components/dispatch/DispatchedTaskList.vue";
import SignaturePadComponent from "@/components/form-manager/SignaturePad.vue";
import { windowMaskVisible } from '@/globals/mask'
import { updateApprovalType } from '@/services/qcFormTemplateService.js';
const showEditProductDialog = ref(false);
const showEditBatchDialog = ref(false);
const editProduct = reactive({ id: null, name: '', code: '', description: '' });
const editBatch = reactive({ id: null, code: '' });
const teamTreeData = ref([]);
import { fetchUsers } from '@/services/userService'
import { getAllShifts } from '@/services/shiftService'
import QcRecordsDialog from "@/components/common/QcRecordsDialog.vue"
import { getAllTeamTree, getTeamByTeamLeadId } from '@/services/teamService';
const showApprovalDialog = ref(false)
const secureAction = ref(null); // dealing with the second password prompt
import ExportDocumentDialog from '@/components/export/ExportDocumentDialog.vue'
import soundEffect from '@/assets/sound_effect.mp3'; // Import your audio file
import RecipeSetting from "@/components/form-manager/RecipeSetting.vue";
import { saveFormDraftForUser, loadFormDraftForUser, clearDraftForUser } from '@/utils/formDraftStorage';

// Common submit functionality imports
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

const showRecipeDrawer = ref(false)
const qcRecordsDialogVisible = ref(false);
const qcRecords = ref([]);
const reorderedColumnHeaders = ref([]);
const loadingQcRecords = ref(true);
const currentPage = ref(1);
const pageSize = 15;
const showPasswordDialog = ref(false);
const exportDialogVisible = ref(false);

const qcUsers = ref([])
const selectedQcUserIds = ref([]) // Store selected QC personnel IDs

const shifts = ref([])
const selectedShift = ref('') // Store selected shift name

const route = useRoute()
const rt = ref(parseInt(route.query.rt, 10) || 0);
const showCountdownEnded = ref(false);

const showSignaturePad = ref(false);
const signatureData = ref(null);
const otherElementsHeight = 210;
const qcRecordsTableHeight = ref(window.innerHeight - otherElementsHeight);

// Common fields
const productOptions = ref([]);
const batchOptions = ref([]);
const selectedProductCodes = ref([]);
const selectedBatchCodes = ref([]);

// Store final ID values (mapped from codes)
const selectedProductIds = ref([]);
const selectedBatchIds = ref([]);
const selectedShiftId = ref(null);

const showAddProductDialog = ref(false);
const showAddBatchDialog = ref(false);
const newProduct = reactive({ name: '', code: '', description: '' });
const newBatch = reactive({ code: '' });
const autoGenerateBatchCode = ref(false);
const selectedApprovalType = ref() // default fallback

// team
const selectedTeamId = ref(null);
const teamOptions = ref([]);

const handleSignatureSave = (data) => {
  signatureData.value = data; // Save the base64 image data here
  showSignaturePad.value = false; // Close the signature pad after saving
};

const handleSignatureClear = () => {
  signatureData.value = null; // Clear the preview when cleared from the pad
};

const handleViewRecords = () => {
  if (userRole.id === 3) {
    showPasswordDialog.value = true;
  } else {
    openQcRecords()
  }
};

const handleApprovalUpdated = (newVal) => {
  selectedApprovalType.value = newVal
  ElMessage.success(translate('FormDisplay.approvalFlowUpdated'))
}

const openQcRecords = () => {
  qcRecordsDialogVisible.value = true;
};

const openApprovalDialog = () => {
  showApprovalDialog.value = true
}

const updateTableHeight = () => {
  qcRecordsTableHeight.value = window.innerHeight - otherElementsHeight;
};

const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
};

const getEndOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
};


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


// Countdown time setup
const remainingTime = ref(rt.value);
const countdownEndTime = computed(() => Date.now() + remainingTime.value * 1000);
let countdownInterval = null; // Store the interval ID

const props = defineProps({
  currentForm: {
    type: Object,
    required: true,
  },
  usable: {
    type: Boolean,
    default: true,
  },
  qcFormTemplateId: {
    type: String,
    required: false // Make it optional
  },
  dispatchedTaskId: {
    type: String,
    required: false // Make it optional
  },
  formSwitched: { // Add formSwitched prop to detect switching
    type: Boolean,
    default: false,
  },
  accessByTeam: {
    type: Number,
    required: false,
    default: null,
  }
});

const BASIC_FIELDS_STORAGE_PREFIX = 'qc:pending-tasks:basic-fields:'
const BASIC_FIELDS_STORAGE_KEY = `${BASIC_FIELDS_STORAGE_PREFIX}global`
const legacyBasicFieldsStorageKey = computed(() => {
  const templateId = props.currentForm?.qcFormTemplateId || route.params.qcFormTemplateId
  return templateId ? `${BASIC_FIELDS_STORAGE_PREFIX}${templateId}` : null
})

const getBrowserStorage = () => {
  try {
    return window?.localStorage || window?.sessionStorage || null
  } catch {
    return null
  }
}

const hydrateBasicFieldsFromStorage = () => {
  const storage = getBrowserStorage()
  if (!storage) return

  let parsed = null
  try {
    parsed = JSON.parse(storage.getItem(BASIC_FIELDS_STORAGE_KEY) || 'null')
  } catch {
    parsed = null
  }
  if ((!parsed || typeof parsed !== 'object') && legacyBasicFieldsStorageKey.value) {
    try {
      parsed = JSON.parse(storage.getItem(legacyBasicFieldsStorageKey.value) || 'null')
    } catch {
      parsed = null
    }
  }
  if (!parsed || typeof parsed !== 'object') return

  if (Array.isArray(parsed.productCodes)) selectedProductCodes.value = parsed.productCodes
  if (Array.isArray(parsed.batchCodes)) selectedBatchCodes.value = parsed.batchCodes
  if (Array.isArray(parsed.qcUserIds)) selectedQcUserIds.value = parsed.qcUserIds
  if (typeof parsed.shiftName === 'string') selectedShift.value = parsed.shiftName
  if (parsed.teamId !== undefined && parsed.teamId !== null && parsed.teamId !== '') {
    const teamIdNum = Number(parsed.teamId)
    selectedTeamId.value = Number.isFinite(teamIdNum) ? teamIdNum : parsed.teamId
  }
}

let basicFieldsSaveTimeout = null
const saveBasicFieldsToStorage = () => {
  const storage = getBrowserStorage()
  if (!storage) return

  if (basicFieldsSaveTimeout) clearTimeout(basicFieldsSaveTimeout)
  basicFieldsSaveTimeout = setTimeout(() => {
    try {
      storage.setItem(
        BASIC_FIELDS_STORAGE_KEY,
        JSON.stringify({
          productCodes: selectedProductCodes.value,
          batchCodes: selectedBatchCodes.value,
          qcUserIds: selectedQcUserIds.value,
          shiftName: selectedShift.value,
          teamId: selectedTeamId.value,
        })
      )
    } catch {
      // Ignore quota / storage failures
    }
  }, 50)
}

onMounted(() => hydrateBasicFieldsFromStorage())

watch(
  () => ({
    productCodes: selectedProductCodes.value,
    batchCodes: selectedBatchCodes.value,
    qcUserIds: selectedQcUserIds.value,
    shiftName: selectedShift.value,
    teamId: selectedTeamId.value,
  }),
  () => saveBasicFieldsToStorage(),
  { deep: true }
)


/* Note: formJson refers to the JSON exported by the form designer, the formJson shown here is just a blank form JSON!! */
// const formJson = reactive(testFormJsonData) // Use the imported JSON data - original code
const formData = reactive({})
const optionData = reactive({})
const formTitle = ref(''); // Store form title
const enable_form = ref(false)
const enable_common_fields = ref(false)
let vFormRef = ref(null)
const emit = defineEmits(['updateIsDirty']);
let initialFormSnapshot = ''; // ⏱Store initial snapshot
const showQuickDispatch = ref(false);
const showConfirmation = ref(false);
const showResetConfirmation = ref(false);
const showClearConfirmation = ref(false);
const switchDisplayed = ref(
    !route.params.qcFormTemplateId
);

const store = useStore();
let userId = store.getters.getUser.id;
const userRole = store.getters.getUser.role;
import { useDirtyCheck } from '@/composables/useDirtyCheck.js'
import EditApprovalFlowDialog from "@/components/approval-designer/EditApprovalFlowDialog.vue";
const { isDirty, startDirtyCheck, resetDirty, stopDirtyCheck } = useDirtyCheck(vFormRef, emit)

const cancelClear = () => {
  showClearConfirmation.value = false; // Cancel reset
};

const confirmClear = () => {
  showClearConfirmation.value = false; // Close the confirmation dialog
  if (vFormRef.value) {
    vFormRef.value.resetForm(); // Actually reset the form
    // clear the signature and
    signatureData.value = null;
    ElMessage.success(translate('FormDisplay.formClearedSuccess'))
  }
  clearDraftForUser(userId, formId);        // Clear draft
  emit('refreshFormTree');            // Refresh tree nodes (draft label disappears)
  resetDirty();                             // Mark changes as cleared
};

const closeCountdownEnded = () => {
  showCountdownEnded.value = false;
  setTimeout(() => {
    window.close();
  }, 300); // Give user time to see popup close
};

// ✅ Start or restart the countdown
const startCountdown = () => {
  // Clear any existing interval before starting a new one
  if (countdownInterval) clearInterval(countdownInterval);

  if (remainingTime.value > 0) {
    countdownInterval = setInterval(() => {
      remainingTime.value -= 1;
      if (remainingTime.value <= 0) {
        clearInterval(countdownInterval); // Stop countdown when it reaches zero
        showCountdownEnded.value = true;
      }
    }, 1000);
  }
};

// Common fields
const fetchCommonFieldOptions = async () => {
  const productResp = await getAlActiveSuggestedProducts();
  const batchResp = await getAllActiveSuggestedBatches();
  productOptions.value = productResp.data || [];
  batchOptions.value = batchResp.data || [];

  // 👇 Added: Load team options and default to current user's team
  try {
    const allTeamResp = await getAllTeamTree();
    teamTreeData.value = transformTeamTreeToTreeSelectFormat(allTeamResp.data.data || []);

    const leadTeamResp = await getTeamByTeamLeadId(userId);
    const defaultTeam = leadTeamResp.data.data;
    if (defaultTeam && (selectedTeamId.value === null || selectedTeamId.value === undefined)) {
      selectedTeamId.value = defaultTeam.id;
    }
  } catch (e) {
    console.error(translate('FormDisplay.loadTeamDataFailed'), e);
  }
};

const fetchQcUsersAndShifts = async () => {
  try {
    const userResp = await fetchUsers()
    qcUsers.value = userResp.data.data || []

    const shiftResp = await getAllShifts()
    shifts.value = shiftResp.data.data || []
  } catch (err) {
    console.error(translate('FormDisplay.loadQcUsersShiftsFailed') + ':', err)
  }
}

const handleAddProduct = async () => {
  if (!newProduct.name || !newProduct.code) return;

  // Check if same product code already exists
  const exists = productOptions.value.some(p => p.code === newProduct.code);
  if (exists) {
    ElMessage.error(translateWithParams('FormDisplay.productCodeExists', { code: newProduct.code }));
    return;
  }

  try {
    await createSuggestedProduct({ ...newProduct, created_by: userId });
    await fetchCommonFieldOptions();
    selectedProductCodes.value.push(newProduct.code);
    // Force reactivity to trigger the watch and update selectedProductIds
    selectedProductCodes.value = [...selectedProductCodes.value]; // Force trigger watch to update selectedProductIds
    ElMessage.success(translateWithParams('FormDisplay.productAddSuccess', { name: newProduct.name }));
    showAddProductDialog.value = false;
    Object.assign(newProduct, { name: '', code: '', description: '' });
  } catch (err) {
    console.error(translate('FormDisplay.productAddFailed') + ':', err); // Backend or network error
    ElMessage.error(translateWithParams('FormDisplay.productAddFailed', { name: newProduct.name }));
  }
};

const handleAddBatch = async () => {
  if (!newBatch.code) return;

  // 🔍 Check if same batch code already exists
  const exists = batchOptions.value.some(b => b.code === newBatch.code);
  if (exists) {
    ElMessage.error(translateWithParams('FormDisplay.batchCodeExists', { code: newBatch.code }));
    return;
  }

  try {
    await createSuggestedBatch({ ...newBatch, created_by: userId });
    await fetchCommonFieldOptions();
    selectedBatchCodes.value.push(newBatch.code);
    // Force reactivity to trigger the watch and update selectedBatchIds
    selectedBatchCodes.value = [...selectedBatchCodes.value]; // Force trigger watch to update selectedBatchIds
    ElMessage.success(translateWithParams('FormDisplay.batchAddSuccess', { code: newBatch.code }));
    showAddBatchDialog.value = false;
    newBatch.code = '';
  } catch (err) {
    console.error(translate('FormDisplay.batchAddFailed') + ':', err); // Backend or network error
    ElMessage.error(translateWithParams('FormDisplay.batchAddFailed', { code: newBatch.code }));
  }
};

const prepareSecureAction = (actionType) => {
  secureAction.value = actionType;
  showPasswordDialog.value = true;
};

const handlePasswordVerified = () => {
  if (secureAction.value === 'view') {
    openQcRecords();
  } else if (secureAction.value === 'export') {
    exportDialogVisible.value = true;
  }
  secureAction.value = null;
};

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

// ✅ Watch `rt` in case it changes dynamically
watch(() => route.query.rt, (newRt) => {
  remainingTime.value = parseInt(newRt, 10) || 0;
  startCountdown(); // Restart the countdown if `rt` changes
}, { immediate: true });

watch(autoGenerateBatchCode, (newVal) => {
  if (newVal) {
    newBatch.code = generateBatchCode();
  } else {
    newBatch.code = '';
  }
});

watch(() => props.currentForm?.qcFormTemplateId, (newFormId, oldFormId) => {
  if (newFormId !== oldFormId) {
    // Clear signature data and disable the form when form is switched
    signatureData.value = null;
    enable_form.value = false;
    console.log("Form switched, signature data cleared and form disabled.");
  }
});

// Map selectedProductCodes to selectedProductIds
watch(selectedProductCodes, (codes) => {
  selectedProductIds.value = codes
      .map(code => productOptions.value.find(p => p.code === code)?.id)
      .filter(Boolean);
});

// Map selectedBatchCodes to selectedBatchIds
watch(selectedBatchCodes, (codes) => {
  selectedBatchIds.value = codes
      .map(code => batchOptions.value.find(b => b.code === code)?.id)
      .filter(Boolean);
});

// Map selectedShift name to selectedShiftId
watch(selectedShift, (shiftName) => {
  selectedShiftId.value = shifts.value.find(s => s.name === shiftName)?.id || null;
});

// ✅ Ensure the countdown starts when mounted
onMounted(() => {
  fetchQcUsersAndShifts()
  if (props.accessByTeam) {
    enable_form.value = true; // Auto-enable
    switchDisplayed.value = false; // Hide switch
  }
  startCountdown();
  // Wait for DOM rendering to complete
  setTimeout(() => {
    const drawer = document.getElementById('recipe_setting');
    if (drawer && drawer.parentElement) {
      drawer.parentElement.style.width = '35%';
    }
  }, 0);

  // wait until the vFormRef is ready
  const waitUntilFormReady = setInterval(() => {
    if (vFormRef.value && typeof vFormRef.value.getFormData === 'function') {
      clearInterval(waitUntilFormReady)
      startDirtyCheck();
      // tryLoadDraft();
    }
  }, 100)
});

// ✅ Clean up the interval when unmounted
onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});

// deal with qc records table height
onMounted(() => {
  updateTableHeight();
  window.addEventListener('resize', updateTableHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTableHeight);
});

const clearForm = () => {
  if (vFormRef.value) {
    vFormRef.value.resetForm(); // Call VFormRender internal resetForm method
    ElMessage.success(translate('FormDisplay.formClearedSuccess'))

  }
};

const previewState = ref(true)
let formId = null

// dynamic size:
const scrollBarHeight = ref(`${window.innerHeight-140}px`);

const updateScrollBarHeight = () => {
  scrollBarHeight.value = `${window.innerHeight-140}px`;
};

const openRecipeDrawer = () => {
  const ready = props.currentForm?.qcFormTemplateId || route.params.qcFormTemplateId;
  if (!ready) {
    console.warn(translate('FormDisplay.recipeNotReady'));
    return;
  }

  // Wait for next DOM tick to ensure RecipeSetting can receive props
  nextTick(() => {
    showRecipeDrawer.value = true;
  });
};

onMounted(() => {
  startCountdown();
  window.addEventListener('resize', updateScrollBarHeight);
  updateScrollBarHeight();
  fetchCommonFieldOptions();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollBarHeight);
});

onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    ElMessageBox.confirm(
        translate('FormDisplay.unsavedChangesWarning'),
        translate('common.warning'),
        {
          confirmButtonText: translate('FormDisplay.leaveButton'),
          cancelButtonText: translate('common.cancel'),
          type: 'warning',
        }
    ).then(() => {
      next(); // Continue navigation
    }).catch(() => {
      next(false); // Cancel navigation
    });
  } else {
    next();
  }
});

const handleDispatch = (data) => {
  console.log("Dispatched data:", data);
  // Add your API call or logic to handle the dispatched data
};

const submitForm = () => {
  showConfirmation.value = true; // Show confirmation popup before submitting
};

const cancelSubmission = () => {
  showConfirmation.value = false; // Close the popup without doing anything
};

const handleQuickDispatch = () => {
  console.log("Opening QuickDispatch dialog...");
  showQuickDispatch.value = true;
};

const handleDeleteProduct = async (code) => {
  try {
    const product = productOptions.value.find(p => p.code === code)
    if (!product) {
      ElMessage.error(translate('FormDisplay.productNotFound'))
      return
    }

    await deleteSuggestedProduct(product.id) // Backend soft delete

    // Update local state
    productOptions.value = productOptions.value.filter(item => item.code !== code)
    selectedProductCodes.value = selectedProductCodes.value.filter(c => c !== code)

    ElMessage.success(translateWithParams('FormDisplay.productDeleteSuccess', { name: product.name, code: product.code }))
  } catch (err) {
    ElMessage.error(translate('FormDisplay.productDeleteFailed'))
    console.error(translate('common.deleteFailed') + ':', err)
  }
}

const handleDeleteBatch = async (code) => {
  try {
    const batch = batchOptions.value.find(b => b.code === code)
    if (!batch) {
      ElMessage.error(translate('FormDisplay.batchNotFound'))
      return
    }

    await deleteSuggestedBatch(batch.id)

    // Update local state
    batchOptions.value = batchOptions.value.filter(item => item.code !== code)
    selectedBatchCodes.value = selectedBatchCodes.value.filter(c => c !== code)

    ElMessage.success(translateWithParams('FormDisplay.batchDeleteSuccess', { code: batch.code }))
  } catch (err) {
    ElMessage.error(translate('FormDisplay.batchDeleteFailed'))
    console.error(translate('common.deleteFailed') + ':', err)
  }
}

const confirmSubmission = async () => {
  showConfirmation.value = false; // Close the first popup before proceeding

  formId = props.currentForm?.qcFormTemplateId || route.params.qcFormTemplateId;
  let now = new Date();
  let year = now.getFullYear();
  let month = String(now.getMonth() + 1).padStart(2, '0');
  let collectionName = `form_template_${formId}_${year}${month}`;

  try {
    const formData = await vFormRef.value.getFormData();

    // Add related information fields to form data
    formData['related_product_ids'] = selectedProductIds.value;
    formData['related_batch_ids'] = selectedBatchIds.value;
    formData['related_inspector_ids'] = selectedQcUserIds.value;
    formData['related_shift_id'] = selectedShiftId.value;
    formData['related_team_id'] = selectedTeamId.value;

    // Add readable fields for quick display in MongoDB and frontend data retrieval
    const selectedProductNames = selectedProductCodes.value
        .map(code => productOptions.value.find(p => p.code === code)?.name)
        .filter(Boolean);

    const selectedInspectorNames = selectedQcUserIds.value
        .map(id => qcUsers.value.find(u => u.id === id)?.name)
        .filter(Boolean);

    const selectedShiftName = shifts.value.find(s => s.id === selectedShiftId.value)?.name || '';

    formData['related_products'] = selectedProductNames.join(', ');
    formData['related_batches'] = selectedBatchCodes.value.join(', ');
    formData['related_inspectors'] = selectedInspectorNames.join(', ');
    formData['related_shifts'] = selectedShiftName; // already a string, no .join()
    const selectedTeamName = findTeamNameById(selectedTeamId.value);
    formData['related_teams'] = selectedTeamName || '';

    formData['e-signature'] = signatureData.value || null;

    // For debugging
    console.log("Submitted data (key-value pairs):", formData);

    // Insert into MongoDB
    const response = await insertFormData(userId, collectionName, formData);
    console.log(response.data.object_id);

    const dispatchedTaskId = props.currentForm?.dispatchedTaskId || props.dispatchedTaskId || null;

    // Insert into PostgreSQL log
    await insertTaskSubmissionLog({
      submission_id: response.data.object_id,
      reviewed_at: null,
      reviewed_by: null,
      dispatched_task_id: dispatchedTaskId,
      qc_form_template_id: formId,
      created_by: userId,
      status: 1
    });

    if (response.status === 200) {
      console.log(response.data);
      ElMessage.success(translate('FormDisplay.formSubmitSuccess'))
      clearDraftForUser(userId, formId);
      emit('refreshFormTree');
      showResetConfirmation.value = true; // Show second popup after success
      await resetDirty();
    } else {
      ElMessage.error(translate('FormDisplay.formSubmitError'))
    }
  } catch (error) {
    ElMessage.error(translate('FormDisplay.formSubmitError'))
  }
};

const cancelReset = () => {
  showResetConfirmation.value = false; // Close the second popup without clearing form
};

const confirmReset = () => {
  showResetConfirmation.value = false; // Close the second popup
  vFormRef.value.resetForm(); // Reset the form
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
    await fetchCommonFieldOptions();
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
    await fetchCommonFieldOptions();
    ElMessage.success(translateWithParams('FormDisplay.batchUpdateSuccess', { code: editBatch.code }));
    showEditBatchDialog.value = false;
  } catch (err) {
    ElMessage.error(translate('FormDisplay.batchUpdateFailed'));
    console.error(err);
  }
};

const saveDraft = async () => {
  const formId = props.currentForm?.qcFormTemplateId;
  if (!formId || props.accessByTeam === null) return;

  const data = await vFormRef.value?.getFormData?.();
  if (data && userId) {
    saveFormDraftForUser(userId, formId, data);
    ElMessage.success(translate('FormDisplay.draftSaved'));
    console.log('📦 Draft saved:', {
      userId,
      formId,
      draft: data
    });
  }
  emit('refreshFormTree');
};

// const loadDraft = async () => {
//   const formId = props.currentForm?.qcFormTemplateId;
//   if (!formId || props.accessByTeam === null) return;
//
//   const draft = loadFormDraftForUser(userId, formId);
//   if (draft) {
//     try {
//       // Ensure form JSON is already rendered
//       await nextTick(); // wait for render
//       vFormRef.value?.setFormData?.(draft);
//       ElMessage.success('Draft loaded');
//       console.log('📥 Loaded draft content:', { userId, formId, draft });
//     } catch (err) {
//       console.error('❌ Failed to load draft:', err);
//       ElMessage.error('Error occurred while loading draft');
//     }
//   } else {
//     ElMessage.warning('No available draft found');
//     console.log('⚠️ No draft to load:', { userId, formId });
//   }
// };

const tryLoadDraft = async () => {
  const formId = props.currentForm?.qcFormTemplateId;
  if (!formId || props.accessByTeam === null) return;

  const draft = loadFormDraftForUser(userId, formId);
  if (draft) {
    await nextTick();
    vFormRef.value?.setFormData?.(draft);
    ElMessage.info(translate('FormDisplay.draftLoaded'));
    console.log('📥 Auto-loaded draft:', { userId, formId, draft });
  }
};

// Watch the qcFormTemplateId in the passed currentForm
watch(
    () => props.currentForm?.qcFormTemplateId || route.params.qcFormTemplateId, // Safely access qcFormTemplateId
    async (newQcFormTemplateId) => {
      formId = newQcFormTemplateId

      try {
        const response = await fetchFormTemplate(formId); // Use service function
        if (response.status === 200 && response.data) {
          const templateJson = JSON.parse(response.data.data.form_template_json);
          formTitle.value = response.data.data.name
          vFormRef.value.setFormJson(templateJson); // Update the form JSON dynamically
          selectedApprovalType.value = response.data.data.approval_type;
          initialFormSnapshot = JSON.stringify(await vFormRef.value.getFormData());
          await nextTick();
          enable_common_fields.value = true;
          // when usable is false it will disable the forms as well as the common fields
          if (!props.usable && vFormRef.value) {
            vFormRef.value.disableForm();
            enable_common_fields.value = false;
          }
          ElMessage.success(translate('FormDisplay.formLoadSuccess'))
          // await tryLoadDraft();
          await nextTick();
          await tryLoadDraft()
        } else {
          ElMessage.error(translate('FormDisplay.formLoadFailed'))
        }
      } catch (error) {
        console.error('Error fetching form template:', error);
        ElMessage.error(translate('FormDisplay.formLoadError'))
      }
    },
    { immediate: true } // Trigger immediately for the initial load
);

watch(enable_form, (newVal) => {
  if (newVal && vFormRef.value) {
    vFormRef.value.enableForm(); // Enable the form when switched on
  } else if (vFormRef.value) {
    vFormRef.value.disableForm(); // Disable the form when switched off
  }
});

watch(
    [selectedProductIds, selectedBatchIds],
    ([newProductIds, newBatchIds]) => {
      console.log('✅ selectedProductIds:', newProductIds);
      console.log('✅ selectedBatchIds:', newBatchIds);
    }
);


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

const audio = new Audio(soundEffect);
// audio.play();

//
// watch(
//     () => route.params.switchDisplayed,
//     (newVal) => {
//       console.log("switchDisplayed");
//       console.log(switchDisplayed.value);
//       switchDisplayed.value = newVal ?? true;
//       console.log("route params");
//       console.log(route.params); // Print all parameters in the route
//       console.log("new val: " + newVal);
//       console.log("switchDisplayed after newVal");
//       console.log(switchDisplayed.value);
//     },
//     { immediate: true }
// );

// onMounted(() => {
//   if (props.qcFormTemplateId) {
//     console.log("qcFormTemplateId:", props.qcFormTemplateId);
//     fetchFormTemplate(props.qcFormTemplateId)
//         .then(async (response) => {
//           const formTemplateJson = JSON.parse(response.data.data.form_template_json);
//           console.log("formTemplateJson:", formTemplateJson);
//
//           // Wait for formTemplateJson to be available
//           await waitForCondition(() => formTemplateJson != null);
//
//           // Once available, set it to vFormRef
//           await nextTick();
//           vFormRef.value.setFormJson(formTemplateJson);
//         })
//         .catch((error) => {
//           console.error("Error fetching form template:", error);
//           ElMessage.error("Error loading form template.");
//         });
//   }
// });
//
// // Utility function to wait for a condition
// async function waitForCondition(conditionFn, interval = 100, timeout = 5000) {
//   const start = Date.now();
//   while (!conditionFn()) {
//     if (Date.now() - start > timeout) {
//       throw new Error("Timeout while waiting for condition to be met.");
//     }
//     await new Promise((resolve) => setTimeout(resolve, interval));
//   }
// }

watch(remainingTime, (newTime) => {
  nextTick(() => {
    const countdownElement = document.querySelector(".el-statistic__number");
    if (countdownElement) {
      if (newTime <= 10 * 60) {
        countdownElement.style.color = "red"; // Danger
      } else if (newTime <= 30 * 60) {
        countdownElement.style.color = "#e6a23c"; // Warning (Orange)
      } else if (newTime <= 60 * 60) {
        countdownElement.style.color = "#409eff"; // Primary (Blue)
      } else {
        countdownElement.style.color = ""; // Reset to default
      }
    }
  });
});

watch(showRecipeDrawer, (val) => {
  windowMaskVisible.value = val
})

</script>

<style scoped>
  .form-title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .node-id {
    text-align: right;
    color: grey;
    font-size: 12px;
    margin-top: 20px;
  }

  .header-container {
    display: flex;
    justify-content: space-between; /* Align content to the edges */
    align-items: center; /* Center items vertically */
    padding: 0 20px; /* Optional: Add padding for spacing */
  }

  ::v-deep(.el-scrollbar__wrap--hidden-default) {
    scrollbar-width: thin !important; /* Override to allow normal scroll behavior */
  }

  ::v-deep(.el-scrollbar__wrap) {
    overflow-x: hidden !important; /* Ensure horizontal scrolling is hidden */
    box-sizing: border-box; /* Handle padding correctly */
    padding-top: 10px; /* Add space above the content */
    padding-left: 10px;
  }

  .signature-preview {
    margin-top: 20px;
  }

  .signature-image {
    width: 300px;
    border: 1px solid #ddd;
    margin-top: 10px;
  }

  .signature-clear-btn {
    position: absolute;
    top: -10px;
    right: -10px;
    background: red;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }

  .delete-icon {
    font-size: 16px;
    transition: transform 0.2s ease;
    margin-left: 8px;
    color: red;
    cursor: pointer;
  }

  .edit-icon {
    font-size: 16px;
    transition: transform 0.2s ease;
    margin-left: 8px;
    color: #409EFF;
    cursor: pointer;
  }

  .delete-icon:hover {
    transform: scale(1.4); /* Scale on hover */
    color: #ff4d4f; /* Brighter red */
  }

  .edit-icon:hover {
    transform: scale(1.4); /* Scale on hover */
    color: rgb(51.2, 126.4, 204); /* Brighter blue */
  }

</style>
