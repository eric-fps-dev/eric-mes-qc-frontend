<!--<template>-->
<!--  <el-dialog-->
<!--      v-model="visible"-->
<!--      :title="translate('PasswordPrompt.title')"-->
<!--      width="30%"-->
<!--      :before-close="handleClose"-->
<!--  >-->
<!--    <el-input-->
<!--        v-model="passwordInput"-->
<!--        :placeholder="translate('PasswordPrompt.placeholder')"-->
<!--        show-password-->
<!--        type="password"-->
<!--        @keyup.enter="verify"-->
<!--    />-->
<!--    <template #footer>-->
<!--      <el-button @click="handleClose">{{ translate('common.cancel') }}</el-button>-->
<!--      <el-button type="primary" @click="verify">{{ translate('common.confirm') }}</el-button>-->
<!--    </template>-->
<!--  </el-dialog>-->
<!--</template>-->

<!--<script setup>-->
<!--  import { ref, watch } from 'vue';-->
<!--  import { ElMessage } from 'element-plus';-->
<!--  import { validateUser } from '@/services/userService';-->
<!--  import { translate } from '@/utils/i18n';-->

<!--  const props = defineProps({-->
<!--    modelValue: Boolean-->
<!--  });-->

<!--  const emit = defineEmits(['update:modelValue', 'verified']);-->
<!--  const passwordInput = ref('');-->
<!--  const visible = ref(props.modelValue);-->

<!--  // Watch for v-model updates-->
<!--  watch(() => props.modelValue, val => {-->
<!--    visible.value = val;-->
<!--  });-->
<!--  watch(visible, val => {-->
<!--    emit('update:modelValue', val);-->
<!--    if (!val) passwordInput.value = '';-->
<!--  });-->

<!--  // Get username from localStorage-->
<!--  const username = JSON.parse(localStorage.getItem('current_user'))?.username || '';-->

<!--  // Verify with backend-->
<!--  const verify = async () => {-->
<!--    if (!username) {-->
<!--      ElMessage.error(translate('PasswordPrompt.noCurrentUser'));-->
<!--      return;-->
<!--    }-->

<!--    try {-->
<!--      const encodedPassword = btoa(passwordInput.value);-->
<!--      const res = await validateUser(username, encodedPassword);-->
<!--      if (Number(res.data.status) === 200) {-->
<!--        emit('verified');-->
<!--        visible.value = false;-->
<!--      } else {-->
<!--        ElMessage.error(translate('PasswordPrompt.wrongPassword'));-->
<!--      }-->
<!--    } catch (err) {-->
<!--      console.error('Verification failed', err);-->
<!--      ElMessage.error(translate('PasswordPrompt.serverError'));-->
<!--    }-->
<!--  };-->

<!--  const handleClose = () => {-->
<!--    visible.value = false;-->
<!--  };-->
<!--</script>-->

