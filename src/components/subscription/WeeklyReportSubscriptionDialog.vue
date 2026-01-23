<template>
  <el-dialog
    v-model="visible"
    width="900px"
    @close="resetForm"
  >
    <template #header>
      <span class="el-dialog__title">{{ translate('WeeklyReportSubscription.title') }}</span>
      <el-popover
        placement="top-start"
        :title="translate('WeeklyReportSubscription.ruleTitle')"
        :width="300"
        trigger="click"
        :content="translate('WeeklyReportSubscription.ruleContent')"
      >
        <template #reference>
          <el-icon style="margin-left: 8px; cursor: pointer; color: #909399; vertical-align: middle;"><QuestionFilled /></el-icon>
        </template>
      </el-popover>
    </template>

    <!-- Add/Edit Subscription Form -->
    <div class="add-subscription-section">
      <h4>{{ isEditing ? translate('WeeklyReportSubscription.editSubscriber') : translate('WeeklyReportSubscription.addNew') }}</h4>
      <el-form :inline="true" :model="newSubscription" class="add-form">
        <el-form-item :label="translate('WeeklyReportSubscription.user')">
          <el-select
            v-model="newSubscription.userId"
            :placeholder="translate('WeeklyReportSubscription.selectUser')"
            filterable
            style="width: 160px"
            @change="onUserSelect"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="translate('WeeklyReportSubscription.email')">
          <el-input
            v-model="newSubscription.email"
            :placeholder="translate('WeeklyReportSubscription.enterEmail')"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item :label="translate('WeeklyReportSubscription.language')">
          <el-select v-model="newSubscription.language" style="width: 100px">
            <el-option :label="translate('WeeklyReportSubscription.chinese')" value="zh" />
            <el-option :label="translate('WeeklyReportSubscription.english')" value="en" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="!isEditing"
            type="primary"
            @click="handleAddSubscription"
            :disabled="!isFormValid"
            class="add-form"
          >
            {{ translate('WeeklyReportSubscription.add') }}
          </el-button>
                    <div v-else style="margin-top: 0;">
                      <el-button
                        type="success"
                        @click="handleUpdateSubscription"
                        :disabled="!isFormValid"
                        style="margin-top: 0px"
                      >
                        {{ translate('WeeklyReportSubscription.update') }}
                      </el-button>
                      <el-button @click="cancelEdit" style="margin-top: 0px">
                        {{ translate('common.cancel') }}
                      </el-button>
                    </div>        </el-form-item>
      </el-form>
    </div>

    <!-- Subscription List -->
    <div class="subscription-list-section">
      <h4>{{ translate('WeeklyReportSubscription.currentSubscribers') }} ({{ subscriptions.length }})</h4>
      <el-table :data="subscriptions" border size="small" max-height="300" v-loading="loading">
        <el-table-column :label="translate('WeeklyReportSubscription.userName')" prop="user_name" min-width="120" />
        <el-table-column :label="translate('WeeklyReportSubscription.email')" prop="email" min-width="200" />
        <el-table-column :label="translate('WeeklyReportSubscription.language')" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">
              {{ row.language === 'en' ? translate('WeeklyReportSubscription.english') : translate('WeeklyReportSubscription.chinese') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="translate('WeeklyReportSubscription.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? translate('WeeklyReportSubscription.active') : translate('WeeklyReportSubscription.inactive') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="translate('WeeklyReportSubscription.actions')" width="140" align="center">
          <template #default="{ row }">
            <el-tooltip :content="isCooldownActive(row.id) ? translate('WeeklyReportSubscription.cooldownActive') : translate('WeeklyReportSubscription.sendNow')" placement="top">
              <el-button
                type="primary"
                size="small"
                @click="handleSendNow(row)"
                circle
                :loading="sendingStates[row.id]"
                :disabled="isCooldownActive(row.id)"
                style="margin-top: 0px; margin-right: 4px;"
              >
                <el-icon><Message /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :content="translate('WeeklyReportSubscription.edit')" placement="top">
              <el-button
                type="warning"
                size="small"
                @click="handleEditSubscription(row)"
                circle
                style="margin-top: 0px; margin-right: 4px;"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :content="translate('WeeklyReportSubscription.remove')" placement="top">
              <el-button
                type="danger"
                size="small"
                @click="handleRemoveSubscription(row.id)"
                circle
                style="margin-top: 0px"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="subscriptions.length === 0 && !loading"
        :description="translate('WeeklyReportSubscription.noSubscribers')"
      />
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ translate('WeeklyReportSubscription.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Delete, QuestionFilled, Message, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { translate } from '@/utils/i18n'
import { getSubscriptions, addSubscription, removeSubscription, sendReportNow, updateSubscription } from '@/services/weeklyReportSubscriptionService'
import { fetchUsers } from '@/services/userService'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])
const store = useStore()

const COOLDOWN_KEY_PREFIX = 'qc_report_cooldown_'
const COOLDOWN_DURATION = 60 * 60 * 1000 // 1 hour in ms

function isCooldownActive(id) {
  const lastSent = localStorage.getItem(COOLDOWN_KEY_PREFIX + id)
  if (!lastSent) return false
  const elapsed = Date.now() - parseInt(lastSent)
  return elapsed < COOLDOWN_DURATION
}

async function handleSendNow(row) {
  if (isCooldownActive(row.id)) return

  try {
    await ElMessageBox.confirm(
      translate('WeeklyReportSubscription.confirmSendNow'),
      translate('WeeklyReportSubscription.sendNowTitle'),
      { type: 'info' }
    )

    sendingStates[row.id] = true
    await sendReportNow(row.id)

    // Set cooldown
    localStorage.setItem(COOLDOWN_KEY_PREFIX + row.id, Date.now().toString())
    // Force reactivity update (simple way is to reload list or use a reactive map, but reloading list is safer)
    await loadSubscriptions()

    ElMessage.success(translate('WeeklyReportSubscription.sendNowSuccess'))
  } catch (e) {
    if (e !== 'cancel') {
      console.error('Failed to send report', e)
      ElMessage.error(translate('WeeklyReportSubscription.sendNowError'))
    }
  } finally {
    sendingStates[row.id] = false
  }
}
const visible = ref(props.visible)
watch(() => props.visible, val => (visible.value = val))
watch(visible, val => emit('update:visible', val))

const loading = ref(false)
const subscriptions = ref([])
const users = ref([])
const sendingStates = reactive({})
const editingSubscription = ref(null)

const newSubscription = reactive({
  userId: null,
  email: '',
  language: 'en'
})

const isFormValid = computed(() => {
  return newSubscription.userId && newSubscription.email && isValidEmail(newSubscription.email) && newSubscription.language
})

const isEditing = computed(() => !!editingSubscription.value)

function handleEditSubscription(row) {
  editingSubscription.value = row
  newSubscription.userId = Number(row.user_id)
  newSubscription.email = row.email
  newSubscription.language = row.language || 'en'
}

function cancelEdit() {
  editingSubscription.value = null
  resetForm()
}

async function handleUpdateSubscription() {
  if (!isFormValid.value || !editingSubscription.value) return

  try {
    await updateSubscription(editingSubscription.value.id, {
      user_id: newSubscription.userId,
      email: newSubscription.email,
      language: newSubscription.language,
      updated_by: store.getters.getUser?.id
    })
    ElMessage.success(translate('WeeklyReportSubscription.updateSuccess'))
    cancelEdit()
    await loadSubscriptions()
  } catch (e) {
    console.error('Failed to update subscription', e)
    ElMessage.error(translate('WeeklyReportSubscription.updateError'))
  }
}

// ... (rest of methods)

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function onUserSelect(userId) {
  const user = users.value.find(u => u.id === userId)
  if (user && user.email) {
    newSubscription.email = user.email
  }
}

async function loadSubscriptions() {
  loading.value = true
  try {
    const res = await getSubscriptions()
    subscriptions.value = res.data.data || []
  } catch (e) {
    console.error('Failed to load subscriptions', e)
    ElMessage.error(translate('WeeklyReportSubscription.loadError'))
  } finally {
    loading.value = false
  }
}

async function loadUsers() {
  try {
    const res = await fetchUsers()
    users.value = res.data.data || []
  } catch (e) {
    console.error('Failed to load users', e)
  }
}

async function handleAddSubscription() {
  if (!isFormValid.value) return

  try {
    await addSubscription({
      user_id: newSubscription.userId,
      email: newSubscription.email,
      language: newSubscription.language,
      created_by: store.getters.getUser?.id
    })
    ElMessage.success(translate('WeeklyReportSubscription.addSuccess'))
    resetForm()
    await loadSubscriptions()
  } catch (e) {
    console.error('Failed to add subscription', e)
    ElMessage.error(translate('WeeklyReportSubscription.addError'))
  }
}

async function handleRemoveSubscription(id) {
  try {
    await ElMessageBox.confirm(
      translate('WeeklyReportSubscription.confirmRemove'),
      translate('WeeklyReportSubscription.warning'),
      { type: 'warning' }
    )
    await removeSubscription(id)
    ElMessage.success(translate('WeeklyReportSubscription.removeSuccess'))
    await loadSubscriptions()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('Failed to remove subscription', e)
      ElMessage.error(translate('WeeklyReportSubscription.removeError'))
    }
  }
}

function resetForm() {
  newSubscription.userId = null
  newSubscription.email = ''
  newSubscription.language = 'en'
}

onMounted(() => {
  loadSubscriptions()
  loadUsers()
})

// Reload when dialog opens
watch(visible, (val) => {
  if (val) {
    loadSubscriptions()
  }
})
</script>

<style scoped>
.add-subscription-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.add-subscription-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.add-form {
  margin-top: 0;
}

.add-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 10px;
}

.subscription-list-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
}
</style>
