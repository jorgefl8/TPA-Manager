import _ from 'lodash'
import axios from 'axios'
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTpaEditionStore = defineStore('tpaEdition', () => {
  const originalTpa = ref(null)
  const modifiedTpa = ref(null)
  const discardButtonClicked = ref(false)
  const isProductionEnvironment = ref(localStorage.getItem('isProductionEnvironment') === 'true' ?? false)

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
    if (modifiedTpa.value.context.definitions.scopes.development.member.default !== "*") {
      deleteTpaField('context.definitions.scopes.development.member')
    }

    // Production or development environment transformation
    modifiedTpa.value = JSON.parse(JSON.stringify(modifiedTpa.value).replace(/http:\/\/(host\.docker\.internal:5700|bluejay-scope-manager)/g, isProductionEnvironment.value ? "http://bluejay-scope-manager" : "http://host.docker.internal:5700"))
    modifiedTpa.value.context.definitions.dashboards.main.base = modifiedTpa.value.context.definitions.dashboards.main.base.replace(/http:\/\/(host\.docker\.internal:5200|[^\/]+-assets-manager)/g, isProductionEnvironment.value ? "http://bluejay-assets-manager" : "http://host.docker.internal:5200")
    modifiedTpa.value.context.definitions.dashboards.main.modifier = modifiedTpa.value.context.definitions.dashboards.main.modifier.replace(/http:\/\/(host\.docker\.internal:5200|[^\/]+-assets-manager)/g, isProductionEnvironment.value ? "http://bluejay-assets-manager" : "http://host.docker.internal:5200")
    modifiedTpa.value.context.definitions.dashboards.main.overlay = modifiedTpa.value.context.definitions.dashboards.main.overlay.replace(/http:\/\/(host\.docker\.internal:5200|[^\/]+-assets-manager)/g, isProductionEnvironment.value ? "http://bluejay-assets-manager" : "http://host.docker.internal:5200")
    
    try {
      
      // If "Project ID" or "Course ID" modified, replace in the TPA and redirect to URL with new IDs
      const areIdsModified = originalTpa.value.context.definitions.scopes.development.project.default !== modifiedTpa.value.context.definitions.scopes.development.project.default
        || originalTpa.value.context.definitions.scopes.development.class.default !== modifiedTpa.value.context.definitions.scopes.development.class.default
      
      if (areIdsModified) {
        modifiedTpa.value.id = "tpa-" + modifiedTpa.value.context.definitions.scopes.development.project.default
        modifiedTpa.value = JSON.parse(JSON.stringify(modifiedTpa.value).replace(new RegExp('\"' + originalTpa.value.context.definitions.scopes.development.project.default + '\"', "g"), '\"' + modifiedTpa.value.context.definitions.scopes.development.project.default + '\"'))
        modifiedTpa.value = JSON.parse(JSON.stringify(modifiedTpa.value).replace(new RegExp('\"' + originalTpa.value.context.definitions.scopes.development.class.default + '\"', "g"), '\"' + modifiedTpa.value.context.definitions.scopes.development.class.default + '\"'))
        this.router.push({ name: 'edition', params: { courseId: modifiedTpa.value.context.definitions.scopes.development.class.default, projectId: modifiedTpa.value.context.definitions.scopes.development.project.default } })
      }
        
      await axios.delete(`http://localhost:5400/api/v6/agreements/${originalTpa.value.id}`).catch(error => console.log("Error deleting agreement: ", error))
      await axios.post(`http://localhost:5400/api/v6/agreements`, modifiedTpa.value).catch(error => console.log("Error creating agreement: ", error))
      
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
    originalTpa, modifiedTpa, discardButtonClicked, isProductionEnvironment, BLOCK_TYPES,
    setInitialTpaData, saveTpaChanges, discardTpaChanges, getTpaField, updateTpaField, deleteTpaField
  }
})