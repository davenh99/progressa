import { Component } from "solid-js";

import Sessions from "./Sessions";
import Header from "../views/Header";
import Container from "../views/Container";

const Home: Component = () => {
  return (
    <>
      <Header />
      <Container>
        <Sessions />
      </Container>
    </>
  );
};

export default Home;
