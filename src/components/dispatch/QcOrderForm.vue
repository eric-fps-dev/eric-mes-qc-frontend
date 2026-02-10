<!--<template>-->
<!--  <el-container style="display: flex; height: 100%; overflow-y: hidden;">-->
<!--    &lt;!&ndash; Left Section - QcOrderForm &ndash;&gt;-->
<!--    <el-main style="flex: 7; padding: 20px; overflow-y: auto; max-height: 75vh">-->
<!--      <el-form-->
<!--          :model="qcOrderForm"-->
<!--          :rules="validationRules"-->
<!--          ref="formRef"-->
<!--          label-position="left"-->
<!--          label-width="200px"-->
<!--      >-->
<!--        &lt;!&ndash; QC Order Name &ndash;&gt;-->
<!--        <el-form-item-->
<!--            label="工单名称"-->
<!--            required-->
<!--            prop="name"-->
<!--        >-->
<!--          <el-input-->
<!--              v-model="qcOrderForm.name"-->
<!--              placeholder="请输入质检工单名称"-->
<!--              maxlength="255"-->
<!--          />-->
<!--        </el-form-item>-->

<!--        &lt;!&ndash; Description &ndash;&gt;-->
<!--        <el-form-item-->
<!--            label="工单备注"-->
<!--        >-->
<!--          <el-input-->
<!--              type="textarea"-->
<!--              v-model="qcOrderForm.description"-->
<!--              placeholder="请输入备注"-->
<!--          >-->
<!--          </el-input>-->
<!--        </el-form-item>-->

<!--        &lt;!&ndash; Dispatch List &ndash;&gt;-->
<!--        <el-divider>派发计划列表</el-divider>-->
<!--        <div-->
<!--            v-for="(dispatch, index) in qcOrderForm.dispatches"-->
<!--            :key="dispatch.id"-->
<!--            style="margin-bottom: 20px;"-->
<!--        >-->
<!--          <el-card shadow="always">-->
<!--            &lt;!&ndash; Custom Header Slot &ndash;&gt;-->
<!--            <template #header>-->
<!--              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: bold;">-->
<!--                <span>派发计划 {{ index + 1 }}</span>-->
<!--                <div style="display: flex; gap: 8px;">-->
<!--                  &lt;!&ndash; Expand Button &ndash;&gt;-->
<!--                  <el-button-->
<!--                      :link="true"-->
<!--                      @click="toggleCollapse(index)"-->
<!--                      :icon="dispatch.collapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"-->
<!--                  >-->
<!--                    {{ dispatch.collapsed ? '展开' : '收起' }}-->
<!--                  </el-button>-->
<!--                  &lt;!&ndash; Remove Dispatch Button &ndash;&gt;-->
<!--                  <el-button-->
<!--                      type="danger"-->
<!--                      plain-->
<!--                      @click="removeDispatch(index)"-->
<!--                  >-->
<!--                    删除派发计划-->
<!--                  </el-button>-->
<!--                </div>-->
<!--              </div>-->
<!--            </template>-->

<!--            &lt;!&ndash; Dispatch Form&ndash;&gt;-->
<!--            <div v-show="!dispatch.collapsed">-->
<!--              &lt;!&ndash; Name &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  label="派发计划名称">-->
<!--                <el-input-->
<!--                    type="text"-->
<!--                    v-model="dispatch.name"-->
<!--                    placeholder="请输入派发计划名称"-->
<!--                    :prop="'dispatches.' + index + '.name'"-->
<!--                    maxlength="255"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Description &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  label="备注"-->
<!--                  prop="description">-->
<!--                <el-input-->
<!--                    type="textarea"-->
<!--                    v-model="dispatch.description"-->
<!--                    placeholder="请输入备注"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              <el-divider>时间调度</el-divider>-->

