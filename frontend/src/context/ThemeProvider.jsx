import { useEffect, useMemo, useState } from "react";

import ThemeContext from "./ThemeContext";

import storage from "@/lib/storage";
import THEMES from "@/constants/theme";

import {
    DEFAULT_THEME,
    STORAGE_KEY,
} from "@/config/theme.config";

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        storage.get(STORAGE_KEY) || DEFAULT_THEME
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);

        storage.set(STORAGE_KEY, theme);
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            themes: THEMES,
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;