<!--<template>-->
<!--  <div style="overflow-y: hidden">-->
<!--    <el-form label-position="left" label-width="200px" style="padding: 10px; max-height: 75vh; overflow-y: auto;">-->
<!--    <div style="display: flex; justify-content: flex-end;">-->
<!--      &lt;!&ndash; Action Buttons &ndash;&gt;-->
<!--      <el-button-group>-->
<!--        <el-button type="success" @click="handleEditOrder">{{ translate('orderManagement.edit') }}</el-button>-->
<!--        <el-button type="danger" @click="handleDeleteOrder">{{ translate('orderManagement.delete') }}</el-button>-->
<!--      </el-button-group>-->
<!--    </div>-->

<!--    <el-divider>{{ translate('orderManagement.orderDetailDialog.orderDetailDivider') }}</el-divider>-->

<!--    <el-form-item-->
<!--        :label="translate('orderManagement.orderDetailDialog.orderName')"-->
<!--        class="wrap-text">-->
<!--      {{ currentOrder.name }}-->
<!--    </el-form-item>-->

<!--    <el-form-item-->
<!--        :label="translate('orderManagement.orderId')"-->
<!--    >-->
<!--      {{ currentOrder.id }}-->
<!--    </el-form-item>-->

<!--    <el-form-item-->
<!--        :label="translate('orderManagement.description')"-->
<!--        class="wrap-text"-->
<!--        v-if="currentOrder.description">-->
<!--      {{ currentOrder.description }}-->
<!--    </el-form-item>-->

<!--    <el-form-item-->
<!--        :label="translate('orderManagement.state')">-->
<!--      <el-tag-->
<!--          :type="getQcOrderStateTagData(currentOrder.state).type"-->
<!--          size="small"-->
<!--      >-->
<!--        {{ getQcOrderStateTagData(currentOrder.state).label }}-->
<!--      </el-tag>-->
<!--    </el-form-item>-->

<!--    <el-form-item-->
<!--        :label="translate('orderManagement.createdAt')"-->
<!--        v-if="currentOrder.created_at">-->
<!--      {{ formatDate(currentOrder.created_at) }}-->
<!--    </el-form-item>-->

<!--    <el-form-item-->
<!--        :label="translate('orderManagement.createdBy')"-->
<!--        v-if="currentOrder.created_by">-->
<!--      <UserTagHoverForDetail :user="userMap[currentOrder.created_by]"/>-->
<!--    </el-form-item>-->

<!--    <el-form-item-->
<!--        :label="translate('orderManagement.updatedAt')"-->
<!--        v-if="currentOrder.updated_at">-->
<!--      {{ formatDate(currentOrder.updated_at) }}-->
<!--    </el-form-item>-->

<!--    <el-form-item-->
<!--        :label="translate('orderManagement.updatedBy')"-->
<!--        v-if="currentOrder.updated_by">-->
<!--      <UserTagHoverForDetail :user="userMap[currentOrder.updated_by]"/>-->
<!--    </el-form-item>-->

<!--    <el-divider>{{translate('orderManagement.dispatchPlanList')}}</el-divider>-->
<!--    <div v-if="dispatches.length > 0">-->
<!--      <el-card-->
<!--          v-for="(dispatch, index) in dispatches"-->
<!--          :key="dispatch.id"-->
<!--          style="margin-bottom: 20px;"-->
<!--      >-->
<!--        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: bold;">-->
<!--          <span>-->
<!--            {{ translate('orderManagement.dispatchPlan') }} {{ index + 1 }}-->
<!--            <span v-if="dispatch.name"> - {{ dispatch.name }}</span>-->
<!--          </span>-->
<!--          <div-->
<!--              style="display: flex;-->
<!--            justify-content: flex-end;"-->
<!--          >-->
<!--            &lt;!&ndash; Expand Arrow &ndash;&gt;-->
<!--            <el-button-->
<!--                :link="true"-->
<!--                @click="toggleCollapse(index)"-->
<!--                :icon="dispatch.collapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'">-->
<!--              {{ dispatch.collapsed ? translate('orderManagement.orderFormDialog.collapseButton') : translate('orderManagement.orderFormDialog.expandButton') }}-->
<!--            </el-button>-->

<!--            <el-button-->
<!--                v-if="dispatch.type === 'regular' && dispatch.state === 1"-->
<!--                type="info"-->
<!--                @click="handlePauseOrderDispatch(dispatch.id)">-->
<!--              {{ translate('orderManagement.pauseDispatch') }}-->
<!--            </el-button>-->
<!--            <el-button-->
<!--                v-if="dispatch.type === 'regular' && dispatch.state === 5"-->
<!--                type="info"-->
<!--                @click="handleResumeOrderDispatch(dispatch.id)">-->
<!--              {{ translate('orderManagement.resumeDispatch') }}-->
<!--            </el-button>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div v-show="!dispatch.collapsed">-->
<!--          <el-form-item-->
<!--              :label="translate('orderManagement.dispatchPlanId')">-->
<!--            {{ dispatch.id }}-->
<!--          </el-form-item>-->