<!--              &lt;!&ndash; Schedule Type &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  label="类型"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.type'"-->
<!--              >-->
<!--                <el-radio-group-->
<!--                    v-model="dispatch.type"-->
<!--                >-->
<!--                  <el-radio value="regular">周期计划</el-radio>-->
<!--                  <el-radio value="custom">单次计划</el-radio>-->
<!--                </el-radio-group>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Cron Expression &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-if="dispatch.type === 'regular'"-->
<!--                  label="执行计划"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.cron_expression'"-->
<!--              >-->
<!--                <cron-element-plus-->
<!--                    v-model="dispatch.cron_expression"-->
<!--                    :button-props="{ type: 'primary' }"-->
<!--                    locale="zh-cn"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Start/End Time for CRON &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-if="dispatch.type === 'regular'"-->
<!--                  label="执行周期"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.date_range'"-->
<!--                  :rules="[{-->
<!--                    required: true,-->
<!--                    message: '请选择派发计划执行周期',-->
<!--                    trigger: ['change'],-->
<!--                    }]"-->
<!--              >-->
<!--                <el-date-picker-->
<!--                    v-model="dispatch.date_range"-->
<!--                    type="datetimerange"-->
<!--                    range-separator="To"-->
<!--                    start-placeholder="开始时间"-->
<!--                    end-placeholder="停止时间"-->
<!--                    :format="dateFormat"-->
<!--                    :value-format="valueFormat"-->
<!--                    :disabled-date="disablePastDates"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Single Execution Date &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-else-->
<!--                  label="执行时间"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.custom_time'"-->
<!--                  :rules="[{required: true, message: '请选择执行时间', trigger: 'change'},]"-->
<!--              >-->
<!--                <el-date-picker-->
<!--                    v-model="dispatch.custom_time"-->
<!--                    type="datetime"-->
<!--                    placeholder="请选择执行时间"-->
<!--                    :format="dateFormat"-->
<!--                    :value-format="valueFormat"-->
<!--                    :disabled-date="disablePastDates"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Dispatch Limit &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-if="dispatch.type === 'regular'"-->
<!--                  label="派发次数上限"-->
<!--                  required-->
<!--              >-->
<!--                <el-col :span="12">-->
<!--                  <el-form-item-->
<!--                      :prop="'dispatches.' + index + '.isUnlimited'"-->
<!--                      :rules="[{-->
<!--                        required: true,-->
<!--                        message: '请选择有无限制派发上限',-->
<!--                        trigger: ['change'],-->
<!--                        }]">-->
<!--                    <el-radio-group-->
<!--                        v-model="dispatch.isUnlimited"-->
<!--                    >-->
<!--                      <el-radio :value="true">无限制</el-radio>-->
<!--                      <el-radio :value="false">限制</el-radio>-->
<!--                    </el-radio-group>-->
<!--                  </el-form-item>-->
<!--                </el-col>-->
<!--                <el-col :span="12">-->
<!--                  <el-form-item-->
<!--                      v-if="!dispatch.isUnlimited"-->
<!--                      :prop="'dispatches.' + index + '.dispatch_limit'"-->
<!--                      :rules="[{-->
<!--                        required: true,-->
<!--                        message: '请输入派发次数上限',-->
<!--                        trigger: ['change'],-->
<!--                      }]"-->
<!--                  >-->
<!--                    <el-input-number-->
<!--                        v-model="dispatch.dispatch_limit"-->
<!--                        :min="1"-->
<!--                        :max="9999"-->
<!--                        :precision="0"-->
<!--                        style="margin-left: 10px;"-->
<!--                        placeholder="请输入派发上限"-->

<!--                    />-->
<!--                  </el-form-item>-->
<!--                </el-col>-->
<!--              </el-form-item>-->

