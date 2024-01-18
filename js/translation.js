
const defaultLocale = "en";
let locale;
let translations = {};


document.addEventListener("DOMContentLoaded", () => {
  setLocale(defaultLocale);
});

async function setLocale(newLocale) {

  if (newLocale === locale) return;
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
  return translations[key] || key;
}