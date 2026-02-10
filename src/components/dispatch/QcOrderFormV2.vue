<!--<template>-->
<!--  <el-container style="display: flex; height: 100%; overflow-y: hidden;">-->
<!--    &lt;!&ndash; Left Section - QcOrderForm &ndash;&gt;-->
<!--    <el-main style="flex: 7; max-height: 75vh">-->
<!--&lt;!&ndash;    <el-main style="flex: 7; padding: 20px; display: flex; flex-direction: column; height: 100%;">&ndash;&gt;-->
<!--    &lt;!&ndash; Scrollable Form Area &ndash;&gt;-->
<!--&lt;!&ndash;      <div style="flex: 1; overflow-y: auto; padding-right: 10px;">&ndash;&gt;-->
<!--      <el-form-->
<!--          :model="qcOrderForm"-->
<!--          :rules="validationRules"-->
<!--          ref="formRef"-->
<!--          label-position="left"-->
<!--          label-width="200px"-->
<!--      >-->
<!--        &lt;!&ndash; QC Order Name &ndash;&gt;-->
<!--        <el-form-item-->
<!--            :label="translate('orderManagement.orderDetailDialog.orderName')"-->
<!--            required-->
<!--            prop="name"-->
<!--        >-->
<!--          <el-input-->
<!--              v-model="qcOrderForm.name"-->
<!--              :placeholder="translate('orderManagement.orderFormDialog.orderNamePlaceholder')"-->
<!--              maxlength="255"-->
<!--          />-->
<!--        </el-form-item>-->

<!--        &lt;!&ndash; Description &ndash;&gt;-->
<!--        <el-form-item-->
<!--            :label="translate('orderManagement.description')"-->
<!--        >-->
<!--          <el-input-->
<!--              type="textarea"-->
<!--              v-model="qcOrderForm.description"-->
<!--              :placeholder="translate('orderManagement.orderFormDialog.descriptionPlaceholder')"-->
<!--          >-->
<!--          </el-input>-->
<!--        </el-form-item>-->

<!--        &lt;!&ndash; Dispatch List &ndash;&gt;-->
<!--        <el-divider>{{translate('orderManagement.orderDetailDialog.dispatchesDivider')}}</el-divider>-->
<!--        <div-->
<!--            v-for="(dispatch, index) in qcOrderForm.dispatches"-->
<!--            :key="dispatch.id"-->
<!--            style="margin-bottom: 20px;"-->
<!--        >-->
<!--          <el-card shadow="always">-->
<!--            &lt;!&ndash; Custom Header Slot &ndash;&gt;-->
<!--            <template #header>-->
<!--              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: bold;">-->
<!--                <span>-->
<!--                  {{ translate('orderManagement.dispatchPlan') }} {{ index + 1 }}-->
<!--                  <span v-if="dispatch.name"> - {{ dispatch.name }}</span>-->
<!--                </span>-->
<!--                <div style="display: flex; gap: 8px;">-->
<!--                  &lt;!&ndash; Expand Button &ndash;&gt;-->
<!--                  <el-button-->
<!--                      :link="true"-->
<!--                      @click="toggleCollapse(index)"-->
<!--                      :icon="dispatch.collapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"-->
<!--                  >-->
<!--                    {{ dispatch.collapsed ? translate('orderManagement.orderFormDialog.expandButton') : translate('orderManagement.orderFormDialog.collapseButton') }}-->
<!--                  </el-button>-->
<!--                  &lt;!&ndash; Remove Dispatch Button &ndash;&gt;-->
<!--                  <el-button-->
<!--                      type="danger"-->
<!--                      plain-->
<!--                      @click="removeDispatch(index)"-->
<!--                  >-->
<!--                    {{ translate('orderManagement.orderFormDialog.deleteDispatchButton') }}-->
<!--                  </el-button>-->
<!--                </div>-->
<!--              </div>-->
<!--            </template>-->

<!--            &lt;!&ndash; Dispatch Form&ndash;&gt;-->
<!--            <div v-show="!dispatch.collapsed">-->
<!--              &lt;!&ndash; Name &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  :label="translate('orderManagement.dispatchPlanName')">-->
<!--                <el-input-->
<!--                    type="text"-->
<!--                    v-model="dispatch.name"-->
<!--                    :placeholder="translate('orderManagement.orderFormDialog.dispatchPlanNamePlaceholder')"-->
<!--                    :prop="'dispatches.' + index + '.name'"-->
<!--                    maxlength="255"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Description &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  :label="translate('orderManagement.description')"-->
<!--                  prop="description">-->
<!--                <el-input-->
<!--                    type="textarea"-->
<!--                    v-model="dispatch.description"-->
<!--                    :placeholder="translate('orderManagement.orderFormDialog.descriptionPlaceholder')"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              <el-divider>{{translate('orderManagement.orderDetailDialog.dispatchConfigDivider')}}</el-divider>-->

