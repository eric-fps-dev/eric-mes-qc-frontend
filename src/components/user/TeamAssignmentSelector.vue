<template>
  <div>
    <!-- ─────────────────────────────── Tree Select ────────────────── -->
    <el-tree-select
        v-model="checked"
        :data="teamTree"
        multiple
        show-checkbox
        check-strictly
        default-expand-all
        @update:model-value="onTreeChange"
        class="tree-select--full"
        :placeholder="translate('userManagement.addDialog.assignedTeamPlaceHolder')"
    >
      <!-- add leader name in option -->
      <template #default="{ data }">
        <span>{{ data.label }}</span>
        <span style="float:right;color:#999;font-size:12px">
          {{ data.leader ? `组长: ${data.leader.name}` : '' }}
        </span>
      </template>
    </el-tree-select>

    <!-- ─────────────────────────────── Chip list ──────────────────── -->
    <div class="chip-box">
      <el-tag
          v-for="t in teamAssociationTags"
          :key="t.id"
          :type="t.role==='L' ? 'warning' : 'info'"
          closable
          @close="removeTag(t.id)"
          @click="toggleRole(t.id)"
          class="tag-clickable"
      >
        {{ t.label }}
        <span class="tag-role">
          ({{ t.role === 'L' ? '组长' : '成员' }})
        </span>
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {translate} from "@/utils/i18n";

const props = defineProps({
  teamTree   : { type: Array,   required: true },
  parentMap  : { type: Object,  required: true },  // { childId : parentId }
  // original   : {                // initial state from userManagement
  //   type : Object,
  //   default : () => ({
  //     role            : 2,      // 1-supervisor, 2-worker, 3-teamLead, 4-manager
  //     membershipTeams : [],
  //     leadershipTeams : []
  //   })
  // },
  membershipTeams: {type:Array, required: true},
  leadershipTeams: {type:Array, required: true},
  role: {type: Object, required: true},
})

const emit = defineEmits(['update'])   // payload: { membership, leadership }

/* ------------------------------------------------------------------ */
/*  local reactive state                                              */
/* ------------------------------------------------------------------ */
const checked = ref([])          // bound to <el-tree-select>
const teamAssociationTags = ref([])          // team association tags, [{ id,label,role:'M'|'L' }]
const leaderId  = ref(null)        // only one leader at a time

/* ------------------------------------------------------------------ */
/*  helpers                                                           */
/* ------------------------------------------------------------------ */
/* fast id → node lookup inside tree */
function findNode (id) {
  const stack = [...props.teamTree]

  while (stack.length) {
    const n = stack.pop()
    if (n.id === id) return n
    if (n.children?.length) stack.push(...n.children)
  }

  return { label:`#${id}` }
}

/* API stub – replace with real async call if necessary */
async function getTeamDepth (teamId) {
  // server gives depth (tier); here we fall back to walk parentMap
  let depth = 1, pid =  props.parentMap[teamId];

  while (pid) {
    depth++;
    pid = props.parentMap[pid];
  }

  return depth;
}

/* after any change push result to parent */
function emitUp () {
  console.log('emit up');
  console.log('membership: ', teamAssociationTags.value.map(t => t.id));
  console.log('leadership: ', leaderId.value ? [leaderId.value] : []);
  emit('update', {
    membership : teamAssociationTags.value.map(t => t.id),
    leadership : leaderId.value ? [leaderId.value] : []
  })
}

/* make sure ALL ancestors of id are present as Member tags & checked */
function ensureParents (childId) {
  let pid = props.parentMap[childId];

  while (pid) {
    if (!teamAssociationTags.value.find(t => t.id === pid)) {
      const node = findNode(pid);
      teamAssociationTags.value.push({ id:pid, label:node.label, role:'M' });
    }

    if (!checked.value.includes(pid)) {
      checked.value.push(pid)
    }

    pid = props.parentMap[pid]
  }
}

