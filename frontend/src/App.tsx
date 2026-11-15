import AppShell from "./components/Layout/AppShell";
import { ThemeProvider } from "./context/ThemeContext";
import { AssistantProvider } from "./context/AssistantContext";

function App() {
  return (
    <ThemeProvider>
      <AssistantProvider>
        <div className="os-backdrop" aria-hidden="true" />
        <AppShell />
      </AssistantProvider>
    </ThemeProvider>
  );
}

export default App;