<!--              &lt;!&ndash; Schedule Type &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  :label="translate('orderManagement.type')"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.type'"-->
<!--              >-->
<!--                <el-radio-group-->
<!--                    v-model="dispatch.type"-->
<!--                >-->
<!--                  <el-radio value="regular"> {{ translate('orderManagement.orderFormDialog.periodicPlan')}} </el-radio>-->
<!--                  <el-radio value="custom"> {{ translate('orderManagement.orderFormDialog.oneTimePlan')}} </el-radio>-->
<!--                </el-radio-group>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Cron Expression &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-if="dispatch.type === 'regular'"-->
<!--                  :label="translate('orderManagement.orderDetailDialog.executionLogic')"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.cron_expression'"-->
<!--              >-->
<!--                <cron-element-plus-->
<!--                    v-model="dispatch.cron_expression"-->
<!--                    :button-props="{ type: 'primary' }"-->
<!--                    :period="dispatch.source === 'team' ? 'day' : 'hour'"-->
<!--                    :disabled="dispatch.source === 'team'"-->
<!--                    :locale="currentLanguage"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Start/End Time for CRON &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-if="dispatch.type === 'regular'"-->
<!--                  :label="translate('orderManagement.orderFormDialog.executionPeriod')"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.date_range'"-->
<!--                  :rules="[{-->
<!--                    required: true,-->
<!--                    message: translate('orderManagement.validation.executionPeriodRequired'),-->
<!--                    trigger: ['change'],-->
<!--                    }]"-->
<!--              >-->
<!--                <el-date-picker-->
<!--                    v-model="dispatch.date_range"-->
<!--                    type="datetimerange"-->
<!--                    range-separator="To"-->
<!--                    :start-placeholder="translate('orderManagement.orderDetailDialog.periodStartTime')"-->
<!--                    :end-placeholder="translate('orderManagement.orderDetailDialog.periodEndTime')"-->
<!--                    :format="dateFormat"-->
<!--                    :value-format="valueFormat"-->
<!--                    :disabled-date="disablePastDates"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Single Execution Date &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-else-->
<!--                  :label="translate('orderManagement.orderFormDialog.executionTime')"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.custom_time'"-->
<!--                  :rules="[{required: true, message: translate('orderManagement.validation.executionTimeRequired'), trigger: 'change'},]"-->
<!--              >-->
<!--                <el-date-picker-->
<!--                    v-model="dispatch.custom_time"-->
<!--                    type="datetime"-->
<!--                    :placeholder="translate('orderManagement.orderFormDialog.executionTimePlaceholder')"-->
<!--                    :format="dateFormat"-->
<!--                    :value-format="valueFormat"-->
<!--                    :disabled-date="disablePastDates"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Dispatch Limit &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-if="dispatch.type === 'regular' && dispatch.source !== 'team'"-->
<!--                  :label="translate('orderManagement.orderDetailDialog.dispatchLimit')"-->
<!--              >-->
<!--                <el-col :span="12">-->
<!--                  <el-form-item-->
<!--                      :prop="'dispatches.' + index + '.isUnlimited'">-->
<!--                    <el-radio-group-->
<!--                        v-model="dispatch.isUnlimited"-->
<!--                    >-->
<!--                      <el-radio :value="true">{{ translate('orderManagement.orderFormDialog.unlimited') }}</el-radio>-->
<!--                      <el-radio :value="false">{{ translate('orderManagement.orderFormDialog.limited') }}</el-radio>-->
<!--                    </el-radio-group>-->
<!--                  </el-form-item>-->
<!--                </el-col>-->
<!--                <el-col :span="12">-->
<!--                  <el-form-item-->
<!--                      v-if="!dispatch.isUnlimited"-->
<!--                      :prop="'dispatches.' + index + '.dispatch_limit'"-->
<!--                      :rules="[{-->
<!--                        required: true,-->
<!--                        message: translate('orderManagement.validation.dispatchLimitInputRequired'),-->
<!--                        trigger: ['change'],-->
<!--                      }]"-->
<!--                  >-->
<!--                    <el-input-number-->
<!--                        v-model="dispatch.dispatch_limit"-->
<!--                        :min="1"-->
<!--                        :max="9999"-->
<!--                        :precision="0"-->
<!--                        style="margin-left: 10px;"-->
<!--                    />-->
<!--                  </el-form-item>-->
<!--                </el-col>-->
<!--              </el-form-item>-->