<!--          <el-form-item-->
<!--              :label="translate('orderManagement.description')"-->
<!--              class="wrap-text"-->
<!--              v-if="dispatch.description">-->
<!--            {{ dispatch.description }}-->
<!--          </el-form-item>-->

<!--          <el-form-item-->
<!--              :label="translate('orderManagement.state')"-->
<!--          >-->
<!--            <el-tag-->
<!--                :type="getDispatchStateTagData(dispatch.state).type"-->
<!--                size="small"-->
<!--            >-->
<!--              {{ getDispatchStateTagData(dispatch.state).label }}-->
<!--            </el-tag>-->
<!--          </el-form-item>-->

<!--          <el-divider> {{translate('orderManagement.orderDetailDialog.dispatchConfigDivider')}}</el-divider>-->

<!--          <el-form-item :label="translate('orderManagement.type')">-->
<!--            {{ formatScheduleType(dispatch.type) }}-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderDetailDialog.executionLogic')" v-if="dispatch.cron_expression">-->
<!--            {{-->
<!--              formatCronExpression(dispatch.cron_expression)-->
<!--            }}-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderDetailDialog.periodStartTime')" v-if="dispatch.start_time">-->
<!--            {{ formatDate(dispatch.start_time) }}-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderDetailDialog.periodEndTime')" v-if="dispatch.end_time">-->
<!--            {{ formatDate(dispatch.end_time) }}-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderDetailDialog.dispatchLimit')" v-if="dispatch.type === 'regular'">-->
<!--            {{ dispatch.dispatch_limit === -1 ? translate('orderManagement.orderFormDialog.unlimited') : dispatch.dispatch_limit }}-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderFormDialog.executionTime')" v-if="dispatch.custom_time">-->
<!--            {{ formatDate(dispatch.custom_time) }}-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderDetailDialog.nextDispatchTime')" v-if="dispatch.nextExecutionTime && dispatch.type === 'regular'">-->
<!--            <el-countdown :value="dispatch.nextExecutionTime" format="HH:mm:ss" @finish="handleCountdownFinish(dispatch)"/>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderDetailDialog.executedCount')">-->
<!--            {{ dispatch.executed_count }}-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.createdBy')" v-if="dispatch.created_by">-->
<!--            <UserTagHoverForDetail :user="userMap[dispatch.created_by]"/>-->
<!--          </el-form-item>-->


<!--          <el-form-item :label="translate('orderManagement.createdAt')" v-if="dispatch.created_at">-->
<!--            {{ formatDate(dispatch.created_at) }}-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.updatedBy')" v-if="dispatch.updated_by">-->
<!--            <UserTagHoverForDetail :user="userMap[dispatch.updated_by]"/>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.updatedAt')" v-if="dispatch.updated_at">-->
<!--            {{ formatDate(dispatch.updated_at) }}-->
<!--          </el-form-item>-->

<!--          <el-divider>{{ translate('orderManagement.orderDetailDialog.taskConfigDivider') }}</el-divider>-->

<!--          <el-form-item :label="translate('orderManagement.orderDetailDialog.taskDueDateOffset')">-->
<!--            {{ dispatch.due_date_offset_minute }}-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('testSubjectManagement.testSubject')" v-if="dispatch.testSubjectDetails.length > 0">-->
<!--            <div class="tags">-->
<!--              <el-tag v-for="testSubject in dispatch.testSubjectDetails"-->
<!--                      :key="testSubject.id"-->
<!--                      type="info"-->
<!--                      size="small">-->
<!--                <el-popover-->
<!--                    effect="light"-->
<!--                    trigger="hover"-->
<!--                    placement="top"-->
<!--                    width="auto">-->
<!--                  <template #default>-->
<!--                    <div>{{ translate('testSubjectManagement.testSubjectId') }}: {{ testSubject.id }}</div>-->
<!--                    <div v-if="testSubject.description">{{ translate('orderManagement.description') }}: {{ testSubject.description }}</div>-->
<!--                    <div v-if="testSubject.status">{{ translate('orderManagement.status') }}: {{ testSubject.status }}</div>-->
<!--                    <div v-if="testSubject.created_by">{{ translate('orderManagement.createdBy') }}: {{ testSubject.created_by }}</div>-->
<!--                    <div v-if="testSubject.created_at">{{ translate('orderManagement.createdAt') }}: {{ formatDate(testSubject.created_at) }}</div>-->
<!--                    <div v-if="testSubject.updated_by">{{ translate('orderManagement.updatedBy') }}: {{ testSubject.updated_by }}</div>-->
<!--                    <div v-if="testSubject.updated_at">{{ translate('orderManagement.updatedAt') }}: {{ formatDate(testSubject.updated_at) }}</div>-->

