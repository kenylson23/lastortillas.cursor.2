import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Kitchen from "./pages/Kitchen";
import OrderTracking from "./pages/OrderTracking";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/cozinha" component={Kitchen} />
      <Route path="/rastreamento" component={OrderTracking} />
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
