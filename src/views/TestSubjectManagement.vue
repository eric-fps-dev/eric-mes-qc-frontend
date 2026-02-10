<!--<template>-->
<!--  <div style="display: flex; flex-direction: column; max-width: 100%;">-->
<!--    &lt;!&ndash; Title, Search Box &ndash;&gt;-->
<!--    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">-->
<!--      <div style="display: flex; align-items: center;">-->
<!--        <h2>{{ translate('testSubjectManagement.title') }}</h2>-->
<!--        &lt;!&ndash; Search Bar &ndash;&gt;-->
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
<!--      &lt;!&ndash; Refresh Button &ndash;&gt;-->
<!--      <div style="display: flex; gap: 10px;">-->
<!--        <el-tooltip :content="translate('orderManagement.refreshList')" placement="top">-->
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

<!--    &lt;!&ndash; Test Subject List &ndash;&gt;-->
<!--    <TestSubjectList-->
<!--        :loading="loading"-->
<!--        :testSubjects="testSubjects"-->
<!--        @edit-test-subject="openDialog"-->
<!--        @delete-test-subject="confirmDelete"-->
<!--        :search-input="searchQuery"-->
<!--        :user-map="userMap"-->
<!--    />-->


<!--    &lt;!&ndash; Dialog for Create / Edit &ndash;&gt;-->
<!--    <el-dialog-->
<!--        v-model="dialogVisible"-->
<!--        :title="isEditMode ? translate('testSubjectManagement.editTestSubject') : translate('testSubjectManagement.addTestSubject')"-->
<!--        :close-on-click-modal="false"-->
<!--    >-->
<!--      <TestSubjectForm-->
<!--          :testSubject="testSubjectForm"-->
<!--          :is-edit-mode="isEditMode"-->
<!--          @submit="submitForm"-->
<!--          @cancel="dialogVisible = false"-->
<!--      />-->
<!--    </el-dialog>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import {-->
<!--  getAllTestSubjects,-->
<!--  createTestSubject,-->
<!--  updateTestSubject,-->
<!--  deleteTestSubject-->
<!--} from "@/services/testSubjectService";-->
<!--import {RefreshRight, Search} from "@element-plus/icons-vue";-->
<!--import TestSubjectList from "@/components/test-subject/TestSubjectList.vue";-->
<!--import TestSubjectForm from "@/components/test-subject/TestSubjectForm.vue";-->
<!--import SamplingLocationList from "@/components/sampling-location/SamplingLocationList.vue";-->
<!--import {translate, translateWithParams} from "@/utils/i18n";-->
<!--import {fetchUsers} from "@/services/userService";-->

<!--export default {-->
<!--  components: {RefreshRight, SamplingLocationList, Search, TestSubjectList, TestSubjectForm },-->
<!--  data() {-->
<!--    return {-->
<!--      testSubjects: [],-->
<!--      loading: false,-->
<!--      searchQuery: "",-->
<!--      dialogVisible: false,-->
<!--      isEditMode: false,-->
<!--      testSubjectForm: {-->
<!--        id: null,-->
<!--        name: "",-->
<!--        description: "",-->
<!--      },-->
<!--      userMap: {},-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    translate,-->
<!--    async loadTestSubjects() {-->
<!--      try {-->
<!--        this.loading = true;-->
<!--        const response = await getAllTestSubjects();-->
<!--        if (response.data && response.data.data) {-->
<!--          this.testSubjects = response.data.data;-->
<!--        } else {-->
<!--          this.testSubjects = [];-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load test subjects:", error);-->
<!--        this.testSubjects = [];-->
<!--      } finally {-->
<!--        this.loading = false;-->
<!--      }-->
<!--    },-->
<!--    async loadUserMap() {-->
<!--      try {-->
<!--        const response = await fetchUsers();-->
<!--        const updatedUserMap = response.data.data.content.reduce((map, user) => {-->
<!--          map[user.id] = user;-->
<!--          return map;-->
<!--        }, {});-->

<!--        if (JSON.stringify(this.userMap) !== JSON.stringify(updatedUserMap)) {-->
<!--          this.userMap = updatedUserMap;-->
<!--        }-->
<!--      } catch (error) {-->
<!--        this.$message.error(translate('orderManagement.messages.errorLoadingUsersData'));-->
<!--      }-->
<!--    },-->
<!--    openDialog(testSubject = null) {-->
<!--      this.isEditMode = !!testSubject;-->
<!--      this.testSubjectForm = testSubject-->
<!--          ? { ...testSubject }-->
<!--          : { name: "", description: "" };-->
<!--      this.dialogVisible = true;-->
<!--    },-->
<!--    async submitForm(updatedTestSubject) {-->
<!--      try {-->
<!--        console.log(updatedTestSubject);-->
<!--        if (this.isEditMode) {-->
<!--          await updateTestSubject(updatedTestSubject.id, updatedTestSubject);-->
<!--        } else {-->
<!--          await createTestSubject(updatedTestSubject);-->
<!--        }-->
<!--        this.dialogVisible = false;-->
<!--        await this.loadTestSubjects();-->
<!--      } catch (error) {-->
<!--        console.error("Error saving test subject:", error);-->
<!--      }-->
<!--    },-->
<!--    async confirmDelete(id) {-->
<!--      try {-->
<!--        await this.$confirm(translate('orderManagement.messages.deleteConfirmation'), translate('orderManagement.messages.messageTitle'), {-->
<!--          confirmButtonText: translate('orderManagement.confirm'),-->
<!--          cancelButtonText: translate('orderManagement.cancel'),-->
<!--          type: "warning",-->
<!--        });-->
<!--        const currentUserId = this.$store.getters.getUser.id; // Get logged-in user ID-->
<!--        await deleteTestSubject(id, currentUserId);-->
<!--        await this.loadTestSubjects();-->
<!--      } catch (error) {-->
<!--        console.error("Error deleting test subject:", error);-->
<!--      }-->
<!--    },-->
<!--    async handleRefreshButton() {-->
<!--      this.searchQuery = "";-->
<!--      await this.loadTestSubjects()-->
<!--    },-->
<!--  },-->
<!--  mounted() {-->
<!--    this.loadTestSubjects();-->
<!--    this.loadUserMap();-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->

<!--.refresh-button {-->
<!--  background-color: #80cfff; /* Slightly lighter shade of primary color */-->
<!--  border-color: #80cfff; /* Match lighter background */-->
<!--}-->

<!--.refresh-button:hover {-->
<!--  background-color: #66b5ff; /* Slightly darker hover effect */-->
<!--  border-color: #66b5ff;-->
<!--  transform: rotate(360deg); /* Rotate on hover */-->
<!--  transition: transform 0.3s ease-in-out, background-color 0.2s ease; /* Smooth animation */-->
<!--}-->

<!--.refresh-button el-icon {-->
<!--  color: white; /* Darker primary-like color for the refresh icon */-->
<!--}-->
<!--</style>-->
