import React, { Suspense, lazy, useContext } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { AuthContext } from "./context/Auth/AuthContext";
import Tickets from "./pages/Tickets/index.js";

// Lazy load existing pages to avoid heavy upfront imports
const LoginPage = lazy(() => import("./pages/Login/index.js"));
const SignupPage = lazy(() => import("./pages/Signup/index.js"));
const LandingPage = lazy(() => import("./pages/Landing/index.jsx"));

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { token } = useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={(props) => (token ? <Component {...props} /> : <Redirect to="/login" />)}
    />
  );
};

export default function AppRouter() {
  const { token } = useContext(AuthContext);
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>Cargando…</div>}>
        <Switch>
          {/* Ruta raíz: si autenticado ir a /tickets, si no mostrar Landing */}
          <Route
            exact
            path="/"
            render={() => (token ? <Redirect to="/tickets" /> : <LandingPage />)}
          />

          {/* Rutas existentes */}
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/signup" component={SignupPage} />

          {/* Rutas privadas */}
          <PrivateRoute exact path="/tickets" component={Tickets} />
          <PrivateRoute exact path="/tickets/:ticketId" component={Tickets} />

          {/* Fallback */}
          <Redirect to="/" />
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}