<!--              <el-divider>{{ translate('orderManagement.orderDetailDialog.taskConfigDivider') }}</el-divider>-->
<!--              &lt;!&ndash; Due Date Offset &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-if="dispatch.source !== 'team'"-->
<!--                  :label="translate('orderManagement.orderDetailDialog.taskDueDateOffset')"-->
<!--                  required-->
<!--                  :prop="'dispatches.' + index + '.due_date_offset_minute'"-->
<!--                  :rules="[{-->
<!--                        required: true,-->
<!--                        message: translate('orderManagement.validation.dueDateOffsetMinuteRequired'),-->
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

<!--              &lt;!&ndash; Commented out due to requirement change&ndash;&gt;-->
<!--&lt;!&ndash;              &lt;!&ndash; Test Subject Selection &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;              <el-form-item&ndash;&gt;-->
<!--&lt;!&ndash;                  label="检测项目"&ndash;&gt;-->
<!--&lt;!&ndash;                  :prop="'dispatches.' + index + '.test_subject_ids'"&ndash;&gt;-->
<!--&lt;!&ndash;              >&ndash;&gt;-->
<!--&lt;!&ndash;                <el-select&ndash;&gt;-->
<!--&lt;!&ndash;                    v-model="dispatch.test_subject_ids"&ndash;&gt;-->
<!--&lt;!&ndash;                    placeholder="请选择检测项目"&ndash;&gt;-->
<!--&lt;!&ndash;                    multiple&ndash;&gt;-->
<!--&lt;!&ndash;                    filterable&ndash;&gt;-->
<!--&lt;!&ndash;                    :fit-input-width="true"&ndash;&gt;-->
<!--&lt;!&ndash;                >&ndash;&gt;-->
<!--&lt;!&ndash;                  <el-option&ndash;&gt;-->
<!--&lt;!&ndash;                      v-for="subject in testSubjectOptions"&ndash;&gt;-->
<!--&lt;!&ndash;                      :key="subject.id"&ndash;&gt;-->
<!--&lt;!&ndash;                      :label="subject.name"&ndash;&gt;-->
<!--&lt;!&ndash;                      :value="subject.id"&ndash;&gt;-->
<!--&lt;!&ndash;                  />&ndash;&gt;-->
<!--&lt;!&ndash;                </el-select>&ndash;&gt;-->
<!--&lt;!&ndash;              </el-form-item>&ndash;&gt;-->

<!--&lt;!&ndash;              &lt;!&ndash; Sampling Location Selection &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;              <el-form-item&ndash;&gt;-->
<!--&lt;!&ndash;                  label="采样位置"&ndash;&gt;-->
<!--&lt;!&ndash;                  :prop="'dispatches.' + index + '.sampling_location_ids'"&ndash;&gt;-->
<!--&lt;!&ndash;              >&ndash;&gt;-->
<!--&lt;!&ndash;                <el-select&ndash;&gt;-->
<!--&lt;!&ndash;                    v-model="dispatch.sampling_location_ids"&ndash;&gt;-->
<!--&lt;!&ndash;                    placeholder="请选择采样位置"&ndash;&gt;-->
<!--&lt;!&ndash;                    multiple&ndash;&gt;-->
<!--&lt;!&ndash;                    filterable&ndash;&gt;-->
<!--&lt;!&ndash;                    :fit-input-width="true"&ndash;&gt;-->
<!--&lt;!&ndash;                >&ndash;&gt;-->
<!--&lt;!&ndash;                  <el-option&ndash;&gt;-->
<!--&lt;!&ndash;                      v-for="location in samplingLocationOptions"&ndash;&gt;-->
<!--&lt;!&ndash;                      :key="location.id"&ndash;&gt;-->
<!--&lt;!&ndash;                      :label="location.name"&ndash;&gt;-->
<!--&lt;!&ndash;                      :value="location.id"&ndash;&gt;-->
<!--&lt;!&ndash;                  />&ndash;&gt;-->
<!--&lt;!&ndash;                </el-select>&ndash;&gt;-->
<!--&lt;!&ndash;              </el-form-item>&ndash;&gt;-->