/* ------------------------------------------------------------------ */
/*  core logic                                                        */
/* ------------------------------------------------------------------ */
/* handle (un)checking in tree-select */
function onTreeChange (val) {      // val maybe single id or array
  console.log("tree new val is ", val);
  const ids = Array.isArray(val) ? val : (val ? [val] : []);

  // ① add new ids as Member
  ids.forEach(id => {
    if (!teamAssociationTags.value.find(t => t.id === id)) {
      const node = findNode(id);
      teamAssociationTags.value.push({ id, label: node.label, role:'M' });
    }

    ensureParents(id);
  })

  // ② remove unchecked
  teamAssociationTags.value = teamAssociationTags.value.filter(t => ids.includes(t.id));
  if (leaderId.value && !ids.includes(leaderId.value)) {
    leaderId.value = null;
  }

  emitUp();
}

/* click chip ⇒ toggle M/L with rule validation */
async function toggleRole (id) {
  const tag = teamAssociationTags.value.find(t => t.id === id);
  if (!tag) {
    return
  }

  const depth = await getTeamDepth(id);
  const role = props.role    // 1-supervisor,2-worker,3-team lead,4-manager

  if (tag.role === 'M') {
    /* permission rules ------------------------------------------------*/
    const denied =
        (role === 2) ||   // worker: no leader
        ((role === 1 || role === 4) && depth !== 1) ||  // manager: only tier-1
        (role === 3 && depth !== 2)  // teamLead: only tier-2

    if (denied) {
      ElMessage.warning('该用户角色不能设为此班组组长');
      return
    }

    // only one leader
    if (leaderId.value && leaderId.value !== id) {
      const prev = teamAssociationTags.value.find(t => t.id === leaderId.value);
      if (prev) {
        prev.role = 'M';
      }
    }

    tag.role = 'L';
    leaderId.value = id;
    ensureParents(id);
  }
  else {
    const denied = ((role === 1 || role === 4)) || // prevent supervisor/manager to be set as member
        ((role === 3) && depth !== 1); // prevent team lead to be set as member on sub team

    if (denied) {
      ElMessage.warning('该用户角色不能设为此班组成员');
      return
    }

    tag.role  = 'M';
    leaderId.value = null;
  }

  emitUp();
}

/* remove chip */
function removeTag (id) {
  teamAssociationTags.value = teamAssociationTags.value.filter(t => t.id !== id);
  checked.value = checked.value.filter(c => c !== id);
  if (leaderId.value === id) {
    leaderId.value = null;
  }

  emitUp();
}

/* ------------------------------------------------------------------ */
/*  initialise from original                                          */
/* ------------------------------------------------------------------ */
function initFromOriginal() {
  const membershipTeams = props.membershipTeams;
  const leadershipTeams = props.leadershipTeams;
  checked.value = [...new Set([...membershipTeams, ...leadershipTeams])];
  leaderId.value = leadershipTeams[0] || null;
  teamAssociationTags.value = checked.value.map(id => {
    const node = findNode(id);

    return {
      id,
      label : node.label,
      role  : leadershipTeams.includes(id) ? 'L' : 'M'
    }
  });

  emitUp();
}

initFromOriginal();

watch(
    () => props.membershipTeams, // triggers when a DIFFERENT object is passed
    ()=>initFromOriginal(), // re-sync internal state
    {immediate: true} // also run once on first mount
);

watch(
    () => props.leadershipTeams, // triggers when a DIFFERENT object is passed
    ()=>initFromOriginal(), // re-sync internal state
    {immediate: true} // also run once on first mount
);
</script>

<style scoped>
.chip-box{
  margin-top:6px;
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}
.tag-role{
  margin-left:4px;
  font-size:11px;
  color:#606266;
}

/* make the <el-tree-select> itself expand */
.tree-select--full{
  width: 100%;        /* allow it to fill parent */
  min-width: 280px;   /* whatever you feel looks good when empty */
}

/* the tag itself */
.tag-clickable{
  cursor:pointer;
  transition:filter .15s ease, box-shadow .15s ease;
}

/* ⬆️ brighten & lift on hover */
.tag-clickable:hover{
  filter:brightness(1.10);          /* 20 % lighter */
  box-shadow:0 0 6px rgba(0,0,0,.15);
}
</style>
