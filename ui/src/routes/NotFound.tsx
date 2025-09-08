import { Component } from "solid-js";
import { A } from "@solidjs/router";

import Container from "../views/Container";

const NotFound: Component = () => {
  return (
    <div>
      <Container>
        <p>You appear to be lost</p>
        <A href="/">
          <p>take me back home</p>
        </A>
      </Container>
    </div>
  );
};

export default NotFound;