<!--&lt;!&ndash;              &lt;!&ndash; Instrument Selection &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;              <el-form-item&ndash;&gt;-->
<!--&lt;!&ndash;                  label="仪器"&ndash;&gt;-->
<!--&lt;!&ndash;                  :prop="'dispatches.' + index + '.instrument_ids'">&ndash;&gt;-->
<!--&lt;!&ndash;                <el-select&ndash;&gt;-->
<!--&lt;!&ndash;                    v-model="dispatch.instrument_ids"&ndash;&gt;-->
<!--&lt;!&ndash;                    placeholder="请选择仪器"&ndash;&gt;-->
<!--&lt;!&ndash;                    multiple&ndash;&gt;-->
<!--&lt;!&ndash;                    filterable&ndash;&gt;-->
<!--&lt;!&ndash;                    :fit-input-width="true"&ndash;&gt;-->
<!--&lt;!&ndash;                >&ndash;&gt;-->
<!--&lt;!&ndash;                  <el-option&ndash;&gt;-->
<!--&lt;!&ndash;                      v-for="instrument in instrumentOptions"&ndash;&gt;-->
<!--&lt;!&ndash;                      :key="instrument.id"&ndash;&gt;-->
<!--&lt;!&ndash;                      :label="instrument.name"&ndash;&gt;-->
<!--&lt;!&ndash;                      :value="instrument.id"&ndash;&gt;-->
<!--&lt;!&ndash;                  />&ndash;&gt;-->
<!--&lt;!&ndash;                </el-select>&ndash;&gt;-->
<!--&lt;!&ndash;              </el-form-item>&ndash;&gt;-->

<!--              &lt;!&ndash; User Selection &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  v-if="dispatch.source !== 'team'"-->
<!--                  :label="translate('orderManagement.orderTable.associatedUsers')"-->
<!--                  :prop="'dispatches.' + index + '.user_ids'"-->
<!--                  required-->
<!--                  :rules="[{-->
<!--                      required: true,-->
<!--                      message: translate('orderManagement.validation.userRequired'),-->
<!--                      trigger: ['change'],-->
<!--                      }]"-->
<!--              >-->
<!--                <el-select-v2-->
<!--                    v-model="dispatch.dropdownUserIds"-->
<!--                    multiple-->
<!--                    filterable-->
<!--                    :placeholder="translate('orderManagement.orderFormDialog.userSelectPlaceholder')"-->
<!--                    :fit-input-width="true"-->
<!--                    :options="userOptions"-->
<!--                    @change="addUniqueUserIdsToDispatch($event, index)"-->
<!--                    style="width: 100%"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Team User Tree Selection &ndash;&gt;-->
<!--              <el-form-item-->
<!--                  :prop="'dispatches.' + index + '.user_ids'"-->
<!--              >-->
<!--                <UserTeamTree-->
<!--                    :teamIdArray="[dispatch.team_id]"-->
<!--                    @update-selected-users="(users) => handleUserTeamTreeSelection(users, index)"-->
<!--                />-->
<!--              </el-form-item>-->

<!--              <DispatchFormTreeSelect-->
<!--                  :selected-form-ids="dispatch.form_ids"-->
<!--                  :prop-name="`dispatches.${index}.form_ids`"-->
<!--                  :has-error="isSubmitted && dispatch.form_ids.length === 0"-->
<!--                  @update-selected-forms="(forms) => handleFormsTreeChanges(forms, index)"-->
<!--                  @on-node-clicked="handleFormNodeClicked"-->
<!--              />-->

<!--              <el-divider>{{ translate('orderManagement.orderFormDialog.productionModuleDivider') }}</el-divider>-->

<!--              &lt;!&ndash; Product Selection &ndash;&gt;-->
<!--              <el-form-item :label="translate('orderManagement.orderFormDialog.product')">-->
<!--                <el-select v-model="dispatch.product_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           :placeholder="translate('orderManagement.orderFormDialog.productPlaceholder')"-->
<!--                           :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option v-for="product in productOptions"-->
<!--                             :key="product.id"-->
<!--                             :label="product.name"-->
<!--                             :value="product.id" />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Production Work Order Selection &ndash;&gt;-->
<!--              <el-form-item :label="translate('orderManagement.orderFormDialog.productionWorkOrder')">-->
<!--                <el-select v-model="dispatch.production_work_order_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           :placeholder="translate('orderManagement.orderFormDialog.productionWorkOrderPlaceholder')"-->
<!--                           :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option v-for="workOrder in productionWorkOrderOptions"-->
<!--                             :key="workOrder.id"-->
<!--                             :label="workOrder.name"-->
<!--                             :value="workOrder.id" />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Raw Material Selection &ndash;&gt;-->
<!--              <el-form-item :label="translate('orderManagement.orderFormDialog.rawMaterial')">-->
<!--                <el-select v-model="dispatch.raw_material_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           :placeholder="translate('orderManagement.orderFormDialog.rawMaterialPlaceholder')"-->
<!--                           :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option v-for="material in rawMaterialOptions"-->
<!--                             :key="material.id"-->
<!--                             :label="material.name"-->
<!--                             :value="material.id" />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              <el-divider>{{ translate('orderManagement.orderFormDialog.maintenanceModuleDivider') }}</el-divider>-->
<!--              &lt;!&ndash; Maintenance Work Order Selection &ndash;&gt;-->
<!--              <el-form-item :label="translate('orderManagement.orderFormDialog.maintenanceWorkOrder')">-->
<!--                <el-select v-model="dispatch.maintenance_work_order_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           :placeholder="translate('orderManagement.orderFormDialog.maintenanceWorkOrderPlaceholder')"-->
<!--                           :fit-input-width="true"-->
<!--                >-->
<!--                  <el-option v-for="workOrder in maintenanceWorkOrderOptions"-->
<!--                             :key="workOrder.id"-->
<!--                             :label="workOrder.name"-->
<!--                             :value="workOrder.id" />-->
<!--                </el-select>-->
<!--              </el-form-item>-->

