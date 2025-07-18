/* @refresh reload */
import { createEffect, lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";

import "./index.css";
import { PBProvider, usePB } from "./config/pocketbase";
import Auth from "./routes/Auth";

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
      <Content />
    </PBProvider>
  ),
  root!
);

function Content() {
  const { user, loading, networkError } = usePB();

  // TODO subscribe: window.addeventlistener('online' & 'offline')
  // and run checkAuth() if offline periodically?

  createEffect(() => {
    console.log("huzzah", loading);
  });

  if (loading) {
    return <p>loading: {loading ? "yes" : "no"}</p>;
  }

  if (!user) {
    return <Auth />;
  }

  if (networkError) {
    return <p>Network Error, check connection.</p>;
  }

  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/*paramName" component={NotFound} />
    </Router>
  );
}
