import { Component } from "solid-js";
import { A } from "@solidjs/router";

import { useAuthPB } from "../config/pocketbase";

export const Header: Component = () => {
  const { user } = useAuthPB();

  return (
    <div class="py-[3rem] flex justify-center">
      <header class="w-[85vw] bg-primary-light rounded-md">
        <div class="flex flex-row mx-[2rem] my-[1rem] justify-between items-center">
          <div>
            <A href="/">
              <h1 class="bg-text-primary-light">Workouter</h1>
            </A>
          </div>
          <div>
            <A href="/profile">
              <p>profile: {user.name}</p>
            </A>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