<!--              &lt;!&ndash; Equipment Selection &ndash;&gt;-->
<!--              <el-form-item :label="translate('orderManagement.orderFormDialog.equipment')">-->
<!--                <el-select v-model="dispatch.equipment_ids"-->
<!--                           multiple-->
<!--                           filterable-->
<!--                           :placeholder="translate('orderManagement.orderFormDialog.equipmentPlaceholder')"-->
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
<!--      </el-form>-->

<!--      &lt;!&ndash; Fixed Bottom (Action Buttons) &ndash;&gt;-->
<!--      <div style="flex-shrink: 0; border-top: 1px solid #ebeef5; display: flex;">-->
<!--        &lt;!&ndash; Add Dispatch &ndash;&gt;-->
<!--        <el-button-->
<!--            type="primary"-->
<!--            plain-->
<!--            @click="() => addDispatch()"-->
<!--        >-->
<!--          {{ translate('orderManagement.orderFormDialog.addDispatchButton') }}-->
<!--        </el-button>-->

<!--        &lt;!&ndash; Add Plan By Team  &ndash;&gt;-->
<!--        <el-button-->
<!--            type="primary"-->
<!--            plain-->
<!--            style="margin-right: 12px"-->
<!--            @click="isPlanPopulateByTeamVisible = true"-->
<!--        >-->
<!--          {{ translate('orderManagement.orderFormDialog.addDispatchByTeamButton') }}-->
<!--        </el-button>-->

<!--        &lt;!&ndash; Dialog Modal &ndash;&gt;-->
<!--        <el-dialog-->
<!--            :title="translate('orderManagement.teamPopulatePlanDialog.title')"-->
<!--            v-model="isPlanPopulateByTeamVisible"-->
<!--            width="400px"-->
<!--            :close-on-click-modal="false"-->
<!--        >-->
<!--          <div style="display: flex; flex-direction: column; gap: 12px;">-->
<!--            &lt;!&ndash; Team Selector &ndash;&gt;-->
<!--            <el-select-v2-->
<!--                v-model="selectedTeamId"-->
<!--                :placeholder="translate('orderManagement.teamPopulatePlanDialog.selectTeamPlaceholder')"-->
<!--                multiple-->
<!--                filterable-->
<!--                :options="teamOptions"-->
<!--                clearable-->
<!--                style="width: 100%;"-->
<!--            />-->

<!--            &lt;!&ndash; Selected Team Description &ndash;&gt;-->
<!--            <div-->
<!--                v-if="selectedTeamDetails.length"-->
<!--                style="max-height: 200px; overflow-y: auto; border-top: 1px solid #ebeef5; padding-top: 10px;"-->
<!--            >-->
<!--              <div-->
<!--                  v-for="team in selectedTeamDetails"-->
<!--                  :key="team.id"-->
<!--                  style="margin-bottom: 10px; font-size: 13px; color: #606266;"-->
<!--              >-->
<!--                <strong>{{ team.name }}</strong>-->
<!--                <ul style="padding-left: 18px; margin: 4px 0;">-->
<!--                  <li>{{ translate('orderManagement.teamPopulatePlanDialog.teamPlanExecutionLogic') }}</li>-->
<!--                  <li>{{ translate('orderManagement.teamPopulatePlanDialog.teamPlanDueDate') }}</li>-->
<!--                  <li>{{ translate('orderManagement.teamPopulatePlanDialog.associatedFormCount') }}：{{ team.form_ids.length }}</li>-->
<!--                  <li>{{ translate('orderManagement.teamPopulatePlanDialog.associatedUserCount') }}：{{ team.user_ids.length }}</li>-->
<!--                </ul>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