<!--              <el-divider>质检任务配置</el-divider>-->
<!--              &lt;!&ndash; Due Date Offset &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  label="派发任务时限(分钟)"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.due_date_offset_minute'"-->
<!--                  :rules="[{-->
<!--                        required: true,-->
<!--                        message: '请输入派发任务时限',-->
<!--                        trigger: ['change'],-->
<!--                        }]"-->
<!--              >-->
<!--                <el-input-number-->
<!--                    v-model="dispatch.due_date_offset_minute"-->
<!--                    :min="1"-->
<!--                    :max="9999"-->
<!--                    :precision="0"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Test Subject Selection &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  label="检测项目"-->
<!--                  :prop="'dispatches.' + index + '.test_subject_ids'"-->
<!--              >-->
<!--                <el-select-->
<!--                    v-model="dispatch.test_subject_ids"-->
<!--                    placeholder="请选择检测项目"-->
<!--                    multiple-->
<!--                    filterable-->
<!--                    :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option-->
<!--                      v-for="subject in testSubjectOptions"-->
<!--                      :key="subject.id"-->
<!--                      :label="subject.name"-->
<!--                      :value="subject.id"-->
<!--                  />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Sampling Location Selection &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  label="采样位置"-->
<!--                  :prop="'dispatches.' + index + '.sampling_location_ids'"-->
<!--              >-->
<!--                <el-select-->
<!--                    v-model="dispatch.sampling_location_ids"-->
<!--                    placeholder="请选择采样位置"-->
<!--                    multiple-->
<!--                    filterable-->
<!--                    :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option-->
<!--                      v-for="location in samplingLocationOptions"-->
<!--                      :key="location.id"-->
<!--                      :label="location.name"-->
<!--                      :value="location.id"-->
<!--                  />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Instrument Selection &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  label="仪器"-->
<!--                  :prop="'dispatches.' + index + '.instrument_ids'">-->
<!--                <el-select-->
<!--                    v-model="dispatch.instrument_ids"-->
<!--                    placeholder="请选择仪器"-->
<!--                    multiple-->
<!--                    filterable-->
<!--                    :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option-->
<!--                      v-for="instrument in instrumentOptions"-->
<!--                      :key="instrument.id"-->
<!--                      :label="instrument.name"-->
<!--                      :value="instrument.id"-->
<!--                  />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; User Selection &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  label="检测人员"-->
<!--                  :prop="'dispatches.' + index + '.user_ids'"-->
<!--                  required-->
<!--                  :rules="[{-->
<!--                      required: true,-->
<!--                      message: '请选择至少一名人员或班次',-->
<!--                      trigger: ['change'],-->
<!--                      }]"-->
<!--              >-->
<!--                <el-select-->
<!--                    v-model="dispatch.dropdownUserIds"-->
<!--                    multiple-->
<!--                    filterable-->
<!--                    placeholder="请选择人员"-->
<!--                    @change="addUniqueUserIdsToDispatch($event, index)"-->
<!--                    :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option-->
<!--                      v-for="user in Object.values(userMap)"-->
<!--                      :key="user.id"-->
<!--                      :label="user.name"-->
<!--                      :value="user.id"-->
<!--                  />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Team User Tree Selection &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  :prop="'dispatches.' + index + '.user_ids'"-->
<!--              >-->
<!--                <UserTeamTree-->
<!--                    @update-selected-users="(users) => handleUserTeamTreeSelection(users, index)"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              <DispatchFormTreeSelect-->
<!--                  :selected-form-ids="dispatch.form_ids"-->
<!--                  :prop-name="`dispatches.${index}.form_ids`"-->
<!--                  :has-error="isSubmitted && dispatch.form_ids.length === 0"-->
<!--                  @update-selected-forms="(forms) => handleSelectedForms(forms, index)"-->
<!--                  @on-node-clicked="handleFormNodeClicked"-->
<!--              />-->

<!--              <el-divider>生产模块关联</el-divider>-->

