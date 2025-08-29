import { Component } from "solid-js";

import Sessions from "./Sessions";
import Header from "../views/Header";

const Home: Component = () => {
  return (
    <>
      <Header />
      <div class="container mx-auto p-4">
        <div class="bg-base-100 rounded-lg shadow p-6 mb-6">
          <h2>Home</h2>
        </div>

        <Sessions />
      </div>
    </>
  );
};

export default Home;
