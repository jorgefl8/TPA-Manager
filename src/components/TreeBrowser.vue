<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import { bluejayInfraStore } from '@/stores/bluejayInfra';
import { reactive, ref, computed } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import { useToast } from "primevue/usetoast";
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import axios from 'axios';
import { useTPAMode } from '@/utils/tpaMode.js';
import { changeShowHidden } from '@/utils/showHiddenCourses.js';

const { showHiddenCourses } = changeShowHidden();
const { tpaEditMode } = useTPAMode();
const bluejayInfra = bluejayInfraStore();
const router = useRouter();
const toast = useToast();
const displayDialogEditClass = ref(false);
const isMobile = ref(window.innerWidth <= 768);
const SCOPES_URL = `${bluejayInfra.SCOPE_MANAGER_URL}/api/v1/scopes/development/`;
const props = defineProps({
  nodes: Array,
  depth: {
    type: Number,
    default: 0,
  }
});

const editedCourseValues = ref({});
const originalCourseValues = ref({});
const authorization = computed(() => localStorage.getItem('auth'));

async function openEditDialog(node) {
  editedCourseValues.value = {
    templateId: node.templateId || 'null',
    joinCode: node.joinCode || 'none',
    autoRun: node.autoRun !== undefined ? node.autoRun : false,
    hidden: node.hidden !== undefined ? node.hidden : false,
  };
  originalCourseValues.value = {
    classId: node.classId,
    templateId: node.templateId || 'null',
    joinCode: node.joinCode || 'none',
    autoRun: node.autoRun !== undefined ? node.autoRun : false,
    hidden: node.hidden !== undefined ? node.hidden : false,
  };
  displayDialogEditClass.value = true;
  getTemplates();
}


async function updateCourse() {
  try {
    const response = await axios.put(SCOPES_URL + originalCourseValues.value.classId, editedCourseValues.value, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization.value,
      }
    });
    if (response.status === 200) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Course updated successfully', life: 3000 });
      editedCourseValues.value = {};
      originalCourseValues.value = {};
      setTimeout(() => {
        location.reload();
      }, 2000);
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: response.data.message, life: 3000 });
    }
  } catch (error) {
    console.error("Error updating course:", error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update course', life: 3000 });
  }
  displayDialogEditClass.value = false;
}

const templatesURL = bluejayInfra.REGISTRY_URL + "/api/v6/templates";
const templates = ref([]);
async function getTemplates() {
  await axios.get(templatesURL)
    .then(async (response) => {
      templates.value = response.data.sort((a, b) => a.id.localeCompare(b.id));
    })
    .catch(error => {
      console.log("Error: ", error);
    });
}

const expandedStates = reactive({});


const toggleNode = (node) => {
  const nodeId = node.projectId || node.classId;
  expandedStates[nodeId] = !expandedStates[nodeId];
};


const isExpanded = (node) => {
  const nodeId = node.projectId || node.classId;
  return !!expandedStates[nodeId];
};

const getNodeText = (node) => node.classId || node.projectId || node.name;

const getChildNodes = (node) => {
  let children = node.children || node.projects || [];
  children.forEach(childNode => {
    childNode.parentNode = node;
    const childNodeId = childNode.projectId || childNode.classId;
    childNode.expanded = !!expandedStates[childNodeId];
  });
  return children;
};

const showTpa = (node, parentNode) => {
  tpaEditMode.value = false;
  router.push({ name: 'tpa', params: { classId: parentNode.classId, projectId: node.projectId } });
};

const showDashboard = (node) => {
  const targetURL = `${bluejayInfra.DASHBOARD_URL}/dashboard/script/dashboardLoader.js?dashboardURL=${bluejayInfra.REPORTER_URL}/api/v4/dashboards/tpa-${node.projectId}/main`;
  window.open(targetURL, '_blank');
};

const showGithubRepository = (repoOwner, repository) => {
  return `https://github.com/${repoOwner}/${repository}`;
};


</script>

