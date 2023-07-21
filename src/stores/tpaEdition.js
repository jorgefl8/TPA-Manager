import { ref } from 'vue'
import { defineStore } from 'pinia'
import _ from 'lodash'

export const useTpaEditionStore = defineStore('tpaEdition', () => {
  const originalTpa = ref(null)
  const modifiedTpa = ref(null)

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

  function deleteTpaField(fieldPath) {
    _.unset(modifiedTpa.value, fieldPath)
  }

  return { originalTpa, modifiedTpa, BLOCK_TYPES, setInitialTpaData, saveTpaChanges, discardTpaChanges, getTpaField, updateTpaField, deleteTpaField }
})