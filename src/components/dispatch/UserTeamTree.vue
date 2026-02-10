<!--<template>-->
<!--  <div>-->
<!--    &lt;!&ndash; Search Input & Clear Button (Same Row) &ndash;&gt;-->
<!--    <div style="display: flex; justify-content: flex-end;">-->
<!--      <el-input-->
<!--          v-model="searchQuery"-->
<!--          :placeholder="translate('teamManagement.searchPlaceholder')"-->
<!--          clearable-->
<!--          @input="filterTree"-->
<!--          style="height: 32px; margin-right: 10px"-->
<!--      >-->
<!--        <template #prefix>-->
<!--          <el-icon><Search /></el-icon>-->
<!--        </template>-->
<!--      </el-input>-->
<!--      <el-button-->
<!--          type="warning"-->
<!--          @click="clearSelection"-->
<!--          style="height: 32px; width: 80px; line-height: normal; margin: 0"-->
<!--      >-->
<!--        {{ translate('orderManagement.uncheckAll') }}-->
<!--      </el-button>-->
<!--    </div>-->

<!--    &lt;!&ndash; Tree Wrapper with Conditional Red Border &ndash;&gt;-->
<!--    <div>-->
<!--      <el-tree-->
<!--          style="max-height: 300px; /* Set vertical limit */ overflow-y: auto;   /* Enable scrolling */ border: 1px solid #dcdfe6; border-radius: 4px; padding: 5px; margin-top: 10px"-->
<!--          ref="treeRef"-->
<!--          :data="filteredTreeData"-->
<!--          show-checkbox-->
<!--          node-key="nodeId"-->
<!--          default-expand-all-->
<!--          highlight-current-->
<!--          :props="{ label: 'name', children: 'children' }"-->
<!--          @check-change="handleSelection"-->
<!--      />-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import {getAllTeamTree} from "@/services/teamService";-->
<!--import {getAllTeamUsers} from "@/services/teamUserService";-->
<!--import {fetchUsers} from "@/services/userService";-->
<!--import {Search} from "@element-plus/icons-vue";-->
<!--import {translate} from "@/utils/i18n";-->

