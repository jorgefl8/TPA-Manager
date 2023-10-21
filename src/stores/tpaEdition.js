import _ from 'lodash'
import axios from 'axios'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'
import * as prettier from "prettier";
let prettierPluginGraphql;

if (process.env.NODE_ENV !== 'test') {
  import('https://unpkg.com/prettier@3.0.3/plugins/graphql.mjs').then((module) => {
    prettierPluginGraphql = module.default;
  });
}

export const useTpaEditionStore = defineStore('tpaEdition', () => {
  const originalTpa = ref(null)
  const modifiedTpa = ref(null)
  const discardButtonClicked = ref(false)
  const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5400'
  const COLLECTOR_EVENTS_URL = process.env.COLLECTOR_EVENTS_URL || 'http://localhost:5500'
  const isProductionEnvironment = ref(localStorage.getItem('isProductionEnvironment') === 'true')

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

  const COLLECTOR_ELEMENT_TYPES = [
    { label: "Number", value: "number" },
    { label: "Github GraphQL", value: "githubGQL" },
    { label: "JSON", value: "json" }
  ]
  
  const COLLECTOR_EVENT_SOURCES = ["github", "githubCI", "githubGQL", "gitlab", "ghwrapper", "pivotal", "heroku", "travis", "codeclimate", "redmine", "jira"]

  const COLLECTOR_EVENT_ENDPOINTS = {
    github: ["events", "mergedPR", "closedPR", "openPR", "allPR", "closedPRFiles"],
    githubCI: ["builds"],
    githubGQL: ["custom"],
    gitlab: ["events", "mergedMR", "closedMR", "allMR", "newBranches", "newBranchesAllRepos", "updatedBranches", "branchesUpdateRatioAllRepos", "closedBranches", "closedBranchesAllRepos", "commits", "releases"],
    ghwrapper: ["events"],
    pivotal: ["activity", "stories"],
    heroku: ["releases", "builds"],
    travis: ["builds_public", "builds_private"],
    codeclimate: ["coverage"],
    redmine: ["newIssues", "inProgressIssues30Days", "updatedIssues", "inProgressIssuesByMember", "issuesMovedToInProgress", "inProgressIssuesClosed", "closedIssues", "closedIssues30Days", "closedIssuesOnePoint5Days"],
    jira: ["newIssues", "updatedIssues"]
  }

  const STEP_TYPES = [
    { label: "GraphQL query", value: "queryGetObject" },
    { label: "Select data by path", value: "objectGetSubObjects" },
    { label: "Filter data", value: "objectsFilterObjects" },
    { label: "Execute custom function", value: "runScript" },
  ]

  const WINDOW_PERIOD_OPTIONS = [
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Biweekly', value: 'biweekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Bimonthly', value: 'bimonthly' },
    { label: 'Annually', value: 'annually'}
  ]

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
      await axios.delete(`${REGISTRY_URL}/api/v6/agreements/${originalTpa.value.id}`).catch(error => console.log("Error deleting agreement: ", error))
      await axios.post(`${REGISTRY_URL}/api/v6/agreements`, modifiedTpa.value).catch(error => console.log("Error creating agreement: ", error))
      
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

  function updateGuaranteeWithNewObjective(withPath, newObjective) {
    const newWith = {};
    const tpaMetricsIds = Object.keys(modifiedTpa.value.terms.metrics)

    for (const metric of tpaMetricsIds) {

      // If the metric is in the new objective, add it to the new "with" object
      if (newObjective.match(new RegExp(`\\b${metric}\\b`, 'g'))) {
        newWith[metric] = {};
      }
    }

    _.set(modifiedTpa.value, withPath, newWith)
  }

  async function formatQueryGraphQL(query) {
    try {
      return await prettier.format(query, {
        parser: "graphql",
        plugins: [prettierPluginGraphql],
      });
    } catch (error) {
      console.error('Error formatting the GraphQL query:', error);
      throw error;
      // return query; // Return the original query in case of an error
    }
  }
  
  function unformatQueryGraphQL(query) {
    try {
      return query.replace(/\s+/g, ' ').trim();;
    } catch (error) {
      console.error('Error unformatting GraphQL query:', error);
      return query; // Return the original query in case of an error
    }
  }

  function testMetric(metricData, window) {
    const requestBody = {
      config: metricData.collector.config,
      metric: {
        computing: metricData.measure.computing,
        element: metricData.measure.element,
        event: metricData.measure.event,
        scope: {
          project: metricData.measure.scope.project.default,
          class: metricData.measure.scope.class.default
        },
        window
      }
    }

    return axios.post(`${COLLECTOR_EVENTS_URL}/api/v2/computations`, requestBody)
  }

  return { 
    originalTpa, modifiedTpa, discardButtonClicked, isProductionEnvironment, isEditionMode, BLOCK_TYPES, COLLECTOR_EVENT_SOURCES, COLLECTOR_EVENT_ENDPOINTS, STEP_TYPES, WINDOW_PERIOD_OPTIONS, COLLECTOR_ELEMENT_TYPES,
    setInitialTpaData, saveTpaChanges, discardTpaChanges, getTpaField, updateTpaField, deleteTpaField, updateGuaranteeWithNewObjective, testMetric, formatQueryGraphQL, unformatQueryGraphQL
  }
})