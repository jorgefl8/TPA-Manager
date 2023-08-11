import router from '@/router/index';
import PrimeVue from 'primevue/config';
import Catalogue from '@/views/Catalogue.vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia'
import { useAppThemeStore } from "@/stores/appTheme";
import axios from 'axios'

const pinia = createPinia();
vi.mock('axios')
let store;
const testTpa = {"id":"tpa-1010101010","version":"1.0.0","type":"agreement","context":{"infrastructure":{},"validity":{"initial":"2017-10-15","timeZone":"America/Los_Angeles"},"definitions":{"schemas":{},"dashboards":{"main":{"base":"http://bluejay-assets-manager/api/v1/public/grafana-dashboards/tpa/base.json","modifier":"http://bluejay-assets-manager/api/v1/public/grafana-dashboards/tpa/modifier.js","overlay":"http://bluejay-assets-manager/api/v1/public/grafana-dashboards/tpa/overlay.js"}},"scopes":{"development":{"project":{"name":"Project","description":"Project","type":"string","default":"1010101010"},"class":{"name":"Class","description":"Group some projects","type":"string","default":"2020202020"}}},"collectors":{"eventcollector":{"infrastructurePath":"internal.collector.events","endpoint":"/api/v2/computations","type":"POST-GET-V1","config":{"scopeManager":"http://bluejay-scope-manager/api/v1/scopes/development"}}}}},"terms":{"metrics":{"PERCENTAGE_NEWBRANCHWR_STARTEDSTORIES":{"collector":{"$ref":"#/context/definitions/collectors/eventcollector"},"measure":{"computing":"actual","element":{"percentage":{"related":{"ghwrapper":{"events":{"type":"CreateEvent","payload":{"ref_type":"branch"}}},"window":86400}}},"event":{"pivotal":{"activity":{"highlight":"started"}}},"scope":{"$ref":"#/context/definitions/scopes/development"}}},"PERCENTAGE_OPENPR_FINISHEDSTORIES":{"collector":{"$ref":"#/context/definitions/collectors/eventcollector"},"measure":{"computing":"actual","element":{"percentage":{"related":{"github":{"allPR":{}},"window":86400}}},"event":{"pivotal":{"activity":{"highlight":"finished"}}},"scope":{"$ref":"#/context/definitions/scopes/development"}}},"PERCENTAGE_MERGEPR_DELIVEREDSTORIES":{"collector":{"$ref":"#/context/definitions/collectors/eventcollector"},"measure":{"computing":"actual","element":{"percentage":{"related":{"github":{"mergedPR":{}},"window":86400}}},"event":{"pivotal":{"activity":{"highlight":"delivered"}}},"scope":{"$ref":"#/context/definitions/scopes/development"}}},"PERCENTAGE_RELEASES_DELIVEREDSTORIES":{"collector":{"$ref":"#/context/definitions/collectors/eventcollector"},"measure":{"computing":"actual","element":{"percentage":{"related":{"heroku":{"releases":{"status":"succeeded","description":"%CONTAINS%Deploy"}},"window":86400000}}},"event":{"pivotal":{"activity":{"highlight":"delivered"}}},"scope":{"$ref":"#/context/definitions/scopes/development"}}},"PERCENTAGE_MASTER_PR_MERGE_CHANGES_UNDER_300":{"collector":{"$ref":"#/context/definitions/collectors/eventcollector"},"measure":{"computing":"actual","element":{"percentage":{"related":{"github":{"closedPRFiles":{"changes":"%SECOND%%LOWER_OR_EQUAL%300"}}}}},"event":{"github":{"closedPRFiles":{}}},"scope":{"$ref":"#/context/definitions/scopes/development"}}},"NUMBER_GITHUB_MERGE_PR":{"collector":{"$ref":"#/context/definitions/collectors/eventcollector"},"measure":{"computing":"actual","element":"number","event":{"github":{"mergedPR":{}}},"scope":{"$ref":"#/context/definitions/scopes/development"}}},"STDEV_GITHUB_MERGE_PR":{"collector":{"$ref":"#/context/definitions/collectors/eventcollector"},"measure":{"computing":"string","element":{"stdev":{"period":"daily"}},"event":{"github":{"mergedPR":{}}},"scope":{"$ref":"#/context/definitions/scopes/development"}}}},"guarantees":[{"id":"75_PERCENT_MASTER_PR_OPEN_FINSH_STORIES_WITHIN_A_DAY","notes":"#### Description\r\n```\r\nTP-1: At least 75% of finished stories(PT) must match creation of a PR within a day.","description":"At least 75% of finished stories must match the creation of a PR within a day.","scope":{"$ref":"#/context/definitions/scopes/development"},"of":[{"scope":{"project":"1010101010"},"objective":"PERCENTAGE_OPENPR_FINISHEDSTORIES >= 75","with":{"PERCENTAGE_OPENPR_FINISHEDSTORIES":{}},"window":{"type":"static","period":"daily","initial":"2018-01-01"}}]},{"id":"75_PERCENT_MASTER_PR_MERGE_DELVR_STORIES_WITHIN_A_DAY","notes":"#### Description\r\n```\r\nTP-1: At least 75% of delivered stories(PT) must match a the merge of a PR into master within a day.","description":"At least 75% of delivered stories must match the merge of a PR into master within a day.","scope":{"$ref":"#/context/definitions/scopes/development"},"of":[{"scope":{"project":"1010101010"},"objective":"PERCENTAGE_MERGEPR_DELIVEREDSTORIES >= 75","with":{"PERCENTAGE_MERGEPR_DELIVEREDSTORIES":{}},"window":{"type":"static","period":"daily","initial":"2018-01-01"}}]},{"id":"75_PERCENT_MASTER_PR_MERGE_LESS_THAN_300_CHANGES_WITHIN_A_DAY","notes":"#### Description\r\n```\r\nTP-1: At least 75% of delivered stories(PT) must match a the merge of a PR into master within a day.","description":"At least 75% of delivered stories must match the merge of a PR into master within a day.","scope":{"$ref":"#/context/definitions/scopes/development"},"of":[{"scope":{"project":"1010101010"},"objective":"PERCENTAGE_MASTER_PR_MERGE_CHANGES_UNDER_300 >= 75","with":{"PERCENTAGE_MASTER_PR_MERGE_CHANGES_UNDER_300":{}},"window":{"type":"static","period":"daily","initial":"2018-01-01"}}]},{"id":"NUMBER_MASTER_PR_MERGE_WEEKLY_OVER_1_OR_EQUAL","notes":"#### Description\r\n```\r\nTP-1: At least 75% of delivered stories(PT) must match a the merge of a PR into master within a day.","description":"At least 75% of delivered stories must match the merge of a PR into master within a day.","scope":{"$ref":"#/context/definitions/scopes/development"},"of":[{"scope":{"project":"1010101010"},"objective":"NUMBER_GITHUB_MERGE_PR >= 1","with":{"NUMBER_GITHUB_MERGE_PR":{}},"window":{"type":"static","period":"weekly","initial":"2018-01-01"}}]},{"id":"STDEV_GITHUB_MERGE_PR_WEEKLY_UNDER_1","notes":"#### Description\r\n```\r\nTP-1: At least 75% of delivered stories(PT) must match a the merge of a PR into master within a day.","description":"At least 75% of delivered stories must match the merge of a PR into master within a day.","scope":{"$ref":"#/context/definitions/scopes/development"},"of":[{"scope":{"project":"1010101010"},"objective":"STDEV_GITHUB_MERGE_PR < 1","with":{"STDEV_GITHUB_MERGE_PR":{}},"window":{"type":"static","period":"weekly","initial":"2018-01-01"}}]}]}}

