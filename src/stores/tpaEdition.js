import { defineStore } from 'pinia'
import { ref } from 'vue'
import _ from 'lodash'

export const useTpaEditionStore = defineStore('tpaEdition', () => {
  const originalTpa = ref(null)
  const modifiedTpa = ref(null)

  function setInitialTpaData(tpa) {
    originalTpa.value = _.cloneDeep(tpa)
    modifiedTpa.value = _.cloneDeep(tpa)
  }

  function saveTpaChanges() {
    originalTpa.value = modifiedTpa
  }

  function discardTpaChanges() {
    modifiedTpa.value = originalTpa
  }

  function getTpaField(fieldPath) {
    return _.get(modifiedTpa.value, fieldPath)
  }
  
  function updateTpaField(fieldPath, value) {
    _.set(modifiedTpa.value, fieldPath, value)
  }

  return { originalTpa, modifiedTpa, setInitialTpaData, saveTpaChanges, discardTpaChanges, getTpaField, updateTpaField }
})