<!--<template>-->
<!--  <MyTaskTable-->
<!--      :title="translate('TaskCenter.futureTasksTitle')"-->
<!--      :columnList="columnList"-->
<!--      :userId="userId"-->
<!--      :type="type"-->
<!--  />-->
<!--</template>-->

<!--<script>-->
<!--import MyTaskTable from "@/components/task-center/MyTaskTable.vue";-->
<!--import { translate } from "@/utils/i18n";-->

<!--export default {-->
<!--  methods: {translate},-->
<!--  components: {-->
<!--    MyTaskTable,-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      userId: this.$store.getters.getUser.id, // Dynamically fetch the logged-in user's ID-->
<!--      type: "future",-->
<!--      columnList: [-->
<!--        "qc_form_tree_node_id",-->
<!--        "dispatched_task_state_id",-->
<!--        "name",-->
<!--        "remaining_time",-->
<!--        "due_date",-->
<!--        "description",-->
<!--        "dispatch_time",-->
<!--        "user_id",-->
<!--        "created_at",-->
<!--        "created_by",-->
<!--        "updated_at",-->
<!--        "updated_by",-->
<!--        "status",-->
<!--        "id",-->
<!--        "dispatch_id",-->
<!--        "is_overdue",-->
<!--        "finished_at",-->
<!--        "notes"-->
<!--      ],-->
<!--    };-->
<!--  },-->
<!--};-->
<!--</script>-->
