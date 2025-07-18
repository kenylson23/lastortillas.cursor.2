import { Switch, Route } from "wouter";
import { ToastProvider } from "./components/ui/toast";
import StaticHome from "./pages/StaticHome";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={StaticHome} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router />
    </ToastProvider>
  );
}

export default App;
