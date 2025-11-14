import { Component } from "solid-js";
import { A } from "@solidjs/router";

import Container from "../views/app/Container";
import SiteLayout from "../views/app/SiteLayout";

const NotFound: Component = () => {
  return (
    <SiteLayout>
      <Container>
        <h1 class="text-dark-slate-gray-800 mb-2 text-2xl">You appear to be lost</h1>
        <A href="/">
          <p class="underline">take me back home</p>
        </A>
      </Container>
    </SiteLayout>
  );
};

export default NotFound;