<!--                  </template>-->
<!--                  <template #reference>-->
<!--                    {{ testSubject.name }}-->
<!--                  </template>-->
<!--                </el-popover>-->
<!--              </el-tag>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('samplingLocationManagement.samplingLocation')" v-if="dispatch.samplingLocationDetails.length > 0">-->
<!--            <div class="tags">-->
<!--              <el-tag v-for="samplingLocation in dispatch.samplingLocationDetails"-->
<!--                      :key="samplingLocation.id"-->
<!--                      type="info"-->
<!--                      size="small"-->
<!--                      effect="light">-->
<!--                <el-popover-->
<!--                    effect="light"-->
<!--                    trigger="hover"-->
<!--                    placement="top"-->
<!--                    width="auto">-->
<!--                  <template #default>-->
<!--                    <div>{{ translate('samplingLocationManagement.samplingLocationId') }}: {{ samplingLocation.id }}</div>-->
<!--                    <div v-if="samplingLocation.description">{{ translate('orderManagement.description') }}: {{ samplingLocation.description }}</div>-->
<!--                    <div v-if="samplingLocation.status">{{ translate('orderManagement.status') }}: {{ samplingLocation.status }}</div>-->
<!--                    <div v-if="samplingLocation.created_by">{{ translate('orderManagement.createdBy') }}: {{ samplingLocation.created_by }}</div>-->
<!--                    <div v-if="samplingLocation.created_at">{{ translate('orderManagement.createdAt') }}: {{ formatDate(samplingLocation.created_at) }}</div>-->
<!--                    <div v-if="samplingLocation.updated_by">{{ translate('orderManagement.updatedBy') }}: {{ samplingLocation.updated_by }}</div>-->
<!--                    <div v-if="samplingLocation.updated_at">{{ translate('orderManagement.updatedAt') }}: {{ formatDate(samplingLocation.updated_at) }}</div>-->

<!--                  </template>-->
<!--                  <template #reference>-->
<!--                    {{ samplingLocation.name }}-->
<!--                  </template>-->
<!--                </el-popover>-->
<!--              </el-tag>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('instrumentManagement.instrument')" v-if="dispatch.instrumentDetails.length > 0">-->
<!--            <div class="tags">-->
<!--              <el-tag-->
<!--                  v-for="instrument in dispatch.instrumentDetails"-->
<!--                  :key="instrument.id"-->
<!--                  type="info"-->
<!--                  size="small"-->
<!--                  effect="light"-->
<!--              >-->
<!--                <el-popover-->
<!--                    effect="light"-->
<!--                    trigger="hover"-->
<!--                    placement="top"-->
<!--                    width="auto">-->
<!--                  <template #default>-->
<!--                    <div>{{ translate('instrumentManagement.instrumentId') }} : {{ instrument.id }}</div>-->
<!--                    <div v-if="instrument.description">{{ translate('orderManagement.description') }}: {{ instrument.description}}</div>-->
<!--                    <div v-if="instrument.model_number">{{ translate('instrumentManagement.modelNumber') }}: {{ instrument.model_number }}</div>-->
<!--                    <div v-if="instrument.manufacturer">{{ translate('instrumentManagement.vendor') }}: {{ instrument.manufacturer }}</div>-->
<!--                    <div v-if="instrument.type">{{ translate('orderManagement.type') }}: {{ instrument.type }}</div>-->
<!--                    <div v-if="instrument.status">{{ translate('orderManagement.status') }}: {{ instrument.status }}</div>-->
<!--                    <div v-if="instrument.created_by">{{ translate('orderManagement.createdBy') }}: {{ instrument.created_by }}</div>-->
<!--                    <div v-if="instrument.created_at">{{ translate('orderManagement.createdAt') }}: {{ formatDate(instrument.created_at) }}</div>-->
<!--                    <div v-if="instrument.updated_by">{{ translate('orderManagement.updatedBy') }}: {{ instrument.updated_by }}</div>-->
<!--                    <div v-if="instrument.updated_at">{{ translate('orderManagement.updatedAt') }}: {{ formatDate(instrument.updated_at) }}</div>-->

