import { Switch, Route } from "wouter";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={Home} />
      <Route path="/login" component={Home} />
      <Route path="/admin" component={Home} />
      <Route path="/cozinha" component={Home} />
      <Route path="/rastreamento" component={Home} />
      <Route component={Home} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router />
    </div>
  );
}

export default App;
