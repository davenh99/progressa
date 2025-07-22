/* @refresh reload */
import { lazy, Show } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";

import "./index.css";
import { PBProvider, usePB } from "./config/pocketbase";
import Auth from "./routes/Auth";
import Session from "./routes/Session";
import Sessions from "./routes/Sessions";
import { ThemeProvider } from "./config/theme";

const Home = lazy(() => import("./routes/Home"));
const NotFound = lazy(() => import("./routes/NotFound"));

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
    <Show when={!store.loading} fallback={<p>loading</p>}>
      <Show when={!!store.user} fallback={<Auth />}>
        <Show when={!store.networkError} fallback={<p>Network Error, could not connect to server.</p>}>
          <Router>
            <Route path="/" component={Home} />
            <Route path="/auth" component={Auth} />
            <Route path="/workouts">
              <Route path="/" component={Sessions} />
              <Route path="/:id" component={Session} />
            </Route>
            <Route path="/*paramName" component={NotFound} />
          </Router>
        </Show>
      </Show>
    </Show>
  );
}