<!--          &lt;!&ndash; Footer &ndash;&gt;-->
<!--          <template #footer>-->
<!--            <el-button @click="isPlanPopulateByTeamVisible = false">{{ translate('orderManagement.cancel') }}</el-button>-->
<!--            <el-button-->
<!--                type="primary"-->
<!--                :disabled="!selectedTeamId || selectedTeamId.length === 0"-->
<!--                @click="handlePopulateDispatchAndClose"-->
<!--            >-->
<!--              {{ translate('orderManagement.confirm') }}-->
<!--            </el-button>-->
<!--          </template>-->
<!--        </el-dialog>-->

<!--        <el-button-->
<!--            type="primary"-->
<!--            :disabled="!isFormModified"-->
<!--            @click="submitForm"-->
<!--        >-->
<!--          {{ translate('orderManagement.confirm') }}-->
<!--        </el-button>-->
<!--        <el-button type="warning" @click="resetForm">{{ translate('orderManagement.reset') }}</el-button>-->
<!--        <el-button @click="$emit('on-cancel')">{{ translate('orderManagement.cancel') }}</el-button>-->
<!--      </div>-->
<!--    </el-main>-->
<!--    &lt;!&ndash; Right Section - Preview &ndash;&gt;-->
<!--    <el-aside style="flex: 3; padding: 20px; max-height: 75vh; background: #f9f9f9; overflow-y: auto;">-->
<!--      <qc-order-preview-->
<!--          :qc-order-form="qcOrderForm"-->
<!--          :form-map="formMap"-->
<!--          :user-map="userMap"-->
<!--          :team-map="teamMap"-->
<!--      />-->
<!--    </el-aside>-->
<!--  </el-container>-->
<!--</template>-->

