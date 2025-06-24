<template>
  <div class="welcome-wrapper">
    <el-card class="welcome-card">
      <template #header>
        <span>欢迎使用质量管理平台</span>
      </template>
      <el-empty description="欢迎页" />
      <div style="margin-top: 1.5rem;">
        <el-button type="primary" @click="toHome">返回主页</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const toHome = () => {
  router.replace('/qc-summary')
}
</script>

<style scoped>
.welcome-wrapper {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.welcome-card {
  width: 100%;
  max-width: 400px;
  border-radius: 14px;
  box-shadow: 0 2px 12px #eee;
  padding: 2rem 2.5rem;
  text-align: center;
}
</style>
