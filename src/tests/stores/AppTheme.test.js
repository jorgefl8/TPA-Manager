import router from '@/router/index';
import PrimeVue from 'primevue/config';
import Catalogue from '@/views/Catalogue.vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia'
import { useAppThemeStore } from "@/stores/appTheme";

const pinia = createPinia();
let store;

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

