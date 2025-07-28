<template>
  <span v-if="!user">
    <el-tag size="small" type="info" effect="light">
      {{ translate('orderManagement.orderFormDialog.unknownUser') }}
    </el-tag>
  </span>

  <el-popover
      v-else
      effect="light"
      trigger="hover"
      placement="top"
      width="auto"
  >
    <template #default>
      <div><strong>{{ translate('userManagement.table.id') }}:</strong> {{ user.id }}</div>
      <div><strong>{{ translate('userManagement.table.name') }}:</strong> {{ user.name || translate('orderManagement.orderFormDialog.missing') }}</div>
      <div><strong>{{ translate('userManagement.table.role') }}:</strong> {{ user.role?.name || translate('userManagement.role.unknown') }}</div>
<!--      <div><strong>{{ translate('userManagement.table.wecomId') }}:</strong> {{ user.wecom_id || translate('orderManagement.orderFormDialog.missing') }}</div>-->
      <div><strong>{{ translate('userManagement.table.email') }}:</strong> {{ user.email || translate('orderManagement.orderFormDialog.missing') }}</div>
      <div><strong>{{ translate('userManagement.table.phoneNumber') }}:</strong> {{ user.phone_number || translate('orderManagement.orderFormDialog.missing') }}</div>
      <div v-if="user.teams?.length">
        <strong>{{ translate('userManagement.table.teams') }}:</strong>
        {{ user.teams.map(team => team.team_name).join(', ') }}
      </div>
    </template>

    <template #reference>
      <el-tag :type="user.role?.el_tag_type || 'info'" size="small" effect="light">
        {{ user.name || translate('orderManagement.orderFormDialog.unknownUser') }}
      </el-tag>
    </template>
  </el-popover>
</template>

<script>
import { translate } from "@/utils/i18n";

export default {
  name: "UserTagHoverWithDetail",
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  methods: {
    translate,
  },
};
</script>
