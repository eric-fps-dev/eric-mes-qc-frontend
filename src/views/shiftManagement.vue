<!--<template>-->
<!--  <div style="display: flex; flex-direction: column; max-width: 100%;">-->
<!--    &lt;!&ndash; Top Section &ndash;&gt;-->
<!--    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">-->
<!--      &lt;!&ndash; Title, Search Box &ndash;&gt;-->
<!--      <div style="display: flex; align-items: center;">-->
<!--        <h2>{{ translate('shiftManagement.title') }}</h2>-->
<!--        <el-input-->
<!--            v-model="searchQuery"-->
<!--            :placeholder="translate('common.searchPlaceholder')"-->
<!--            clearable-->
<!--            style="width: 300px; margin-left: 20px;"-->
<!--        >-->
<!--          <template #prefix>-->
<!--            <el-icon><Search /></el-icon>-->
<!--          </template>-->
<!--        </el-input>-->
<!--      </div>-->

<!--      &lt;!&ndash; Refresh & Add Button &ndash;&gt;-->
<!--      <div style="display: flex; gap: 10px;">-->
<!--        <el-tooltip :content="translate('shiftManagement.refreshTooltip')" placement="top">-->
<!--          <el-button-->
<!--              class="refresh-button"-->
<!--              type="primary"-->
<!--              circle-->
<!--              @click="handleRefreshButton"-->
<!--          >-->
<!--            <el-icon style="color: white;">-->
<!--              <RefreshRight />-->
<!--            </el-icon>-->
<!--          </el-button>-->
<!--        </el-tooltip>-->
<!--        <el-button type="primary" @click="openDialog()">-->
<!--          {{ translate('common.addButton') }}-->
<!--        </el-button>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Shift List &ndash;&gt;-->
<!--    <ShiftList-->
<!--        :loading="loading"-->
<!--        :shifts="shifts"-->
<!--        @edit-shift="openDialog"-->
<!--        @delete-shift="confirmDelete"-->
<!--        :search-input="searchQuery"-->
<!--        :user-map="userMap"-->
<!--    />-->

<!--    &lt;!&ndash; Dialog for Create/Edit &ndash;&gt;-->
<!--    <el-dialog-->
<!--        v-model="dialogVisible"-->
<!--        :title="isEditMode ? translate('shiftManagement.editShift') : translate('shiftManagement.addShift')"-->
<!--        :close-on-click-modal="false"-->
<!--    >-->
<!--      <ShiftForm-->
<!--          ref="shiftFormComp"-->
<!--          :shift="shiftForm"-->
<!--          :is-edit-mode="isEditMode"-->
<!--          @submit="submitForm"-->
<!--          @cancel="dialogVisible = false"-->
<!--      />-->
<!--    </el-dialog>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import {createShift, deleteShift, getAllShifts, updateShift} from "@/services/shiftService";-->
<!--import {fetchUsers} from "@/services/userService";-->
<!--import ShiftList from "@/components/shift/shiftList.vue";-->
<!--import ShiftForm from "@/components/shift/shiftForm.vue";-->
<!--import {translate} from "@/utils/i18n";-->
<!--import {RefreshRight, Search} from "@element-plus/icons-vue";-->
<!--import dayjs from "dayjs";-->

