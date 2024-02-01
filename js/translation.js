
let locale;
let translations = {};

async function getUserLocale() {

  const userLocale = navigator.language || navigator.userLanguage;
  const lowerCaseLocale = userLocale.toLowerCase();
  if (lowerCaseLocale.startsWith('fr')) {
    return 'fr';
  }
  if (lowerCaseLocale.startsWith('en')) {
    return 'en';
  }

  return 'en';
}


window.addEventListener("DOMContentLoaded", async() => {
  locale = await getUserLocale();
  await setLocale(locale);
});

async function setLocale(newLocale) {
  if(newLocale === undefined || newLocale === null) {
    newLocale = 'fr'
  }
  const newTranslations = await fetchTranslationsFor(newLocale);
  locale = newLocale;
  translations = newTranslations;
  translatePage();
}

async function fetchTranslationsFor(newLocale) {
  if(newLocale === undefined || newLocale === null) {
    newLocale = 'fr'
  }
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