<!--                  </template>-->
<!--                  <template #reference>-->
<!--                    {{ instrument.name }}-->
<!--                  </template>-->
<!--                </el-popover>-->
<!--              </el-tag>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderTable.associatedUsers')" v-if="dispatch.userDetails.length > 0">-->
<!--            <div-->
<!--                v-for="user in dispatch.userDetails"-->
<!--                class="tags"-->
<!--            >-->
<!--              <UserTagHoverForDetail :user="userMap[user.id]"/>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderTable.associatedForms')" v-if="dispatch.form_ids.length > 0">-->
<!--            <div class="tags">-->
<!--              <el-tag-->
<!--                  v-for="(formId) in dispatch.form_ids"-->
<!--                  :key="formId"-->
<!--                  type="success"-->
<!--                  size="small"-->
<!--                  effect="light"-->
<!--              >-->
<!--                <el-popover effect="light" trigger="hover" placement="top" width="auto">-->
<!--                  <template #default>-->
<!--                    <div>{{ translate('orderManagement.formNodeId') }}: {{ formId }}</div>-->
<!--                    <div>{{ translate('orderManagement.formName') }}: {{ getFormById(formId) }}</div>-->
<!--                  </template>-->
<!--                  <template #reference>-->
<!--                    {{ getFormById(formId) }}-->
<!--                  </template>-->
<!--                </el-popover>-->
<!--              </el-tag>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          &lt;!&ndash; System Associations &ndash;&gt;-->
<!--          <el-divider>{{ translate('orderManagement.orderDetailDialog.systemAssociationDivider') }}</el-divider>-->

<!--          <el-form-item :label="translate('orderManagement.orderFormDialog.product')" v-if="dispatch.productDetails.length > 0">-->
<!--            <div class="tags">-->
<!--              <el-tag-->
<!--                  v-for="(product) in dispatch.productDetails"-->
<!--                  :key="product.id"-->
<!--                  type="success"-->
<!--                  size="small"-->
<!--                  effect="light"-->
<!--              >-->
<!--                <el-popover-->
<!--                    effect="light"-->
<!--                    trigger="hover"-->
<!--                    placement="top"-->
<!--                    width="300px">-->
<!--                  <template #default>-->
<!--                    &lt;!&ndash; Product Details &ndash;&gt;-->
<!--                    <div><strong>{{ translate('orderManagement.Id') }}:</strong> {{ product.id }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.productCode') }}:</strong> {{ product.product_code }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.description') }}:</strong> {{ product.description || translate('orderManagement.orderFormDialog.missing') }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.unitSalesPrice') }}:</strong> {{ product.unit_sales_price || translate('orderManagement.orderFormDialog.missing')  }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.unitResourceCost') }}:</strong> {{ product.unit_resource_cost || translate('orderManagement.orderFormDialog.missing') }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.quantity') }}:</strong> {{ product.produced_quantity || translate('orderManagement.orderFormDialog.missing') }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.updatedAt') }}:</strong> {{ formatDate(product.updated_at) || translate('orderManagement.orderFormDialog.missing') }}</div>-->

