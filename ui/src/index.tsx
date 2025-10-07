/* @refresh reload */
import { lazy, Show } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";

import "./index.css";
import { PBProvider, usePB } from "./config/pocketbase";
import { ThemeProvider } from "./config/theme";
import AppLayout from "./views/app/AppLayout";
import LoadFullScreen from "./views/app/LoadFullScreen";
import SiteLayout from "./views/app/SiteLayout";
import Landing from "./routes/Landing";

const NotFound = lazy(() => import("./routes/NotFound"));
const Auth = lazy(() => import("./routes/Auth"));
const LogSession = lazy(() => import("./routes/LogSession"));
const Sessions = lazy(() => import("./routes/Sessions"));
const Profile = lazy(() => import("./routes/Profile"));

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(
  () => (
    <PBProvider>
      <ThemeProvider>
        <Content />
      </ThemeProvider>
    </PBProvider>
  ),
  root!
);

function Content() {
  const { store } = usePB();

  // TODO subscribe: window.addeventlistener('online' & 'offline')
  // and run checkAuth() if offline periodically?

  return (
    <Show when={!store.loading} fallback={<LoadFullScreen />}>
      <Show when={!store.networkError} fallback={<p>Network Error, could not connect to server.</p>}>
        <Router>
          <Show when={!!store.user} fallback={<Site />}>
            <App />
          </Show>
          <Route path="/*paramName" component={NotFound} />
        </Router>
      </Show>
    </Show>
  );
}

function App() {
  return (
    <Route path="/" component={AppLayout}>
      <Route path="/" component={Profile} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/profile" component={Profile} />
      <Route path="/log" component={LogSession} />
    </Route>
  );
}

function Site() {
  return (
    <Route path="/" component={SiteLayout}>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
    </Route>
  );
}
