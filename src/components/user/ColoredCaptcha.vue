<template>
  <div class="captcha-container">
    <canvas ref="captchaCanvas" width="120" height="50"></canvas>
    <el-button type="text" @click="generateCaptcha">{{ translate('common.refresh') }}</el-button>
  </div>
</template>

<script>
import { translate } from '@/utils/i18n';

export default {
  name: 'ColoredCaptcha',
  data() {
    return {
      captchaText: '',
    };
  },
  mounted() {
    this.generateCaptcha();
  },
  methods: {
    translate,
    generateCaptcha() {
      const canvas = this.$refs.captchaCanvas;
      const ctx = canvas.getContext('2d');
      const chars = '0123456789+-';
      let captcha = '';

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = '#f3f3f3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Generate captcha string
      for (let i = 0; i < 5; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.captchaText = captcha;

      // Draw each character with random colors and positions
      for (let i = 0; i < captcha.length; i++) {
        ctx.font = `${Math.random() * 10 + 30}px Arial`;
        ctx.fillStyle = this.getRandomColor();
        ctx.fillText(captcha[i], 15 + i * 20, Math.random() * 15 + 30);
      }
    },
    getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
  },
};
</script>

<style scoped>
.captcha-container {
  display: flex;
  align-items: center;
}

canvas {
  border: 1px solid #ccc;
  margin-right: 10px;
}
</style>
