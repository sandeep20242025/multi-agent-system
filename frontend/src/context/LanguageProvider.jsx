import { useEffect, useMemo, useState } from "react";

import LanguageContext from "./LanguageContext";

import storage from "@/lib/storage";

import {
    DEFAULT_LANGUAGE,
    LANGUAGE_STORAGE_KEY,
} from "@/config/language.config";

function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(
        storage.get(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE
    );

    useEffect(() => {
        storage.set(LANGUAGE_STORAGE_KEY, language);
    }, [language]);

    const value = useMemo(
        () => ({
            language,
            setLanguage,
        }),
        [language]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export default LanguageProvider;