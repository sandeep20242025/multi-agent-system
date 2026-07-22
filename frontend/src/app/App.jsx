import AppRoutes from "@/app/routes";
import Providers from "@/app/providers";

function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}

export default App;