<template>
  <div v-for="node in nodes"  :key="getNodeText(node)" class="node-container"
    :style="{ 'margin-left': `${depth * 10}px` }">
    <!-- first node details-->
    <div v-if="depth === 0" class="node-custom">
      <div>
        <span style="font-size: 20px !important; vertical-align: middle;" @click="toggleNode(node)">
          <i :class="['pi', 'pi-angle-double-right', { 'rotate-down': isExpanded(node), 'rotate-right': !isExpanded(node) }]"
            :style="{ color: isExpanded(node) ? '#10B981' : '#43A5F4' }"></i> {{ getNodeText(node) }}
        </span>
        <Button label="New Class" @click="$router.push({ name: 'new-class' })" icon="pi pi-plus" :pt="{
    root: { class: 'bg-green-400 border-green-400 hover:bg-green-600 hover:border-green-600', style: 'height: 27px; padding: 0 10px; margin-left: 10px' },
  }" raised />
      </div>
      <div class="flex align-items-center gap-2">
        <span> Show hidden courses: </span>
        <InputSwitch v-model="showHiddenCourses" :pt="{
    slider: ({ props }) => ({
      class: props.modelValue ? 'bg-green-400' : 'bg-gray-300'
    })
  }" />
      </div>
    </div>
    <!-- else nodes-->
    <div v-else class="node-content">
      <span @click="toggleNode(node)">
        <i :class="['pi', 'pi-angle-double-right', { 'rotate-down': isExpanded(node), 'rotate-right': !isExpanded(node) }]"
          :style="{ color: isExpanded(node) ? '#10B981' : '#43A5F4' }"></i> {{ getNodeText(node) }}
      </span>
      <!-- class node details-->
      <div v-if="node.classId">
        <Button label="Edit" icon="pi pi-pencil" @click="openEditDialog(node)" :pt="{
    root: { class: 'bg-bluegray-400 border-bluegray-400 hover:bg-bluegray-600 hover:border-bluegray-600', style: 'height: 27px; padding: 0 10px; margin-left: 10px' }
  }" raised />

        <Dialog v-model:visible="displayDialogEditClass" modal>
          <template #header>
            <span>Edit course: <strong>{{ originalCourseValues.classId }}</strong></span>
          </template>
          <ScrollPanel
            :style="{ 'width': '100%', 'height': '400px', 'margin-bottom': '5px', ' padding-right': ' 15px' }"
            :pt="{ barY: 'hover:bg-green-400 bg-green-400 opacity-70', barX: 'hover:bg-green-400 bg-green-400 opacity-70' }">
            <div class="flex flex-column gap-2 mb-3">
              <div class="edit-card">
                <label for="templateId">Previous TPA template:</label>
                <p>{{ originalCourseValues.templateId }}</p>
                <label for="templateId">Select TPA template</label>
                <Dropdown id="templateId" v-model="editedCourseValues.templateId" :options="templates" optionLabel="id"
                  optionValue="id" filter>
                </Dropdown>
              </div>
              <div class="edit-card">
                <label for="joinCode">Previous Join Code:</label>
                <p>{{ originalCourseValues.joinCode }}</p>
                <label for="joinCode">Join Code</label>
                <InputText id="joinCode" v-model="editedCourseValues.joinCode" />
              </div>
              <div class="edit-card">
                <label for="autoRun">Previous Auto-run:</label>
                <p>{{ originalCourseValues.autoRun }}</p>
                <label for="autoRun">Auto-run:</label>
                <InputSwitch v-model="editedCourseValues.autoRun" :pt="{
    slider: ({ props }) => ({
      class: props.modelValue ? 'bg-green-400' : 'bg-gray-300'
    })
  }" />
              </div>
              <div class="edit-card">
                <label for="hidden">Previous Hidden:</label>
                <p>{{ originalCourseValues.hidden }}</p>
                <label for="hidden">Hidden:</label>
                <InputSwitch v-model="editedCourseValues.hidden" :pt="{
    slider: ({ props }) => ({
      class: props.modelValue ? 'bg-green-400' : 'bg-gray-300'
    })
  }" />
              </div>
            </div>
            <ScrollTop target="parent" :threshold="300" icon="pi pi-angle-up" />
          </ScrollPanel>
          <div class="flex justify-content-center gap-2" style="margin-bottom: 10px;">
            <Button label="Modify" @click="updateCourse"
              :pt="{ root: { class: 'bg-green-400 border-green-400 hover:bg-green-600 hover:border-green-600' } }" />
            <Button label="Cancel" @click="displayDialogEditClass = false"
              :pt="{ root: { class: 'bg-red-400 border-red-400 hover:bg-red-600 hover:border-red-600' } }" />
          </div>
        </Dialog>

        <Button label="TPA Template"
          @click="$router.push({ name: 'tpa-template', params: { templateId: node.templateId } })" :pt="{
    root: { class: 'bg-blue-500 border-blue-500 hover:bg-blue-700 hover:border-blue-700', style: 'height: 27px; padding: 0 10px; margin-left: 10px' },
  }" raised />
        <Button label="TPA List" @click="$router.push({ name: 'tpa-list', params: { classId: node.classId } })" :pt="{
    root: { class: 'bg-blue-500 border-blue-500 hover:bg-blue-700 hover:border-blue-700', style: 'height: 27px; padding: 0 10px; margin-left: 10px' },
  }" raised />
      </div>

      <!-- project node details-->
      <div v-if="node.projectId">
        <Button label="TPA" @click="showTpa(node, node.parentNode)" :pt="{
    root: { class: 'bg-yellow-300 border-yellow-300 hover:bg-yellow-500 hover:border-yellow-500', style: 'height: 27px; padding: 0 10px; margin-left: 10px' },
  }" raised />
        <Button label="Dashboard" @click="showDashboard(node)" :pt="{
    root: { class: 'bg-yellow-300 border-yellow-300 hover:bg-yellow-500 hover:border-yellow-500', style: 'height: 27px; padding: 0 10px; margin-left: 8px' },
  }" raised />
        <a :href="showGithubRepository(node.identities.repoOwner, node.identities.repository)" target="_blank"
          rel="noopener noreferrer">
          <i class="pi pi-github"></i>
        </a>
      </div>
    </div>
    <!-- projectId details-->
    <div v-if="node.projectId && isExpanded(node)" class="details-container">
      <div class="left-sections">
        <h3 style="margin: 0;">Identities</h3>
        <ul v-if="node.identities && node.identities.length">
          <li v-for="identity in node.identities" :key="identity.source">
            <template v-for="(value, key) in identity" :key="key">
              <div>{{ key }}: {{ value }}</div>
            </template>
          </li>
        </ul>
        <p v-else>No data available</p>

        <h3 style="margin: 0;">Credentials</h3>
        <ul v-if="node.credentials && node.credentials.length">
          <li v-for="credential in node.credentials" :key="credential.source">
            <template v-for="(value, key) in credential" :key="key">
              <div>{{ key }}: {{ value }}</div>
            </template>
          </li>
        </ul>
        <p v-else>No data available</p>
      </div>
      <div class="members-section">
        <h3 style="margin-bottom: 5px;">Members</h3>
        <ScrollPanel
          :style="{ 'width': '100%', 'height': node.members.length > 0 ? '200px' : '100px', 'margin-bottom': '5px', ' padding-right': ' 15px' }"
          :pt="{ barY: 'hover:bg-green-400 bg-green-400 opacity-70', barX: 'hover:bg-green-400 bg-green-400 opacity-70' }">
          <ul v-if="node.members && node.members.length">
            <li v-for="member in node.members" :key="member">
              <template v-for="(value, key) in member" :key="key">
                <div>{{ key }}: {{ value }}</div>
              </template>
            </li>
          </ul>
          <p v-else>No data available</p>
          <ScrollTop target="parent" :threshold="300" icon="pi pi-angle-up" />
        </ScrollPanel>

      </div>
    </div>
    <div v-if="isExpanded(node) && getChildNodes(node).length === 0 && node.projects" class="details-container">
      <p>No projects available</p>
    </div>

    <Toast ref="toast" :position="isMobile ? 'bottom-left' : 'bottom-right'" :baseZIndex="10000" />
    <TreeBrowser v-if="isExpanded(node) && getChildNodes(node).length > 0" :nodes="getChildNodes(node)"
      :depth="depth + 1" />
  </div>
