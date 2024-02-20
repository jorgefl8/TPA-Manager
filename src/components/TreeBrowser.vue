<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
    nodes: Array,
    depth: {
        type: Number,
        default: 0,
    },
})

const expanded = ref([])

const router = useRouter()

onMounted(() => {
    if (props.nodes && props.nodes.length > 0 && 'name_class' in props.nodes[0]) {
        expanded.value.push(props.nodes[0]);
    }
});
watch(() => props.nodes, (newNodes) => {
    if (newNodes && newNodes.length > 0 && 'name_class' in newNodes[0]) {
        expanded.value = [newNodes[0]];
    }
}, { immediate: true });

const isExpanded = (node) => {
    return expanded.value.includes(node)
}

const nodeClicked = (node) => {
    const index = expanded.value.indexOf(node)
    if (index === -1) {
        expanded.value.push(node)
    } else {
        expanded.value.splice(index, 1)
    }
}

const getNodeText = (node) => {
    if (node.classId) {
        return node.classId
    } else if (node.projectId) {
        return node.projectId
    } else {
        return node.name_class // nodo raíz
    }
}

const getChildNodes = (node) => {
    let children = []
    if (node.children) {
        children = node.children
    } else if (node.projects) {
        children = node.projects
    }
    children.forEach(childNode => {
        childNode.parentNode = node
    })
    return children
}

const showTpa = (node, parentNode) => {
    router.push({ name_class: 'visualization', params: { courseId: parentNode.classId, projectId: node.projectId } })
}
</script>

<template>
    <div v-for="node in nodes" :key="getNodeText(node)" class="node-container"
        :style="{ 'margin-left': `${depth * 10}px` }">
        <div class="node-content">
            <span @click="nodeClicked(node)">
                <i :class="['pi', 'pi-angle-double-right', { 'rotate-down': isExpanded(node), 'rotate-right': !isExpanded(node) }]"
                    :style="{ color: isExpanded(node) ? '#10B981' : '#43A5F4' }"></i> {{ getNodeText(node) }}
            </span>
            <span v-if="node.classId">
                <button @click="showTemplate(node)" class="custom-button">Show Template</button>
            </span>
            <span v-if="node.projectId">
                <button @click="showTpa(node, node.parentNode)" class="custom-button">Show TPA</button>
                <button @click="showDashboard(node)" class="custom-button">Show Dashboard</button>
            </span>
        </div>
        <TreeBrowser v-if="isExpanded(node) && getChildNodes(node).length > 0" :nodes="getChildNodes(node)"
            :depth="depth + 1" />
    </div>
</template>

  

<style scoped>
.node-container {
    cursor: pointer;
    text-align: left !important;
}

.node-content {
    margin-bottom: 5px;
}

.node-content span,
i {
    font-size: 20px !important;
    vertical-align: middle;

}

.custom-button {
    font-size: 14px !important;

}

.custom-button {
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

.rotate-down {
    transition: transform 0.5s ease;
    transform: rotate(90deg);
}

.rotate-right {
    transition: transform 0.5s ease;
    transform: rotate(0deg);
}
</style>