describe("AppTheme store", () => {
    beforeEach(() => {
        setActivePinia(pinia)
        store = useAppThemeStore();

        // Manually add the <link> element to the <head> in the DOM for the tests to work
        const link = document.createElement('link');
        link.id = 'theme-link';
        link.href = '@/assets/themes/lara-light-blue/theme.css';
        document.head.appendChild(link);
    })

    axios.get.mockResolvedValue({ data: { content: "eyJtZXRyaWNzIjpbXSwiZ3VhcmFudGVlcyI6W119" } });
    
    const wrapper = mount(Catalogue, {
        global: {
            plugins: [router, pinia, PrimeVue],
        },
    });
    
    it('mounts correctly', () => {
        expect(wrapper.isVisible()).toBe(true);
    });
    
    test("should have the default theme", () => {
        expect(store.appTheme).toEqual("Light");
    });

    test("should toggle the theme", () => {
        store.toggleTheme();
        expect(store.appTheme).toEqual("Dark");
        expect(store.isDarkModeOn).toEqual(true);
        store.toggleTheme();
        expect(store.appTheme).toEqual("Light");
    });

    it("matches snapshot in light mode", () => {
        expect(wrapper.html()).toMatchSnapshot();
    });

    it("matches snapshot in dark mode", async () => {
        wrapper.find("button.right-0").trigger("click");
        await wrapper.vm.$nextTick(); // Wait for the component to update
        expect(wrapper.html()).toMatchSnapshot();
    });
});