<!--export default {-->
<!--  components: { RefreshRight, Search, ShiftList, ShiftForm },-->
<!--  data() {-->
<!--    return {-->
<!--      loading: false,-->
<!--      shifts: [],-->
<!--      searchQuery: "",-->
<!--      dialogVisible: false,-->
<!--      isEditMode: false,-->
<!--      shiftForm: {-->
<!--        id: null,-->
<!--        name: "",-->
<!--        description: "",-->
<!--        start_time: "",-->
<!--        end_time: "",-->
<!--        grace_minute: 0,-->
<!--      },-->
<!--      userMap: {},-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    translate,-->
<!--    openDialog(shiftRow = null) {-->
<!--      this.isEditMode = !!shiftRow;-->
<!--      this.shiftForm = shiftRow-->
<!--          ? { ...shiftRow} :-->
<!--          {-->
<!--            id: null,-->
<!--            name: "",-->
<!--            description: "",-->
<!--            start_time: null,-->
<!--            end_time: null,-->
<!--            grace_minute: 0,-->
<!--          };-->

<!--      this.shiftForm.start_time = this.shiftForm.start_time ? new Date(`1970-01-01T${this.shiftForm.start_time}`) : null;-->
<!--      this.shiftForm.end_time = this.shiftForm.end_time ? new Date(`1970-01-01T${this.shiftForm.end_time}`) : null;-->
<!--      this.dialogVisible = true;-->

<!--      // wait for the dialog & child form to render, then clear validation-->
<!--      this.$nextTick(() => {-->
<!--        const formEl = this.$refs.shiftFormComp?.$refs.shiftFormRef;-->
<!--        formEl?.clearValidate();-->
<!--      });-->
<!--    },-->
<!--    toOffsetTime(rawTime) {-->
<!--      if (!rawTime) return null;-->

<!--      try {-->
<!--        const validOffsetTimePattern = /^\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;-->
<!--        const validRawTimePattern = /^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \([\w\s]+\)$/;-->

<!--        // If already in the desired format, return it directly-->
<!--        if (validOffsetTimePattern.test(rawTime)) {-->
<!--          return rawTime;-->
<!--        }-->

<!--        // If in raw valid format, parse and retain timezone-->
<!--        if (validRawTimePattern.test(rawTime)) {-->
<!--          const date = dayjs(rawTime).tz(dayjs.tz.guess()); // Parse with user's local timezone-->
<!--          return date.format("HH:mm:ssZ");-->
<!--        }-->

<!--        // If ISO 8601 format, convert to desired offset time-->
<!--        if (dayjs(rawTime, dayjs.ISO_8601, true).isValid()) {-->
<!--          const date = dayjs(rawTime);-->
<!--          return date.format("HH:mm:ssZ");-->
<!--        }-->

<!--        console.error(`Unsupported time format: ${rawTime}`);-->
<!--        return null;-->
<!--      } catch (error) {-->
<!--        console.error(`Error formatting time: ${rawTime}`, error);-->
<!--        return null;-->
<!--      }-->
<!--    },-->
<!--    async loadShifts() {-->
<!--      try {-->
<!--        this.loading = true;-->
<!--        const response = await getAllShifts();-->
<!--        this.shifts = response.data?.data?.content || [];-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load shifts:", error);-->
<!--        this.shifts = [];-->
<!--      } finally {-->
<!--        this.loading = false;-->
<!--      }-->
<!--    },-->
<!--    async loadUserMap() {-->
<!--      try {-->
<!--        const response = await fetchUsers();-->
<!--        this.userMap = response.data.data.content.reduce((map, user) => {-->
<!--          map[user.id] = user;-->
<!--          return map;-->
<!--        }, {});-->
<!--      } catch (error) {-->
<!--        this.$message.error(translate("orderManagement.messages.errorLoadingUsersData"));-->
<!--      }-->
<!--    },-->
<!--    async submitForm(updatedShift) {-->
<!--      try {-->
<!--        const offsetTimeStartTime = this.toOffsetTime(updatedShift.start_time);-->
<!--        const offsetTimeEndTime = this.toOffsetTime(updatedShift.end_time);-->
<!--        updatedShift.start_time = offsetTimeStartTime;-->
<!--        updatedShift.end_time = offsetTimeEndTime;-->

<!--        if (this.isEditMode) {-->
<!--          await updateShift(updatedShift.id, updatedShift);-->
<!--        } else {-->
<!--          await createShift(updatedShift);-->
<!--        }-->
<!--        this.dialogVisible = false;-->
<!--        await this.loadShifts();-->
<!--      } catch (error) {-->
<!--        console.error("Error saving shift:", error);-->
<!--      }-->
<!--    },-->
<!--    async confirmDelete(id) {-->
<!--      try {-->
<!--        await this.$confirm(-->
<!--            translate("orderManagement.messages.deleteConfirmation"),-->
<!--            translate("orderManagement.messages.messageTitle"),-->
<!--            {-->
<!--              confirmButtonText: translate("orderManagement.confirm"),-->
<!--              cancelButtonText: translate("orderManagement.cancel"),-->
<!--              type: "warning",-->
<!--            }-->
<!--        );-->
<!--        const currentUserId = this.$store.getters.getUser.id; // Get logged-in user ID-->
<!--        await deleteShift(id, currentUserId);-->
<!--        await this.loadShifts();-->
<!--      } catch (error) {-->
<!--        console.error("Error deleting shift:", error);-->
<!--      }-->
<!--    },-->
<!--    async handleRefreshButton() {-->
<!--      this.searchQuery = "";-->
<!--      await this.loadShifts();-->
<!--    },-->
<!--  },-->
<!--  mounted() {-->
<!--    this.loadShifts();-->
<!--    this.loadUserMap();-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.refresh-button {-->
<!--  background-color: #80cfff;-->
<!--  border-color: #80cfff;-->
<!--}-->
<!--.refresh-button:hover {-->
<!--  background-color: #66b5ff;-->
<!--  border-color: #66b5ff;-->
<!--  transform: rotate(360deg);-->
<!--  transition: transform 0.3s ease-in-out, background-color 0.2s ease;-->
<!--}-->
<!--.refresh-button el-icon {-->
<!--  color: white;-->
<!--}-->
<!--</style>-->

