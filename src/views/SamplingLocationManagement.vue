<!--<template>-->
<!--  <div style="display: flex; flex-direction: column; max-width: 100%;">-->
<!--    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; ">-->
<!--      &lt;!&ndash; Top Section &ndash;&gt;-->
<!--      <div style="display: flex; align-items: center;">-->
<!--        <h2>{{ translate('samplingLocationManagement.title') }}</h2>-->
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

<!--      <div style="display: flex; gap: 10px;">-->
<!--        &lt;!&ndash; Refresh Button &ndash;&gt;-->
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

<!--        <el-button-->
<!--            type="primary"-->
<!--            @click="openDialog()"-->
<!--        >-->
<!--          {{ translate('common.addButton') }}-->
<!--        </el-button>-->
<!--      </div>-->
<!--    </div>-->


<!--    &lt;!&ndash; Sampling Location List &ndash;&gt;-->
<!--    <SamplingLocationList-->
<!--        :locations="locations"-->
<!--        @edit-location="openDialog"-->
<!--        @delete-location="confirmDelete"-->
<!--        :search-input="searchQuery"-->
<!--        :user-map="userMap"-->
<!--        :loading="loading"-->
<!--    />-->


<!--    &lt;!&ndash; Dialog for Create / Edit &ndash;&gt;-->
<!--    <el-dialog-->
<!--        v-model="dialogVisible"-->
<!--        :title="isEditMode ? translate('samplingLocationManagement.editSamplingLocation') : translate('samplingLocationManagement.addSamplingLocation')"-->
<!--        :close-on-click-modal="false"-->
<!--    >-->
<!--      <SamplingLocationForm-->
<!--          :location="locationForm"-->
<!--          :is-edit-mode="isEditMode"-->
<!--          @submit="submitForm"-->
<!--          @cancel="dialogVisible = false"-->
<!--      />-->
<!--    </el-dialog>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import {-->
<!--  getAllSamplingLocations,-->
<!--  createSamplingLocation,-->
<!--  updateSamplingLocation,-->
<!--  deleteSamplingLocation-->
<!--} from "@/services/samplingLocationService";-->
<!--import {RefreshRight, Search} from "@element-plus/icons-vue";-->
<!--import SamplingLocationList from "@/components/sampling-location/SamplingLocationList.vue";-->
<!--import SamplingLocationForm from "@/components/sampling-location/SamplingLocationForm.vue";-->
<!--import {translate, translateWithParams} from "@/utils/i18n";-->
<!--import {fetchUsers} from "@/services/userService";-->

<!--export default {-->
<!--  components: { RefreshRight, Search, SamplingLocationList, SamplingLocationForm },-->
<!--  data() {-->
<!--    return {-->
<!--      locations: [],-->
<!--      loading: false,-->
<!--      searchQuery: "",-->
<!--      dialogVisible: false,-->
<!--      isEditMode: false,-->
<!--      locationForm: {-->
<!--        id: null,-->
<!--        name: "",-->
<!--        description: "",-->
<!--      },-->
<!--      userMap: {},-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    translate,-->
<!--    async loadLocations() {-->
<!--      try {-->
<!--        this.loading = true;-->
<!--        const response = await getAllSamplingLocations();-->
<!--        if (response.data && response.data.data) {-->
<!--          this.locations = response.data.data;-->
<!--        } else {-->
<!--          this.locations = [];-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load sampling locations:", error);-->
<!--        this.locations = [];-->
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
<!--    openDialog(location = null) {-->
<!--      this.isEditMode = !!location;-->
<!--      this.locationForm = location-->
<!--          ? { ...location }-->
<!--          : { name: "", description: "" };-->
<!--      this.dialogVisible = true;-->
<!--    },-->
<!--    async submitForm(updatedLocation) {-->
<!--      try {-->
<!--        console.log(updatedLocation);-->
<!--        if (this.isEditMode) {-->
<!--          await updateSamplingLocation(updatedLocation.id, updatedLocation, 1);-->
<!--        } else {-->
<!--          await createSamplingLocation(updatedLocation, 1);-->
<!--        }-->
<!--        this.dialogVisible = false;-->
<!--        await this.loadLocations();-->
<!--        this.refreshKey++;-->
<!--      } catch (error) {-->
<!--        console.error("Error saving sampling location:", error);-->
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
<!--        await deleteSamplingLocation(id, currentUserId);-->
<!--        await this.loadLocations();-->
<!--      } catch (error) {-->
<!--        console.error("Error deleting sampling location:", error);-->
<!--      }-->
<!--    },-->
<!--    async handleRefreshButton() {-->
<!--      this.searchQuery = "";-->
<!--      await this.loadLocations();-->
<!--    },-->
<!--  },-->
<!--  mounted() {-->
<!--    this.loadLocations();-->
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