<!--<script>-->
<!--import DispatchFormTreeSelect from "@/components/dispatch/DispatchFormTreeSelect.vue";-->
<!--import {CronElementPlus} from "@vue-js-cron/element-plus";-->
<!--import {getCurrentLanguage, normalizeCronExpression, openFormPreviewWindow} from "@/utils/dispatch-utils";-->
<!--import {getAllProductionWorkOrders, getAllProducts, getAllRawMaterials} from "@/services/productionService";-->
<!--import {getAllEquipments, getAllMaintenanceWorkOrders} from "@/services/maintenanceService";-->
<!--import {getAllInstruments} from "@/services/instrumentService";-->
<!--import {getAllTestSubjects} from "@/services/testSubjectService";-->
<!--import {getAllSamplingLocations} from "@/services/samplingLocationService";-->
<!--import QcOrderPreview from "@/components/dispatch/QcOrderPreviewV2.vue"-->
<!--import UserTeamTree from "@/components/dispatch/UserTeamTree.vue";-->
<!--import {Avatar, Check} from "@element-plus/icons-vue";-->
<!--import {getAllTeamTree} from "@/services/teamService";-->
<!--import {getFormIdsForTeam} from "@/services/teamFormService";-->
<!--import {getUsersForTeam} from "@/services/teamUserService";-->
<!--import {translate} from "@/utils/i18n";-->


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
<!--    teamMap: {-->
<!--      type: Object,-->
<!--      required: true,-->
<!--    }-->
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
<!--    selectedTeamId: {-->
<!--      handler: 'fetchSelectedTeamDetails',-->
<!--      immediate: true,-->
<!--    },-->
<!--  },-->
<!--  computed: {-->
<!--    Check() {-->
<!--      return Check-->
<!--    },-->
<!--    Avatar() {-->
<!--      return Avatar-->
<!--    },-->
<!--    isFormModified() {-->
<!--      return JSON.stringify(this.qcOrderForm) !== JSON.stringify(this.originalQcOrderForm);-->
<!--    },-->
<!--    userOptions() {-->
<!--      return Object.values(this.userMap).map(user => ({-->
<!--        label: user.name,-->
<!--        value: user.id-->
<!--      }));-->
<!--    },-->
<!--    teamOptions() {-->
<!--      return this.teamSelectOptions-->
<!--          .filter(team => team.status === 1)-->
<!--          .map(team => (-->
<!--          {-->
<!--            value: team.id,-->
<!--            label:team.name-->
<!--          }))-->
<!--    },-->
<!--    selectedTeamDetails() {-->
<!--      return this.selectedTeamId.map(id => {-->
<!--        const team = this.teamMap[id] || {};-->
<!--        return {-->
<!--          ...team,-->
<!--          form_ids: team.form_ids || [],-->
<!--          user_ids: team.user_ids || [],-->
<!--        };-->
<!--      });-->
<!--    },-->
<!--  },-->
<!--  mounted() {-->
<!--    this.loadAllOptions()-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      currentLanguage: getCurrentLanguage(),-->
<!--      isSubmitted: false,-->
<!--      dateFormat: "YYYY-MM-DD HH:mm:ss",-->
<!--      valueFormat: "YYYY-MM-DDTHH:mm:ssZ",-->
<!--      qcOrderForm: null,-->
<!--      originalQcOrderForm: null, // Store the original order for comparison-->
<!--      validationRules: {-->
<!--        name: [-->
<!--          {required: true, message: translate('orderManagement.validation.orderNameRequired'), trigger: "blur"},-->
<!--          {max: 255, message: "工单名称不能超过255个字符", trigger: "blur"}-->
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
<!--      isPlanPopulateByTeamVisible: false,-->
<!--      emptyDispatchTemplate: {-->
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
<!--        source: 'manual',-->
<!--      },-->
<!--      teamSelectOptions: [],-->
<!--      selectedTeamId: [],-->
<!--      cronFields: [-->
<!--        {-->
<!--          id: 'day',-->
<!--          items: Array.from({ length: 31 }, (_, i) => ({-->
<!--            value: i + 1,-->
<!--            text: `${i + 1}`,-->
<!--            alt: `${i + 1}号`-->
<!--          }))-->
<!--        },-->
<!--        {-->
<!--          id: 'month',-->
<!--          items: Array.from({ length: 12 }, (_, i) => ({-->
<!--            value: i + 1,-->
<!--            text: `${i + 1}`,-->
<!--            alt: `${i + 1}月`-->
<!--          }))-->
<!--        },-->
<!--        {-->
<!--          id: 'dayOfWeek',-->
<!--          items: [-->
<!--            { value: 0, text: '周日' },-->
<!--            { value: 1, text: '周一' },-->
<!--            { value: 2, text: '周二' },-->
<!--            { value: 3, text: '周三' },-->
<!--            { value: 4, text: '周四' },-->
<!--            { value: 5, text: '周五' },-->
<!--            { value: 6, text: '周六' },-->
<!--          ]-->
<!--        }-->
<!--      ],-->
<!--    }-->
<!--  },-->
<!--  methods: {-->
<!--    getCurrentLanguage,-->
<!--    translate,-->
<!--    disablePastDates(date) {-->
<!--      return date.getTime() < Date.now() - 86400000; // Disable dates before today-->
<!--    },-->
<!--    addDispatch(dispatchObj = null) {-->
<!--      const dispatch = dispatchObj || this.cloneEmptyDispatchTemplate();-->
<!--      this.qcOrderForm.dispatches.push(dispatch)-->
<!--    },-->
<!--    removeDispatch(index) {-->
<!--      this.qcOrderForm.dispatches.splice(index, 1);-->
<!--    },-->
<!--    toggleCollapse(index) {-->
<!--      this.qcOrderForm.dispatches[index].collapsed =-->
<!--          !this.qcOrderForm.dispatches[index].collapsed;-->
<!--    },-->
<!--    handleFormsTreeChanges(forms, index) {-->
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
<!--                  (this.cleanupForDispatchApiPayload(dispatch))),-->
<!--            };-->
<!--            let message;-->

<!--            if (payload.id == null) {-->
<!--              payload.created_by = this.$store.getters.getUser.id;-->
<!--              payload.created_at = new Date().toISOString();-->
<!--              message = translate('orderManagement.messages.submitConfirmation');-->
<!--            } else {-->
<!--              payload.updated_by = this.$store.getters.getUser.id;-->
<!--              payload.updated_at = new Date().toISOString();-->
<!--              message = translate('orderManagement.messages.submitEditedOrderConfirmation');-->
<!--            }-->

<!--            await this.$confirm(message, translate('orderManagement.messages.messageTitle'), {-->
<!--              confirmButtonText: translate('orderManagement.confirm'),-->
<!--              cancelButtonText: translate('orderManagement.cancel'),-->
<!--              type: "warning",-->
<!--            });-->

<!--            this.$emit("on-submit", payload); // Emit success event to parent-->
<!--          } catch (error) {-->
<!--          }-->
<!--        } else {-->
<!--          await this.$alert(translate('orderManagement.messages.missingRequiredField'), translate('orderManagement.messages.messageTitle'), {-->
<!--            confirmButtonText: translate('orderManagement.confirm'),-->
<!--            type: "error",-->
<!--          });-->
<!--        }-->
<!--      });-->
<!--    },-->
<!--    async resetForm() {-->
<!--      await this.$confirm(translate('orderManagement.messages.resetConfirmation'), translate('orderManagement.messages.messageTitle'), {-->
<!--        confirmButtonText: translate('orderManagement.confirm'),-->
<!--        cancelButtonText: translate('orderManagement.cancel'),-->
<!--        type: "warning",-->
<!--      });-->
<!--      this.$emit("reset-form");-->
<!--      this.isSubmitted = false;-->
<!--    },-->
<!--    cleanupForDispatchApiPayload(dispatchData) {-->
<!--      let payload = {-->
<!--        id: dispatchData.id || null,-->
<!--        executed_count: 0,-->
<!--        status: 1,-->
<!--        state: 1,-->
<!--        created_at: dispatchData.created_at || null,-->
<!--        created_by: dispatchData.created_by || null,-->
<!--        updated_at: dispatchData.updated_at || null,-->
<!--        updated_by: dispatchData.updated_by || null,-->
<!--        type: dispatchData.type,-->
<!--        name: dispatchData.name || null,-->
<!--        description: dispatchData.description || null,-->
<!--        start_time: dispatchData.date_range?.[0] || null,-->
<!--        end_time: dispatchData.date_range?.[1] || null,-->
<!--        cron_expression: dispatchData.cron_expression ? normalizeCronExpression(dispatchData.cron_expression) : null,-->
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
<!--    togglePlanPopulateByTeam(){-->
<!--      this.isPlanPopulateByTeamVisible = !this.isPlanPopulateByTeamVisible;-->
<!--    },-->
<!--    async loadProductOptions() {-->
<!--      try {-->
<!--        const response = await getAllProducts();-->
<!--        const products = response.data?.data || [];-->
<!--        this.productOptions = products.map((product) => ({-->
<!--          id: product.id,-->
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
<!--        const workOrders = response.data?.data || [];-->
<!--        this.maintenanceWorkOrderOptions = workOrders.map((workOrder) => ({-->
<!--          id: workOrder.id,-->
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
<!--    async loadTeamSelectOptions() {-->
<!--      try {-->
<!--        const response = await getAllTeamTree();-->
<!--        if (response.data.status === "200") {-->
<!--          this.teamSelectOptions = response.data?.data || [];-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load team select:", error);-->
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
<!--        this.loadTeamSelectOptions(),-->
<!--      ]);-->
<!--    },-->
<!--    async handleFormNodeClicked(formTemplateId) {-->
<!--      await openFormPreviewWindow(formTemplateId, this)-->
<!--    },-->
<!--    async handleUserTeamTreeSelection(userIdsFromTree, index) {-->
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

<!--      if (!dispatch.teamTreeUserIds) {-->
<!--        dispatch.teamTreeUserIds = [];-->
<!--      }-->

<!--      // Merge `dropdownUserIds` (new selection) and `teamTreeUserIds`-->
<!--      const mergedUserIds = new Set([...newUserIds, ...dispatch.teamTreeUserIds]);-->

<!--      // Convert Set to Array and update `user_ids`-->
<!--      dispatch.user_ids = [...mergedUserIds];-->
<!--    },-->
<!--    async handlePopulateDispatchAndClose() {-->
<!--      await this.handlePopulateDispatch(); // existing function-->
<!--      this.isPlanPopulateByTeamVisible = false; // close the popover-->
<!--    },-->
<!--    async handlePopulateDispatch() {-->
<!--      for (const teamId of this.selectedTeamId) {-->
<!--        const team = this.teamSelectOptions.find((team) => team.id === teamId);-->
<!--        let d = this.cloneEmptyDispatchTemplate();-->

<!--        let response = await getUsersForTeam(teamId);-->
<!--        console.log('response');-->
<!--        console.log(response);-->
<!--        if (response.status === 200) {-->
<!--          d.user_ids = response.data.data.map((user) => user.id);-->
<!--          // TODO: Clean up-->
<!--          console.log('set dispatch plan user id to users under team')-->
<!--        } else {-->
<!--          d.user_ids = [];-->
<!--          // TODO: Clean up-->
<!--          console.log('set dispatch plan user id to empty')-->
<!--        }-->

<!--        response = await getFormIdsForTeam(teamId);-->
<!--        if (response.status === 200) {-->
<!--          d.form_ids = response.data?.data-->
<!--        } else {-->
<!--          d.form_ids = [];-->
<!--        }-->

<!--        d.source = 'team';-->
<!--        d.cron_expression = '0 0 * * *';-->
<!--        d.name = (team? team.name : '') + translate('orderManagement.plan');-->
<!--        d.collapsed = true;-->
<!--        d.team_id = teamId;-->
<!--        d.due_date_offset_minute = 1440;-->


<!--        this.addDispatch(d);-->
<!--      }-->

<!--      // Reset after populating plans.-->
<!--      this.selectedTeamId = [];-->
<!--    },-->
<!--    cloneEmptyDispatchTemplate() {-->
<!--      return JSON.parse(JSON.stringify(this.emptyDispatchTemplate));-->
<!--    },-->
<!--  }-->
<!--}-->


<!--</script>-->

<!--<style>-->


<!--</style>-->