<!--              &lt;!&ndash; Product Selection &ndash;&gt;-->
<!--              <el-form-item label="产品">-->
<!--                <el-select v-model="dispatch.product_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           placeholder="请选择产品"-->
<!--                           :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option v-for="product in productOptions"-->
<!--                             :key="product.id"-->
<!--                             :label="product.name"-->
<!--                             :value="product.id" />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Production Work Order Selection &ndash;&gt;-->
<!--              <el-form-item label="生产工单">-->
<!--                <el-select v-model="dispatch.production_work_order_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           placeholder="请选择生产工单"-->
<!--                           :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option v-for="workOrder in productionWorkOrderOptions"-->
<!--                             :key="workOrder.id"-->
<!--                             :label="workOrder.name"-->
<!--                             :value="workOrder.id" />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Raw Material Selection &ndash;&gt;-->
<!--              <el-form-item label="原料">-->
<!--                <el-select v-model="dispatch.raw_material_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           placeholder="请选择原料"-->
<!--                           :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option v-for="material in rawMaterialOptions"-->
<!--                             :key="material.id"-->
<!--                             :label="material.name"-->
<!--                             :value="material.id" />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              <el-divider>维护模块关联</el-divider>-->
<!--              &lt;!&ndash; Maintenance Work Order Selection &ndash;&gt;-->
<!--              <el-form-item label="维护工单">-->
<!--                <el-select v-model="dispatch.maintenance_work_order_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           placeholder="请选择维护工单"-->
<!--                           :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option v-for="workOrder in maintenanceWorkOrderOptions"-->
<!--                             :key="workOrder.id"-->
<!--                             :label="workOrder.name"-->
<!--                             :value="workOrder.id" />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Equipment Selection &ndash;&gt;-->
<!--              <el-form-item label="设备">-->
<!--                <el-select v-model="dispatch.equipment_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           placeholder="请选择设备"-->
<!--                           :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option v-for="equipment in equipmentOptions"-->
<!--                             :key="equipment.id"-->
<!--                             :label="equipment.name"-->
<!--                             :value="equipment.id" />-->
<!--                </el-select>-->
<!--              </el-form-item>-->
<!--            </div>-->
<!--          </el-card>-->
<!--        </div>-->

<!--        &lt;!&ndash; Add Dispatch &ndash;&gt;-->
<!--        <el-button type="primary" plain @click="addDispatch">新增派发计划</el-button>-->

<!--        &lt;!&ndash; Submit &ndash;&gt;-->
<!--        <el-form-item>-->
<!--          <el-button type="primary" :disabled="!isFormModified" @click="submitForm">提交</el-button>-->
<!--          <el-button @click="resetForm" type="warning">重置</el-button>-->
<!--          <el-button @click="$emit('on-cancel')">取消</el-button>-->
<!--        </el-form-item>-->

<!--  </el-form>-->
<!--    </el-main>-->
<!--    &lt;!&ndash; Right Section - Preview &ndash;&gt;-->
<!--    <el-aside style="flex: 3; padding: 20px; max-height: 75vh; background: #f9f9f9; overflow-y: auto;">-->
<!--      <qc-order-preview-->
<!--        :qc-order-form="qcOrderForm"-->
<!--        :form-map="formMap"-->
<!--        :user-map="userMap"-->
<!--    />-->
<!--    </el-aside>-->
<!--  </el-container>-->
<!--</template>-->

<!--<script>-->
<!--import DispatchFormTreeSelect from "@/components/dispatch/DispatchFormTreeSelect.vue";-->
<!--import {CronElementPlus} from "@vue-js-cron/element-plus";-->
<!--import {fetchUsers} from "@/services/userService";-->
<!--import {normalizeCronExpression, openFormPreviewWindow} from "@/utils/dispatch-utils";-->
<!--import {getAllProductionWorkOrders, getAllProducts, getAllRawMaterials} from "@/services/productionService";-->
<!--import {getAllEquipments, getAllMaintenanceWorkOrders} from "@/services/maintenanceService";-->
<!--import {getAllInstruments} from "@/services/instrumentService";-->
<!--import {getAllTestSubjects} from "@/services/testSubjectService";-->
<!--import {getAllSamplingLocations} from "@/services/samplingLocationService";-->
<!--import QcOrderPreview from "@/components/dispatch/QcOrderPreview.vue"-->
<!--import UserTeamTree from "@/components/dispatch/UserTeamTree.vue";-->