<!--                    &lt;!&ndash; Image Display &ndash;&gt;-->
<!--                    <div v-if="product.image_paths">-->
<!--                      <el-image-->
<!--                          :src="product.image_paths"-->
<!--                          fit="fill"-->
<!--                          style="width: 50%; max-height: 50%;"-->
<!--                          :preview-src-list="[product.image_paths]"-->
<!--                          preview/>-->
<!--                    </div>-->
<!--                  </template>-->
<!--                  <template #reference>-->
<!--                    {{ product.name }}-->
<!--                  </template>-->
<!--                </el-popover>-->
<!--              </el-tag>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderFormDialog.rawMaterial')" v-if="dispatch.rawMaterialDetails.length > 0">-->
<!--            <div class="tags">-->
<!--              <el-tag-->
<!--                  v-for="material in dispatch.rawMaterialDetails"-->
<!--                  :key="material.id"-->
<!--                  type="warning"-->
<!--                  size="small"-->
<!--                  effect="light"-->
<!--              >-->
<!--                <el-popover-->
<!--                    effect="light"-->
<!--                    trigger="hover"-->
<!--                    placement="top"-->
<!--                    width="300px">-->
<!--                  <template #default>-->
<!--                    &lt;!&ndash; Raw Material Details &ndash;&gt;-->
<!--                    <div><strong>{{ translate('orderManagement.Id') }}:</strong> {{ material.id }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.code') }}:</strong> {{ material.code }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.description') }}:</strong> {{ material.description || translate('orderManagement.orderFormDialog.missing') }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.unitPrice') }}:</strong> {{ material.unit_price }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.minimumInventory') }}:</strong> {{ material.minimum_inventory }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.currentStock') }}:</strong> {{ material.current_stock }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.availableStock') }}:</strong> {{ material.available_stock }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.heldStock') }}:</strong> {{ material.held_stock }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.vendorId') }}:</strong> {{ material.vendor_id }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.updatedAt') }}:</strong> {{ formatDate(material.updated_at) }}</div>-->

<!--                    &lt;!&ndash; Image Display &ndash;&gt;-->
<!--                    <div v-if="material.image_path" style="margin-top: 10px;">-->
<!--                      <el-image-->
<!--                          :src="material.image_path"-->
<!--                          fit="fill"-->
<!--                          style="width: 50%; max-height: 50%;"-->
<!--                          :preview-src-list="[material.image_path]"-->
<!--                          preview/>-->
<!--                    </div>-->
<!--                  </template>-->
<!--                  <template #reference>-->
<!--                    {{ material.name }}-->
<!--                  </template>-->
<!--                </el-popover>-->
<!--              </el-tag>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderFormDialog.productionWorkOrder')" v-if="dispatch.productionWorkOrderDetails.length > 0">-->
<!--            <div class="tags">-->
<!--              <el-tag-->
<!--                  v-for="workOrder in dispatch.productionWorkOrderDetails"-->
<!--                  :key="workOrder.id"-->
<!--                  type="primary"-->
<!--                  size="small"-->
<!--                  effect="light"-->
<!--              >-->
<!--                <el-popover-->
<!--                    effect="light"-->
<!--                    trigger="hover"-->
<!--                    placement="top"-->
<!--                    width="300px">-->
<!--                  <template #default>-->
<!--                    &lt;!&ndash; Production Work Order Details &ndash;&gt;-->
<!--                    <div><strong>{{ translate('orderManagement.orderId') }}:</strong> {{ workOrder.id }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.code') }}:</strong> {{ workOrder.code }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.description') }}:</strong> {{ workOrder.description || translate('orderManagement.orderFormDialog.missing') }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.quantity') }}:</strong> {{ workOrder.wo_quantity }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.unscheduledQuantity') }}:</strong> {{ workOrder.unscheduled_quantity }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.orderDetailDialog.periodEndTime') }}:</strong> {{ formatDate(workOrder.wo_deadline) }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.productCode') }}:</strong> {{ workOrder.product_id }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.approvedAt') }}:</strong> {{ formatDate(workOrder.approved_at) }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.orderDetailDialog.periodStartTime') }}:</strong> {{ formatDate(workOrder.start_date) }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.orderDetailDialog.periodEndTime') }}:</strong> {{ formatDate(workOrder.end_date) }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.estimatedProductionTime') }}:</strong> {{ workOrder.estimated_production_time }} {{translate('orderManagement.hour')}}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.productionLine') }}:</strong> {{ workOrder.production_line }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.updatedAt') }}:</strong> {{ formatDate(workOrder.updated_at) }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.recurrenceUuid') }}:</strong> {{ workOrder.recurrence_uuid }}</div>-->


<!--                    &lt;!&ndash; Image Display &ndash;&gt;-->
<!--                    <div v-if="workOrder.image_path" style="margin-top: 10px;">-->
<!--                      <el-image-->
<!--                          :src="workOrder.image_path"-->
<!--                          fit="fill"-->
<!--                          style="width: 50%; max-height: 50%;"-->
<!--                          :preview-src-list="[workOrder.image_path]"-->
<!--                          preview/>-->
<!--                    </div>-->
<!--                  </template>-->
<!--                  <template #reference>-->
<!--                    {{ workOrder.name }}-->
<!--                  </template>-->
<!--                </el-popover>-->
<!--              </el-tag>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderFormDialog.equipment')" v-if="dispatch.equipmentDetails.length > 0">-->
<!--            <div class="tags">-->
<!--              <el-tag-->
<!--                  v-for="equipment in dispatch.equipmentDetails"-->
<!--                  :key="equipment.id"-->
<!--                  type="info"-->
<!--                  size="small"-->
<!--                  effect="light"-->
<!--              >-->
<!--                <el-popover-->
<!--                    effect="light"-->
<!--                    trigger="hover"-->
<!--                    placement="top"-->
<!--                    width="300px">-->
<!--                  <template #default>-->

<!--                    &lt;!&ndash; Equipment Details &ndash;&gt;-->
<!--                    <div><strong>{{ translate('orderManagement.Id') }}:</strong> {{ equipment.id }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.code') }}:</strong> {{ equipment.code }}</div>-->
<!--                    <div><strong>PLC:</strong> {{ equipment.plc }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.serialNumber') }}:</strong> {{ equipment.serial_number }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.vendorId') }}:</strong> {{ equipment.vendor_id }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.locationId') }}:</strong> {{ equipment.location_id }}</div>-->


<!--                    &lt;!&ndash; Image Display &ndash;&gt;-->
<!--                    <div v-if="equipment.image_path" style="margin-top: 10px;">-->
<!--                      <el-image-->
<!--                          :src="equipment.image_path"-->
<!--                          fit="fill"-->
<!--                          style="width: 50%; max-height: 50%;"-->
<!--                          :preview-src-list="[equipment.image_path]"-->
<!--                          preview/>-->
<!--                    </div>-->
<!--                  </template>-->
<!--                  <template #reference>-->
<!--                    {{ equipment.name }}-->
<!--                  </template>-->
<!--                </el-popover>-->
<!--              </el-tag>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          <el-form-item :label="translate('orderManagement.orderFormDialog.maintenanceWorkOrder')" v-if="dispatch.maintenanceWorkOrderDetails.length > 0">-->
<!--            <div class="tags">-->
<!--              <el-tag-->
<!--                  v-for="workOrder in dispatch.maintenanceWorkOrderDetails"-->
<!--                  :key="workOrder.id"-->
<!--                  type="danger"-->
<!--                  size="small"-->
<!--                  effect="light"-->
<!--              >-->
<!--                <el-popover-->
<!--                    effect="light"-->
<!--                    trigger="hover"-->
<!--                    placement="top"-->
<!--                    width="300px">-->
<!--                  <template #default>-->
<!--                    &lt;!&ndash; Maintenance Work Order Details &ndash;&gt;-->
<!--                    <div><strong>{{ translate('orderManagement.Id') }}:</strong> {{ workOrder.id }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.code') }}:</strong> {{ workOrder.code }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.description') }}:</strong> {{ workOrder.description || translate('orderManagement.orderFormDialog.missing') }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.orderDetailDialog.periodStartTime') }}:</strong> {{ formatDate(workOrder.start_date) }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.orderDetailDialog.periodEndTime') }}:</strong> {{ formatDate(workOrder.end_date) }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.recurrenceUuid') }}:</strong> {{ workOrder.recurrence_uuid }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.dueDate') }}:</strong> {{ formatDate(workOrder.due_date) }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.estimatedMinutes') }}:</strong> {{ workOrder.estimated_minutes }}</div>-->
<!--                    <div><strong>{{ translate('orderManagement.productionLineId') }}:</strong> {{ workOrder.production_line_id }}</div>-->


<!--                    &lt;!&ndash; Image Display &ndash;&gt;-->
<!--                    <div v-if="workOrder.image_path" style="margin-top: 10px;">-->
<!--                      <el-image-->
<!--                          :src="workOrder.image_path"-->
<!--                          fit="fill"-->
<!--                          style="width: 50%; max-height: 50%;"-->
<!--                          :preview-src-list="[workOrder.image_path]"-->
<!--                          preview/>-->
<!--                    </div>-->
<!--                  </template>-->
<!--                  <template #reference>-->
<!--                    {{ workOrder.name }}-->
<!--                  </template>-->
<!--                </el-popover>-->
<!--              </el-tag>-->
<!--            </div>-->
<!--          </el-form-item>-->

<!--          <el-divider>{{ translate('orderManagement.orderDetailDialog.dispatchedTasksDivider') }}</el-divider>-->
<!--          &lt;!&ndash; Dispatched Tasks Table &ndash;&gt;-->
<!--          <DispatchedTasksList-->
<!--              :dispatch-id="dispatch.id"-->
<!--              :form-map="formMap"-->
<!--              :user-map="userMap"-->
<!--              :show-search-box="true"-->
<!--              :key="refreshKey"-->
<!--          />-->
<!--        </div>-->
<!--      </el-card>-->
<!--    </div>-->
<!--    <div v-else>- {{ translate('orderManagement.noDispatchedTasks') }} -</div>-->

<!--  </el-form>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import {-->
<!--  formatDate,-->
<!--  formatScheduleType,-->
<!--  unnormalizeCronExpression,-->
<!--  getQcOrderStateTagData,-->
<!--  getDispatchStateTagData,-->
<!--  getCurrentLanguage-->
<!--} from "@/utils/dispatch-utils";-->
<!--import { humanizeCronInChinese } from "cron-chinese";-->
<!--import { getUserById } from "@/services/userService";-->
<!--import {getProductById, getProductionWorkOrderById, getRawMaterialById} from "@/services/productionService";-->
<!--import {getEquipmentById, getMaintenanceWorkOrderById} from "@/services/maintenanceService";-->
<!--import DispatchedTasksList from "@/components/dispatch/DispatchedTaskList.vue";-->

<!--import {getDispatchNextExecutionTime, pauseDispatch, resumeDispatch} from "@/services/dispatchService";-->
<!--import {getTestSubjectById} from "@/services/testSubjectService";-->
<!--import {getSamplingLocationById} from "@/services/samplingLocationService";-->
<!--import {getInstrumentById} from "@/services/instrumentService";-->
<!--import {translate} from "@/utils/i18n";-->
<!--import cronstrue from "cronstrue";-->
<!--import UserTagHoverForDetail from "@/components/dispatch/UserTagHoverForDetail.vue";-->


<!--export default {-->
<!--  computed: {-->
<!--    cronstrue() {-->
<!--      return cronstrue-->
<!--    }-->
<!--  },-->
<!--  components: {UserTagHoverForDetail, DispatchedTasksList},-->
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
<!--  data() {-->
<!--    return {-->
<!--      refreshKey: 0,-->
<!--      dispatches: [],-->
<!--      createdByDetail: null,-->
<!--      updatedByDetail: null,-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    getCurrentLanguage,-->
<!--    translate,-->
<!--    getDispatchStateTagData,-->
<!--    getQcOrderStateTagData,-->
<!--    humanizeCronInChinese,-->
<!--    formatDate,-->
<!--    formatScheduleType,-->
<!--    unnormalizeCronExpression,-->
<!--    async fetchUserHelper(userId) {-->
<!--      if (userId) {-->
<!--        try {-->
<!--          const response = await getUserById(userId);-->
<!--          return response.data.data || null;-->
<!--        } catch (error) {-->
<!--          console.error("Failed to get user details:", error);-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    async fetchCreatedByDetail() {-->
<!--      if (this.currentOrder.created_by) {-->
<!--        try {-->
<!--          this.createdByDetail = this.fetchUserHelper(this.currentOrder.created_by);-->
<!--        } catch (error) {-->
<!--          console.error("Failed to fetch created by details:", error);-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    async fetchUpdatedByDetail() {-->
<!--      if (this.currentOrder.updated_by) {-->
<!--        try {-->
<!--          this.updatedByDetail = this.fetchUserHelper(this.currentOrder.updated_by);-->
<!--        } catch (error) {-->
<!--          console.error("Failed to fetch updated by details:", error);-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    async fetchDetails(ids, fetchFunction) {-->
<!--      const details = [];-->
<!--      for (const id of ids || []) {-->
<!--        try {-->
<!--          const response = await fetchFunction(id);-->
<!--          if (response?.data?.data) details.push(response.data.data);-->
<!--        } catch (e) {-->
<!--          console.error(`Failed to fetch detail for ID: ${id}`, e);-->
<!--        }-->
<!--      }-->
<!--      return details;-->
<!--    },-->
<!--    async loadDispatchDetails() {-->
<!--      this.dispatches = this.currentOrder.dispatches.map(dispatch => ({-->
<!--        ...dispatch,-->
<!--        createdByDetail:null,-->
<!--        updatedByDetail:null,-->
<!--        userDetails:[],-->
<!--        testSubjectDetails:[],-->
<!--        samplingLocationDetails:[],-->
<!--        instrumentDetails:[],-->
<!--        productDetails: [],-->
<!--        rawMaterialDetails: [],-->
<!--        maintenanceWorkOrderDetails: [],-->
<!--        equipmentDetails: [],-->
<!--        productionWorkOrderDetails: [],-->
<!--        nextExecutionTime: null,-->
<!--        collapsed: false,-->
<!--      }));-->

<!--      for (let dispatch of this.dispatches) {-->
<!--        try {-->
<!--          dispatch.createdByDetail = await this.fetchUserHelper(dispatch.created_by);-->
<!--          dispatch.updatedByDetail = await this.fetchUserHelper(dispatch.updated_by);-->
<!--          dispatch.productDetails = await this.fetchDetails(dispatch.product_ids, getProductById);-->
<!--          dispatch.rawMaterialDetails = await this.fetchDetails(dispatch.raw_material_ids, getRawMaterialById);-->
<!--          dispatch.productionWorkOrderDetails = await this.fetchDetails(dispatch.production_work_order_ids, getProductionWorkOrderById);-->
<!--          dispatch.equipmentDetails = await this.fetchDetails(dispatch.equipment_ids, getEquipmentById);-->
<!--          dispatch.maintenanceWorkOrderDetails = await this.fetchDetails(dispatch.maintenance_work_order_ids, getMaintenanceWorkOrderById);-->
<!--          dispatch.userDetails = await this.fetchDetails(dispatch.user_ids, getUserById);-->
<!--          dispatch.testSubjectDetails = await this.fetchDetails(dispatch.test_subject_ids, getTestSubjectById);-->
<!--          dispatch.samplingLocationDetails = await this.fetchDetails(dispatch.sampling_location_ids, getSamplingLocationById);-->
<!--          dispatch.instrumentDetails = await this.fetchDetails(dispatch.instrument_ids, getInstrumentById);-->
<!--          await this.fetchNextExecutionTime(dispatch);-->
<!--        } catch (e) {-->
<!--          console.error(`Error fetching details for dispatch ID: ${dispatch.id}`, e);-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    getFormById(id) {-->
<!--      return this.formMap[id] || translate('orderManagement.orderFormDialog.unknownForm');-->
<!--    },-->
<!--    async fetchNextExecutionTime(dispatch) {-->
<!--      if (!dispatch || !dispatch.id) return;-->
<!--      try {-->
<!--        const response = await getDispatchNextExecutionTime(dispatch.id);-->
<!--        if (response.data.data) {-->
<!--          dispatch.nextExecutionTime = new Date(response.data.data).getTime(); // Convert to timestamp-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error(`Failed to fetch next execution time for Dispatch ID ${dispatch.id}:`, error);-->
<!--        dispatch.nextExecutionTime = null;-->
<!--      }-->
<!--    },-->
<!--    handleCountdownFinish(dispatch) {-->
<!--      setTimeout(() => {-->
<!--        this.fetchNextExecutionTime(dispatch);-->
<!--        this.refreshKey++; // refresh dispatched list-->
<!--        this.$emit("refresh-order"); // trigger refreshing current order on order management-->
<!--      }, 2000); // Refresh next execution time after 2 second-->
<!--    },-->
<!--    toggleCollapse(index) {-->
<!--      this.dispatches[index].collapsed =-->
<!--          !this.dispatches[index].collapsed;-->
<!--    },-->
<!--    formatCronExpression(cron) {-->
<!--      if (!cron) return translate('orderManagement.orderFormDialog.unknownExecutionLogic');-->
<!--      try {-->
<!--        if (getCurrentLanguage() === 'en-US'){-->
<!--          return cronstrue.toString(unnormalizeCronExpression(cron))-->
<!--        } else {-->
<!--          return humanizeCronInChinese(unnormalizeCronExpression(cron));-->
<!--        }-->
<!--      } catch {-->
<!--        return translate('orderManagement.orderFormDialog.unknownExecutionLogic');-->
<!--      }-->
<!--    },-->
<!--    async handlePauseOrderDispatch(dispatchId) {-->
<!--      try {-->
<!--        await this.$confirm(translate('orderManagement.messages.pauseDispatchConfirmation'), translate('orderManagement.messages.messageTitle'), { type: "warning" });-->

<!--        const userId = this.$store.getters.getUser.id;-->
<!--        const response = await pauseDispatch(dispatchId, userId);-->

<!--        if (response && response.status === 200) {-->
<!--          this.$message.success(translate('orderManagement.messages.dispatchPausedSuccess'));-->
<!--          this.$emit("refresh-order"); //-->
<!--        } else {-->
<!--          this.$message.error(translate('orderManagement.messages.dispatchPausedFailed'));-->
<!--        }-->
<!--      } catch (e) {-->
<!--        console.log("Pause action canceled or failed.");-->
<!--      }-->
<!--    },-->
<!--    async handleResumeOrderDispatch(dispatchId) {-->
<!--      try {-->
<!--        await this.$confirm(translate('orderManagement.messages.resumeDispatchConfirmation'), translate('orderManagement.messages.messageTitle'), { type: "warning" });-->

<!--        const userId = this.$store.getters.getUser.id;-->
<!--        const response = await resumeDispatch(dispatchId, userId);-->

<!--        if (response && response.status === 200) {-->
<!--          this.$message.success(translate('orderManagement.messages.dispatchResumedSuccess'));-->
<!--          this.$emit("refresh-order"); //-->
<!--        } else {-->
<!--          this.$message.error(translate('orderManagement.messages.dispatchResumedFailed'));-->
<!--        }-->
<!--      } catch (e) {-->
<!--        console.log("Resume action canceled or failed.");-->
<!--      }-->
<!--    },-->
<!--    async handleEditOrder(){-->
<!--      await this.$confirm(translate('orderManagement.messages.editConfirmation'), translate('orderManagement.messages.messageTitle'), {-->
<!--        confirmButtonText: translate('orderManagement.confirm'),-->
<!--        cancelButtonText: translate('orderManagement.cancel'),-->
<!--        type: "warning",-->
<!--      });-->
<!--      this.$emit('on-edit');-->
<!--    },-->
<!--    async handleDeleteOrder(){-->
<!--      await this.$confirm(translate('orderManagement.messages.deleteConfirmation'), translate('orderManagement.messages.messageTitle'), {-->
<!--        confirmButtonText: translate('orderManagement.confirm'),-->
<!--        cancelButtonText: translate('orderManagement.cancel'),-->
<!--        type: "warning",-->
<!--      });-->
<!--      this.$emit('on-delete');-->
<!--    }-->
<!--  },-->
<!--  mounted() {-->
<!--    // fetch order createdBy/updatedBy-->
<!--    this.fetchCreatedByDetail();-->
<!--    this.fetchUpdatedByDetail();-->

<!--    // fetch each dispatch's data under order-->
<!--    this.loadDispatchDetails();-->
<!--  },-->
<!--  watch: {-->
<!--    currentOrder: {-->
<!--      immediate: true,-->
<!--      handler() {-->
<!--        this.fetchCreatedByDetail();-->
<!--        this.fetchUpdatedByDetail();-->
<!--        this.loadDispatchDetails();-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->

<!--.tags {-->
<!--  display: flex;-->
<!--  flex-wrap: wrap;-->
<!--  gap: 10px;-->
<!--  margin-right: 10px;-->
<!--}-->

<!--.wrap-text {-->
<!--  word-break: break-word; /* Ensures text breaks and wraps */-->
<!--  white-space: normal; /* Allows text to wrap normally */-->
<!--  overflow-wrap: break-word; /* Ensures long words break correctly */-->
<!--}-->
<!--</style>-->
