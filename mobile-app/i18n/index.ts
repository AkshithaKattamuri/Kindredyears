import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import te from "./locales/te.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";
import fr from "./locales/fr.json";

const resources = {
  en: {
    translation: en,
  },
  te: {
    translation: te,
  },
  ta: {
    translation: ta,
  },
  hi: {
    translation: hi,
  },
  fr: {
    translation: fr,
  },
};

const supportedLanguages = ["en", "te", "ta", "hi", "fr"];

const getInitialLanguage = () => {
  const locales = Localization.getLocales();

  const deviceLanguage =
    locales?.[0]?.languageCode || "en";

  return supportedLanguages.includes(deviceLanguage)
    ? deviceLanguage
    : "en";
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },

    compatibilityJSON: "v4",
  });

export const changeAppLanguage = async (
  languageCode: string
) => {
  await i18n.changeLanguage(languageCode);

  await AsyncStorage.setItem(
    "selectedLanguage",
    languageCode
  );
};

export const loadSavedLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem(
    "selectedLanguage"
  );

  if (
    savedLanguage &&
    supportedLanguages.includes(savedLanguage)
  ) {
    await i18n.changeLanguage(savedLanguage);
  }
};

export default i18n;