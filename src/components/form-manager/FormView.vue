<template>
  <div>
    <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 10px">
      {{ translate('FormView.title') }} - {{ formTitle }}
    </h2>

    <el-scrollbar height="calc(100vh - 180px)">
      <v-form-render
        ref="vFormRef"
        :form-json="templateJson"
        :form-data="formData"
        :option-data="optionData"
      />
    </el-scrollbar>

    <div style="display: flex; justify-content: center; gap: 10px; margin-top: 30px">
      <el-button @click="handleClose">
        {{ translate('common.close') }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
:deep(.highlight-invalid) {
  border-left: 4px solid #f56c6c !important;
  background-color: rgba(245, 108, 108, 0.05) !important;
  padding-left: 8px !important;
  transition: all 0.3s ease !important;
}

:deep(.highlight-invalid .el-form-item__label) {
  color: #c0392b !important;
  font-weight: 500 !important;
}

:deep(.highlight-valid) {
  border-left: 4px solid #67C23A !important;
  background-color: rgba(103, 194, 58, 0.05) !important;
  padding-left: 8px !important;
  transition: all 0.3s ease !important;
}

:deep(.highlight-valid .el-form-item__label) {
  color: #2e7d32 !important;
  font-weight: 500 !important;
}
</style>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import VFormRender from '@/components/form-render/index';
import { useRoute } from 'vue-router';
import { getRawMongoDocument } from '@/services/qcTaskSubmissionLogsService';
import { fetchFormTemplate } from '@/services/qcFormTemplateService';
import { getSubmissionValidationDetails } from '@/services/summary/qcSummaryService';
import { translate } from '@/utils/i18n';

const route = useRoute();

const templateId = route.query.templateId;
const submissionId = route.query.submissionId;
const createdAt = route.query.createdAt;
const shouldHighlight = route.query.highlight === 'true';
const collectionName = route.query.collectionName;

const vFormRef = ref(null);
const optionData = ref({});

const formTitle = ref('');
const templateJson = ref({});
const formData = ref({});
const invalidFieldLabels = ref([]);

// Helper function to recursively find all fields in the template
const findAllFields = (widgets) => {
  const fields = [];

  const traverse = (items) => {
    if (!items || !Array.isArray(items)) return;

    items.forEach(item => {
      if (item.category === 'field' && item.options) {
        fields.push({
          name: item.options.name,
          label: item.options.label
        });
      }

      // Handle containers (grid, table, etc.)
      if (item.category === 'container') {
        if (item.cols) {
          item.cols.forEach(col => {
            if (col.widgetList) traverse(col.widgetList);
          });
        }
        if (item.rows) {
          item.rows.forEach(row => {
            if (row.cols) {
              row.cols.forEach(col => {
                if (col.widgetList) traverse(col.widgetList);
              });
            }
          });
        }
        if (item.widgetList) traverse(item.widgetList);
      }
    });
  };

  traverse(widgets);
  return fields;
};

// Function to highlight fields (valid and invalid)
const highlightFields = async () => {
  if (!shouldHighlight || !submissionId) return;

  try {
    // Fetch validation details
    const res = await getSubmissionValidationDetails(submissionId, collectionName);
    const validationDetails = res.data || [];

    if (validationDetails.length === 0) return;

    // Extract labels
    const invalidLabels = validationDetails
      .filter(item => !item.validation_result || item.validation_result !== 'Valid')
      .map(item => item.field_label);

    const validLabels = validationDetails
      .filter(item => item.validation_result === 'Valid')
      .map(item => item.field_label);

    invalidFieldLabels.value = invalidLabels;

    // Wait for DOM to be ready
    await nextTick();

    // Add highlight class
    setTimeout(() => {
      let firstHighlighted = null;

      const highlightByLabels = (labels, className) => {
          if (!labels || labels.length === 0) return;
          labels.forEach(label => {
            if (!label) return;
            const formItems = document.querySelectorAll('.el-form-item');
            formItems.forEach(item => {
              const labelElement = item.querySelector('.el-form-item__label');
              if (labelElement) {
                const labelText = labelElement.textContent.trim();
                if (labelText === label.trim() || labelText.includes(label.trim()) || label.trim().includes(labelText)) {
                  if (!item.classList.contains(className)) {
                    item.classList.add(className);
                    if (!firstHighlighted && className === 'highlight-invalid') firstHighlighted = item;
                  }
                }
              }
            });
          });
      };

      highlightByLabels(validLabels, 'highlight-valid');
      highlightByLabels(invalidLabels, 'highlight-invalid');

      // Scroll
      if (firstHighlighted) {
        setTimeout(() => {
          firstHighlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }, 800);
  } catch (err) {
    console.error('Failed to highlight fields:', err);
  }
};

onMounted(async () => {
  try {
    // Fetch form template
    const res1 = await fetchFormTemplate(templateId);
    templateJson.value = JSON.parse(res1.data?.data?.form_template_json || '{}');
    formTitle.value = res1.data?.data?.name || translate('FormView.defaultFormTitle');

    // Fetch submission data
    const res2 = await getRawMongoDocument(submissionId, templateId, createdAt, collectionName);
    formData.value = res2.data;

    // Set form data
    vFormRef.value?.setFormJson(templateJson.value);
    vFormRef.value?.setFormData(formData.value);

    // Disable all form fields (read-only mode)
    setTimeout(() => {
      vFormRef.value?.disableForm();

      // Highlight invalid fields if requested
      if (shouldHighlight) {
        highlightFields();
      }
    }, 100);
  } catch (err) {
    console.error(translate('FormView.loadFailed'), err);
  }
});

const handleClose = () => {
  window.close();
};

</script>
