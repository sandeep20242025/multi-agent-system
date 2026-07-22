import ThemeProvider from "@/context/ThemeProvider";
import LanguageProvider from "@/context/LanguageProvider";

function Providers({ children }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                {children}
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default Providers;