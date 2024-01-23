
let locale;
let translations = {};

async function getUserLocale() {
  const userLocale = navigator.language || navigator.userLanguage;
  if(userLocale !== 'fr' || userLocale !== 'fr-FR' || userLocale !== 'en-US' || userLocale !== 'en'){
    return 'en'
  }
  if(userLocale === 'fr' || userLocale === 'fr-FR'){
    return 'fr'
  }
  if(userLocale === 'en-US' || userLocale === 'en'){
    return 'en'
  }
  return 'en'
}

document.addEventListener("DOMContentLoaded", async() => {
  locale = await getUserLocale();
  await setLocale(locale);
});

async function setLocale(newLocale) {
  const newTranslations = await fetchTranslationsFor(newLocale);
  locale = newLocale;
  translations = newTranslations;
  translatePage();
}

async function fetchTranslationsFor(newLocale) {
  const response = await fetch(`../translations/${newLocale}.json`);
  return await response.json();
}

function translatePage() {
  document
    .querySelectorAll("[data-i18n-key]")
    .forEach(translateElement);
}

function translateElement(element) {
  const key = element.getAttribute("data-i18n-key");
  const translation = translations[key];
  element.innerText = translation;
}

function getTranslation(key) {
  return translations[key];
}