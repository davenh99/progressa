import { Component } from "solid-js";
import Header from "../views/Header";
import { Link } from "@kobalte/core/link";

const NotFound: Component = () => {
  return (
    <div>
      <Header />
      <div>
        <p>You appear to be lost</p>
        <Link href="/">
          <p>take me back home</p>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
