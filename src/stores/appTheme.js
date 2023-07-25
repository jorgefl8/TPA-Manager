import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePrimeVue } from 'primevue/config';

export const useAppThemeStore = defineStore('appTheme', () => {
  const PrimeVue = usePrimeVue();
  const appTheme = ref(localStorage.getItem("appTheme") || 'Light');

  const isDarkModeOn = computed(() => appTheme.value === 'Dark');
  
  function toggleTheme() {
    if (appTheme.value === 'Dark') {
      appTheme.value = 'Light';
      localStorage.setItem("appTheme", "Light");
      PrimeVue.changeTheme('arya-blue', 'lara-light-blue', 'theme-link', () => {});
    } else {
      appTheme.value = 'Dark';
      localStorage.setItem("appTheme", "Dark");
      PrimeVue.changeTheme('lara-light-blue', 'arya-blue', 'theme-link', () => {});
    }
  }
  
  return { appTheme, isDarkModeOn, toggleTheme }
});