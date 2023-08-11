import _ from 'lodash'
import axios from 'axios'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'

export const useTpaEditionStore = defineStore('tpaEdition', () => {
  const originalTpa = ref(null)
  const modifiedTpa = ref(null)
  const discardButtonClicked = ref(false)
  const isProductionEnvironment = ref(localStorage.getItem('isProductionEnvironment') === 'true' ?? false)

  const ASSETS_MANAGER_URL = () => isProductionEnvironment.value ? "http://bluejay-assets-manager" : "http://host.docker.internal:5200"
  const SCOPE_MANAGER_URL = () => isProductionEnvironment.value ? "http://bluejay-scope-manager" : "http://host.docker.internal:5700"
  
  const route = useRoute();
  const isEditionMode = ref(route.path.includes('edition'))

  watch(() => route, (newRoute) => {
    isEditionMode.value = newRoute.path.includes('edition')
  }, { deep: true })

  const BLOCK_TYPES = [
    'correlated',
    'divider-changer',
    'divider-changer-github',
    'divider-github',
    'divider-github-states',
    'gauge',
    'gauge-notZero',
    'gauge-period-time',
    'gauge-period-time-correlation-notZero',
    'gauge-period-time-correlation-notZero-member',
    'gauge-time',
    'gauge-time-correlation',
    'gauge-time-correlation-notZero',
    'gauge-time-notZero',
    'time-gauge',
    'time-gauge-notZero',
    'time-graph',
    'time-graph-count',
    'time-graph-count-groupby',
    'time-graph-notZero',
    'time-graph2',
    'time-graph2-member',
    'time-graph2-member-groupby',
    'time-graph2-member-notZero',
    'time-graph2-notZero'
  ];

  function setInitialTpaData(tpa) {
    originalTpa.value = _.cloneDeep(tpa)
    modifiedTpa.value = _.cloneDeep(tpa)
  }
  
  async function saveTpaChanges() {

    // Remove "member" from scope if checkbox is not checked
    if (modifiedTpa.value.context.definitions.scopes.development?.member?.default !== "*") {
      deleteTpaField('context.definitions.scopes.development.member')
    }

    // Production or development environment transformation
    modifiedTpa.value = JSON.parse(JSON.stringify(modifiedTpa.value)
      .replace(/http:\/\/(host\.docker\.internal:5700|[^\/]+-scope-manager)/g, SCOPE_MANAGER_URL())
      .replace(/http:\/\/(host\.docker\.internal:5200|[^\/]+-assets-manager)/g, ASSETS_MANAGER_URL()))
    
    try {
      // If "Project ID" or "Course ID" are modified, replace in the TPA and reload the page to update the app values with the new ones
      const areIdsModified = originalTpa.value.context.definitions.scopes.development.project.default !== modifiedTpa.value.context.definitions.scopes.development.project.default
        || originalTpa.value.context.definitions.scopes.development.class.default !== modifiedTpa.value.context.definitions.scopes.development.class.default
      
      if (areIdsModified) {
        modifiedTpa.value.id = "tpa-" + modifiedTpa.value.context.definitions.scopes.development.project.default
        modifiedTpa.value = JSON.parse(JSON.stringify(modifiedTpa.value).replace(new RegExp('\"' + originalTpa.value.context.definitions.scopes.development.project.default + '\"', "g"), '\"' + modifiedTpa.value.context.definitions.scopes.development.project.default + '\"'))
        modifiedTpa.value = JSON.parse(JSON.stringify(modifiedTpa.value).replace(new RegExp('\"' + originalTpa.value.context.definitions.scopes.development.class.default + '\"', "g"), '\"' + modifiedTpa.value.context.definitions.scopes.development.class.default + '\"'))
      }
      
      // Delete and create the TPA to update it
      await axios.delete(`${process.env.REGISTRY_URL}/api/v6/agreements/${originalTpa.value.id}`).catch(error => console.log("Error deleting agreement: ", error))
      await axios.post(`${process.env.REGISTRY_URL}/api/v6/agreements`, modifiedTpa.value).catch(error => console.log("Error creating agreement: ", error))
      
      if (areIdsModified) {
        this.router.push({ name: 'edition', params: { courseId: modifiedTpa.value.context.definitions.scopes.development.class.default, projectId: modifiedTpa.value.context.definitions.scopes.development.project.default } })
      }

    } catch (error) {
      console.log("Error when saving TPA changes: ", error)
    }
  }

  function discardTpaChanges() {
    discardButtonClicked.value = true
    window.location.reload();
  }

  function getTpaField(fieldPath) {
    return _.get(modifiedTpa.value, fieldPath)
  }

  function updateTpaField(fieldPath, value) {
    _.set(modifiedTpa.value, fieldPath, value)
  }

  function deleteTpaField(fieldPath) {
    _.unset(modifiedTpa.value, fieldPath)
  }

  return { 
    originalTpa, modifiedTpa, discardButtonClicked, isProductionEnvironment, isEditionMode, BLOCK_TYPES,
    setInitialTpaData, saveTpaChanges, discardTpaChanges, getTpaField, updateTpaField, deleteTpaField
  }
})