<!--export default {-->
<!--  components: {Search},-->
<!--  data() {-->
<!--    return {-->
<!--      searchQuery: "",-->
<!--      teamTreeData: [], // Full team-user tree-->
<!--      filteredTreeData: [], // Tree with search filter applied-->
<!--      selectedUserIds: new Set(), // Unique selected user IDs-->
<!--      userToNodesMap: new Map(), // Maps userId → all occurrences in tree-->
<!--    };-->
<!--  },-->
<!--  async mounted() {-->
<!--    await this.loadTeamTreeData();-->
<!--  },-->
<!--  methods: {-->
<!--    translate,-->
<!--    /** Fetches teams, team-user mappings, and users */-->
<!--    async loadTeamTreeData() {-->
<!--      try {-->
<!--        const [teamsRes, teamUserRes, usersRes] = await Promise.all([-->
<!--          getAllTeamTree(),-->
<!--          getAllTeamUsers(),-->
<!--          fetchUsers(),-->
<!--        ]);-->

<!--        const teams = (teamsRes.data?.data || []).filter(user => user.status !== 0);-->
<!--        const teamUserMappings = teamUserRes.data?.data || [];-->
<!--        const users = (usersRes.data?.data?.content || []).filter(user => user.status !== 0);-->

<!--        // Build lookup maps-->
<!--        const userMap = new Map(users.map(user => [user.id, user]));-->
<!--        const teamUserMap = new Map();-->

<!--        // Build team-user relationships-->
<!--        teamUserMappings.forEach(({team_id, user_id}) => {-->
<!--          if (!teamUserMap.has(team_id)) teamUserMap.set(team_id, []);-->
<!--          const user = userMap.get(user_id);-->
<!--          if (user) {-->
<!--            const userNode = {id: user.id, name: user.name, nodeId: `${user.id}-${team_id}`};-->
<!--            teamUserMap.get(team_id).push(userNode);-->

<!--            if (!this.userToNodesMap.has(user.id)) this.userToNodesMap.set(user.id, []);-->
<!--            this.userToNodesMap.get(user.id).push(userNode.nodeId);-->
<!--          }-->
<!--        });-->

<!--        // Build tree structure-->
<!--        this.teamTreeData = teams.map(team => ({-->
<!--          id: `team-${team.id}`,-->
<!--          name: team.name,-->
<!--          children: teamUserMap.get(team.id) || [],-->
<!--        })).filter(team => team.children.length > 0);-->

<!--        // Add standalone users (users not in teams)-->
<!--        users.forEach(user => {-->
<!--          if (!teamUserMappings.some(mapping => mapping.user_id === user.id)) {-->
<!--            const userNode = {id: user.id, name: user.name, nodeId: `user-${user.id}`};-->
<!--            if (!this.userToNodesMap.has(user.id)) this.userToNodesMap.set(user.id, []);-->
<!--            this.userToNodesMap.get(user.id).push(userNode.nodeId);-->
<!--            this.teamTreeData.push(userNode);-->
<!--          }-->
<!--        });-->

<!--        // Store filtered tree data and sync selections-->
<!--        this.filteredTreeData = [...this.teamTreeData];-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load teams and users:", error);-->
<!--      }-->
<!--    },-->
<!--    /** Handles tree node selection and updates selected user IDs */-->
<!--    handleSelection(node, checked) {-->
<!--      if (!this.$refs.treeRef) return;-->

<!--      // Get all checked node IDs-->
<!--      const checkedKeys = this.$refs.treeRef.getCheckedKeys();-->

<!--      // Extract user IDs and ensure they are numbers-->
<!--      const userIds = new Set();-->

<!--      checkedKeys.forEach(nodeId => {-->
<!--        if (!nodeId) return; // Ignore undefined values-->

<!--        let extractedId = null;-->
<!--        if (nodeId.startsWith("user-")) {-->
<!--          extractedId = nodeId.replace("user-", ""); // Extract standalone user ID-->
<!--        } else if (!nodeId.startsWith("team-")) {-->
<!--          extractedId = nodeId.split("-")[0]; // Extract user ID from team-user composite key-->
<!--        }-->

<!--        if (extractedId !== null) {-->
<!--          userIds.add(parseInt(extractedId, 10)); // Convert to number-->
<!--        }-->
<!--      });-->

<!--      // If a team node is selected, include all users under that team-->
<!--      if (!node.isLeaf && checked) {-->
<!--        node.children?.forEach(child => {-->
<!--          if (child.isLeaf) {-->
<!--            userIds.add(parseInt(child.id, 10)); // Convert to number-->
<!--          }-->
<!--        });-->
<!--      }-->

<!--      // Store unique selected user IDs-->
<!--      this.selectedUserIds = userIds;-->

<!--      // Emit only integer user IDs-->
<!--      this.$emit("update-selected-users", [...userIds]);-->
<!--    },-->

<!--    /** Extracts the actual user ID from a nodeId */-->
<!--    extractUserId(nodeId) {-->
<!--      if (nodeId.startsWith("team-")) return null; // Ignore team nodes-->
<!--      if (nodeId.startsWith("user-")) return nodeId.replace("user-", ""); // Standalone users-->
<!--      return nodeId.split("-")[0]; // Extract user ID from team-user composite key-->
<!--    },-->


<!--    isUserNode(nodeId) {-->
<!--      const node = this.$refs.treeRef.getNode(nodeId);-->
<!--      return node && node.isLeaf; // Only leaf nodes represent users-->
<!--    },-->
<!--    /** Filters the tree based on search input */-->
<!--    filterTree() {-->
<!--      if (!this.searchQuery) {-->
<!--        this.filteredTreeData = [...this.teamTreeData];-->
<!--        return;-->
<!--      }-->
<!--      this.filteredTreeData = this.filterTreeNodes(this.teamTreeData, this.searchQuery.toLowerCase());-->
<!--    },-->

<!--    /** Recursively filters tree nodes based on search query */-->
<!--    filterTreeNodes(nodes, query) {-->
<!--      return nodes-->
<!--          .map(node => {-->
<!--            if (node.name.toLowerCase().includes(query)) return node;-->
<!--            if (node.children) {-->
<!--              const filteredChildren = this.filterTreeNodes(node.children, query);-->
<!--              if (filteredChildren.length) return {...node, children: filteredChildren};-->
<!--            }-->
<!--            return null;-->
<!--          })-->
<!--          .filter(node => node !== null);-->
<!--    },-->

<!--    /** Clears all selected nodes */-->
<!--    clearSelection() {-->
<!--      this.selectedUserIds.clear();-->
<!--      this.$refs.treeRef.setCheckedKeys([]);-->
<!--      this.$emit("update-selected-users", []);-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->

<!--</style>-->