<!--export default {-->
<!--  components: { DispatchFormTreeSelect, UserTeamTree, CronElementPlus, QcOrderPreview },-->
<!--  props: {-->
<!--    currentOrder: {-->
<!--      type: Object,-->
<!--      required: true,-->
<!--    },-->
<!--    formMap: {-->
<!--      type: Object,-->
<!--      required: true,-->
<!--    },-->
<!--    userMap: {-->
<!--      type: Object,-->
<!--      required: true,-->
<!--    },-->
<!--  },-->
<!--  watch: {-->
<!--    currentOrder: {-->
<!--      immediate: true,-->
<!--      handler(newOrder) {-->
<!--        if (newOrder) {-->
<!--          // Deep clone to avoid reference issues-->
<!--          this.qcOrderForm = JSON.parse(JSON.stringify(newOrder));-->
<!--          this.originalQcOrderForm = JSON.parse(JSON.stringify(newOrder));-->
<!--        }-->
<!--      },-->
<!--    },-->
<!--  },-->
<!--  computed: {-->
<!--    isFormModified() {-->
<!--      return JSON.stringify(this.qcOrderForm) !== JSON.stringify(this.originalQcOrderForm);-->
<!--    },-->
<!--    userOptions() {-->
<!--      return Object.values(this.userMap).map(user => ({-->
<!--        label: user.name,-->
<!--        value: user.id-->
<!--      }));-->
<!--    }-->
<!--  },-->
<!--  mounted() {-->
<!--    this.loadAllOptions()-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      isSubmitted: false,-->
<!--      dateFormat: "YYYY-MM-DD HH:mm:ss",-->
<!--      valueFormat: "YYYY-MM-DDTHH:mm:ssZ",-->
<!--      qcOrderForm: null,-->
<!--      originalQcOrderForm: null, // Store the original order for comparison-->
<!--      validationRules: {-->
<!--        name: [-->
<!--          {required: true, message: "请输入工单名称", trigger: "blur"},-->
<!--          { max: 255, message: "工单名称不能超过255个字符", trigger: "blur" }-->
<!--        ],-->
<!--      },-->
<!--      instrumentOptions: [],-->
<!--      samplingLocationOptions: [],-->
<!--      testSubjectOptions: [],-->
<!--      productOptions: [],-->
<!--      rawMaterialOptions: [],-->
<!--      productionWorkOrderOptions: [],-->
<!--      equipmentOptions: [],-->
<!--      maintenanceWorkOrderOptions: [],-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    disablePastDates(date) {-->
<!--      return date.getTime() < Date.now() - 86400000; // Disable dates before today-->
<!--    },-->
<!--    addDispatch() {-->
<!--      const newDispatch = {-->
<!--        id: null,-->
<!--        type: "regular",-->
<!--        name: "",-->
<!--        description: "",-->
<!--        state: 1,-->
<!--        cron_expression: "* * * * *",-->
<!--        start_time: null,-->
<!--        end_time: null,-->
<!--        dispatch_limit: -1,-->
<!--        due_date_offset_minute: 60,-->
<!--        custom_time: null,-->
<!--        executed_count: 0,-->
<!--        date_range: [],-->
<!--        user_ids: [],-->
<!--        form_ids: [],-->
<!--        sampling_location_ids: [],-->
<!--        test_subject_ids: [],-->
<!--        instrument_ids: [],-->
<!--        maintenance_work_order_ids: [],-->
<!--        equipment_ids: [],-->
<!--        production_work_order_ids: [],-->
<!--        raw_material_ids: [],-->
<!--        product_ids: [],-->
<!--        collapsed: false,-->
<!--        isUnlimited: true,-->
<!--        dropdownUserIds: [],-->
<!--        teamTreeUserIds: [],-->
<!--      };-->
<!--      this.qcOrderForm.dispatches.push(newDispatch);-->
<!--    },-->
<!--    removeDispatch(index) {-->
<!--      this.qcOrderForm.dispatches.splice(index, 1);-->
<!--    },-->
<!--    toggleCollapse(index) {-->
<!--      this.qcOrderForm.dispatches[index].collapsed =-->
<!--          !this.qcOrderForm.dispatches[index].collapsed;-->
<!--    },-->
<!--    // Update data from dispatch form tree select-->
<!--    handleSelectedForms(forms, index) {-->
<!--      this.qcOrderForm.dispatches[index].form_ids = forms.map((form) => form.id);-->
<!--    },-->
<!--    submitForm() {-->
<!--      this.isSubmitted = true;  // Set before validation to trigger error states-->

<!--      this.$refs.formRef.validate(async (valid) => {-->
<!--        if (valid) {-->
<!--          try {-->
<!--            const payload = {-->
<!--              id: this.qcOrderForm.id || null,-->
<!--              name: this.qcOrderForm.name,-->
<!--              description: this.qcOrderForm.description,-->
<!--              status: this.qcOrderForm.status,-->
<!--              state: this.qcOrderForm.state,-->
<!--              created_at: this.qcOrderForm.created_at || null,-->
<!--              created_by: this.qcOrderForm.created_by || null,-->
<!--              updated_at: this.qcOrderForm.updated_at || null,-->
<!--              updated_by: this.qcOrderForm.updated_by || null,-->
<!--              dispatches: this.qcOrderForm.dispatches.map((dispatch) =>-->
<!--                  (this.getDispatchAPIPayload(dispatch))),-->
<!--            };-->
<!--            let message;-->

<!--            if (payload.id == null) {-->
<!--              payload.created_by = this.$store.getters.getUser.id;-->
<!--              payload.created_at = new Date().toISOString();-->
<!--              message = "确定提交工单吗?";-->
<!--            } else {-->
<!--              payload.updated_by = this.$store.getters.getUser.id;-->
<!--              payload.updated_at = new Date().toISOString();-->
<!--              message = "确认提交工单吗? 所有未开始任务将被取消,并按照新设置重新派发.";-->
<!--            }-->

<!--            await this.$confirm(message, "提示", {-->
<!--              confirmButtonText: "确定",-->
<!--              cancelButtonText: "取消",-->
<!--              type: "warning",-->
<!--            });-->

<!--            this.$emit("on-submit", payload); // Emit success event to parent-->
<!--          } catch (error) {-->
<!--          }-->
<!--        } else {-->
<!--          await this.$alert("请填写所有必填字段后再提交。", "提示", {-->
<!--            confirmButtonText: "确定",-->
<!--            type: "error",-->
<!--          });-->
<!--        }-->
<!--      });-->
<!--    },-->
<!--    async resetForm() {-->
<!--      await this.$confirm("确定重置工单吗？", "提示", {-->
<!--        confirmButtonText: "确定",-->
<!--        cancelButtonText: "取消",-->
<!--        type: "warning",-->
<!--      });-->
<!--      this.$emit("reset-form");-->
<!--      this.isSubmitted = false;-->
<!--    },-->
<!--    // Transform dispatch data to match backend api request-->
<!--    getDispatchAPIPayload(dispatchData) {-->
<!--      let payload = {-->
<!--        id: dispatchData.id || null,-->
<!--        executed_count: 0,-->
<!--        status:1,-->
<!--        state:1,-->
<!--        created_at: dispatchData.created_at || null,-->
<!--        created_by: dispatchData.created_by || null,-->
<!--        updated_at: dispatchData.updated_at || null,-->
<!--        updated_by: dispatchData.updated_by || null,-->
<!--        type: dispatchData.type,-->
<!--        name: dispatchData.name || null,-->
<!--        description: dispatchData.description || null,-->
<!--        start_time: dispatchData.date_range?.[0] || null,-->
<!--        end_time: dispatchData.date_range?.[1] || null,-->
<!--        cron_expression: dispatchData.cron_expression? normalizeCronExpression(dispatchData.cron_expression) : null,-->
<!--        dispatch_limit: dispatchData.isUnlimited === true ? -1 : dispatchData.dispatch_limit,-->
<!--        custom_time: dispatchData.custom_time || null,-->
<!--        due_date_offset_minute: dispatchData.due_date_offset_minute,-->
<!--        user_ids: dispatchData.user_ids,-->
<!--        form_ids: dispatchData.form_ids,-->
<!--        product_ids: dispatchData.product_ids || [],-->
<!--        raw_material_ids: dispatchData.raw_material_ids || [],-->
<!--        production_work_order_ids: dispatchData.production_work_order_ids || [],-->
<!--        equipment_ids: dispatchData.equipment_ids || [],-->
<!--        maintenance_work_order_ids: dispatchData.maintenance_work_order_ids || [],-->
<!--        sampling_location_ids: dispatchData.sampling_location_ids || [],-->
<!--        instrument_ids: dispatchData.instrument_ids || [],-->
<!--        test_subject_ids: dispatchData.test_subject_ids || [],-->
<!--      };-->

<!--      if (payload.type === 'custom') {-->
<!--        payload.cron_expression = null;-->
<!--        payload.start_time = null;-->
<!--        payload.end_time = null;-->
<!--        payload.dispatch_limit = null;-->
<!--      }-->

<!--      if (payload.id == null) {-->
<!--        payload.created_by = this.$store.getters.getUser.id;-->
<!--        payload.created_at = new Date().toISOString();-->
<!--      } else {-->
<!--        payload.updated_by = this.$store.getters.getUser.id;-->
<!--        payload.updated_at = new Date().toISOString();-->
<!--      }-->

<!--      return payload;-->
<!--    },-->
<!--    async loadProductOptions() {-->
<!--      try {-->
<!--        const response = await getAllProducts();-->
<!--        const products = response.data?.data || [];-->
<!--        this.productOptions = products.map((product) => ({-->
<!--          id : product.id,-->
<!--          name: product.name,-->
<!--        }));-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load products:", error);-->
<!--      }-->
<!--    },-->
<!--    async loadRawMaterialOptions() {-->
<!--      try {-->
<!--        const response = await getAllRawMaterials();-->
<!--        const rawMaterials = response.data?.data || [];-->
<!--        this.rawMaterialOptions = rawMaterials.map((material) => ({-->
<!--          id: material.id,-->
<!--          name: material.name,-->
<!--        }));-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load raw materials:", error);-->
<!--      }-->
<!--    },-->
<!--    async loadProductionWorkOrderOptions() {-->
<!--      try {-->
<!--        const response = await getAllProductionWorkOrders();-->
<!--        const workOrders = response.data?.data || [];-->
<!--        this.productionWorkOrderOptions = workOrders.map((workOrder) => ({-->
<!--          id: workOrder.id,-->
<!--          name: `${workOrder.name} (${workOrder.code})`,-->
<!--        }));-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load production work orders:", error);-->
<!--      }-->
<!--    },-->
<!--    async loadEquipmentOptions() {-->
<!--      try {-->
<!--        const response = await getAllEquipments();-->
<!--        const equipments = response.data?.data || [];-->
<!--        this.equipmentOptions = equipments.map((equipment) => ({-->
<!--          id: equipment.id,-->
<!--          name: `${equipment.name} (${equipment.code})`,-->
<!--        }));-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load equipments:", error);-->
<!--      }-->
<!--    },-->
<!--    async loadMaintenanceWorkOrderOptions() {-->
<!--      try {-->
<!--        const response = await getAllMaintenanceWorkOrders();-->

<!--        // Extract the data array from the response-->
<!--        const workOrders = response.data?.data || [];-->

<!--        // Map the work orders into options for the dropdown-->
<!--        this.maintenanceWorkOrderOptions = workOrders.map((workOrder) => ({-->
<!--          id: workOrder.id,        // Use `id` as the value-->
<!--          name: `${workOrder.name} (${workOrder.code})`, // Combine `name` and `code` for clarity-->
<!--        }));-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load maintenance work orders:", error);-->
<!--      }-->
<!--    },-->
<!--    async loadInstrumentOptions() {-->
<!--      try {-->
<!--        const response = await getAllInstruments();-->
<!--        const instruments = response.data?.data || [];-->
<!--        this.instrumentOptions = instruments.map((instrument) => ({-->
<!--          id: instrument.id,-->
<!--          name: `${instrument.name}`,-->
<!--        }));-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load instruments:", error);-->
<!--      }-->
<!--    },-->
<!--    async loadTestSubjectOptions() {-->
<!--      try {-->
<!--        const response = await getAllTestSubjects();-->
<!--        const testSubjects = response.data?.data || [];-->
<!--        this.testSubjectOptions = testSubjects.map((testSubject) => ({-->
<!--          id: testSubject.id,-->
<!--          name: `${testSubject.name}`,-->
<!--        }));-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load test subject:", error);-->
<!--      }-->
<!--    },-->
<!--    async loadSamplingLocationOptions() {-->
<!--      try {-->
<!--        const response = await getAllSamplingLocations();-->
<!--        const samplingLocations = response.data?.data || [];-->
<!--        this.samplingLocationOptions = samplingLocations.map((samplingLocation) => ({-->
<!--          id: samplingLocation.id,-->
<!--          name: `${samplingLocation.name}`,-->
<!--        }));-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load sampling location:", error);-->
<!--      }-->
<!--    },-->
<!--    async loadAllOptions() {-->
<!--      await Promise.all([-->
<!--        this.loadProductOptions(),-->
<!--        this.loadRawMaterialOptions(),-->
<!--        this.loadProductionWorkOrderOptions(),-->
<!--        this.loadEquipmentOptions(),-->
<!--        this.loadMaintenanceWorkOrderOptions(),-->
<!--        this.loadInstrumentOptions(),-->
<!--        this.loadSamplingLocationOptions(),-->
<!--        this.loadTestSubjectOptions(),-->
<!--      ]);-->
<!--    },-->
<!--    async handleFormNodeClicked(formTemplateId) {-->
<!--      await openFormPreviewWindow(formTemplateId, this)-->
<!--    },-->
<!--    async handleUserTeamTreeSelection(userIdsFromTree, index) {-->
<!--      // Retrieve the dispatch object at the given index-->
<!--      const dispatch = this.qcOrderForm.dispatches[index];-->

<!--      if (!dispatch) {-->
<!--        console.error("Invalid dispatch index:", index);-->
<!--        return;-->
<!--      }-->

<!--      dispatch.teamTreeUserIds = userIdsFromTree;-->

<!--      // Merge `dispatch.user_ids` (el-select) and `userIdsFromTree`-->
<!--      dispatch.user_ids = [...new Set([...dispatch.dropdownUserIds, ...dispatch.teamTreeUserIds])]; // OR: Array.from(mergedUserIds);-->
<!--    },-->
<!--    addUniqueUserIdsToDispatch(newUserIds, index) {-->
<!--      console.log("AddUniqueUserIdsToDispatch", index);-->
<!--      const dispatch = this.qcOrderForm.dispatches[index];-->

<!--      if (!dispatch) {-->
<!--        console.error("Invalid dispatch index:", index);-->
<!--        return;-->
<!--      }-->

<!--      // Ensure teamTreeUserIds exists-->
<!--      if (!dispatch.teamTreeUserIds) {-->
<!--        dispatch.teamTreeUserIds = [];-->
<!--      }-->

<!--      // Merge `dropdownUserIds` (new selection) and `teamTreeUserIds`-->
<!--      const mergedUserIds = new Set([...newUserIds, ...dispatch.teamTreeUserIds]);-->

<!--      // Convert Set to Array and update `user_ids`-->
<!--      dispatch.user_ids = [...mergedUserIds];-->
<!--    }-->
<!--  },-->
<!--}-->


<!--</script>-->

<!--<style scoped>-->


<!--</style>-->
