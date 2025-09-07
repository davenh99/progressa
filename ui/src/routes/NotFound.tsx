import { Component } from "solid-js";
import { Link } from "@kobalte/core/link";
import Container from "../views/Container";

const NotFound: Component = () => {
  return (
    <div>
      <Container>
        <p>You appear to be lost</p>
        <Link href="/">
          <p>take me back home</p>
        </Link>
      </Container>
    </div>
  );
};

export default NotFound;