</template>


<style scoped>
.node-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-card {
  border: 1px solid #e0e0e0;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.edit-card label {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.edit-card p {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 27px;
  width: 27px;
  margin-left: 10px;
  text-decoration: none;
  color: inherit;
  border: 1px solid;
  border-radius: 4px;
  background-color: #414543;
  color: white;
  border-color: #414543;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: 0.4s;
}

a:hover {
  background-color: #414543;
  color: white;
  border-color: #414543;
  transform: scale(1.2);
}

.node-container {
  cursor: pointer;
  text-align: left !important;
  margin-top: 5px;
}

.node-content {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

:deep(.p-scrollpanel-content) {
  width: 100%;
}

.node-content span {
  font-size: 20px !important;
  vertical-align: middle;
}


.custom-button {
  font-size: 14px !important;
  margin: 0 3px;
  padding: 0.3rem 0.3rem;
  background-color: transparent;
  color: #10B981;
  border: 1px solid #10B981;
  border-radius: 3px;
  cursor: pointer;
}

.custom-button:hover {
  background-color: #10B981;
  color: white;
}

ul {
  padding-left: 25px;
  margin: 0 !important;
}

.rotate-down,
.rotate-right {
  transition: transform 0.5s ease;
}

.rotate-down {
  transform: rotate(90deg);
}

.rotate-right {
  transform: rotate(0deg);
}

.details-container {
  border: 1px solid #ccc;
  padding: 15px !important;
  margin-top: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  cursor: default;
}

.left-sections {
  flex: 1;

}

.members-section {
  flex: 1;
}

p {
  color: #777;
  margin-left: 25px;
}

@media screen and (max-width: 768px) {
  .details-container {
    display: block;
  }

  .node-content {
    display: inline;
  }
}
</style>
