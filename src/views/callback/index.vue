<template>
  <div class="callback-wrapper">
    <el-card class="callback-card">
      <template #header>
        <span>Signing you in…</span>
      </template>

      <el-result v-if="loading" title="Verifying Cognito login…" sub-title="Please wait">
        <template #icon>
          <el-icon><Loading /></el-icon>
        </template>
      </el-result>

      <el-result v-else-if="error" icon="error" title="Login failed" :sub-title="errorMsg">
        <template #extra>
          <el-button type="primary" @click="retry">Retry</el-button>
        </template>
      </el-result>

      <el-result
          v-else
          icon="success"
          title="Login successful"
          sub-title="Redirecting to QC system…"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { callback } from '@/services/userService'
import { gotoCognitoLogin } from '@/utils/cognito.js'
import { useStore } from 'vuex'

const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')

const router = useRouter()
const route = useRoute()
const store = useStore()

const doCallback = async () => {

  console.log('doCallback')

  let code = route.query.code

  if (!code) {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.split('?')[1])
    code = params.get('code')
  }

  if (!code) {
    error.value = true
    errorMsg.value = 'No authorization code found'
    loading.value = false
    console.log( 'No authorization code found' )
    return
  }

  try {
    loading.value = true
    const res = await callback(code) // stores tokens in localStorage
    console.log( 'Callback API result:', res )

    await store.dispatch('fetchAndStoreUserState')

    // 设置默认语言为英文
    if (!localStorage.getItem("app-language")) {
      localStorage.setItem("app-language", "en-US");
    }
    if (!localStorage.getItem("v_form_locale")) {
      localStorage.setItem("v_form_locale", "en-US");
    }

    await router.replace('/')
  } catch (err) {
    loading.value = false
    error.value = true
    errorMsg.value =
        err?.response?.data?.message ||
        err.message ||
        'Cognito login failed'
  } finally{
    loading.value = false
  }
}

const retry = () => {
  console.log('QC callback view retry clicked, navigating to cognito login.')
  gotoCognitoLogin()
}

onMounted(doCallback)
</script>

<style scoped>
.callback-wrapper {
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.callback-card {
  max-width: 420px;
  width: 100%;
}
</style>
