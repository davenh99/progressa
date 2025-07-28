import { Component } from "solid-js";
import { useAuthPB } from "../config/pocketbase";
import { Link } from "@kobalte/core/link";

export const Header: Component = () => {
  const { user } = useAuthPB();

  return (
    <div class="py-[3rem] flex justify-center">
      <header class="w-[85vw] bg-primary-light rounded-md">
        <div class="flex flex-row mx-[2rem] my-[1rem] justify-between items-center">
          <div>
            <Link href="/">
              <h1 class="bg-text-primary-light">Workouter</h1>
            </Link>
          </div>
          <div>
            <Link href="/profile">
              <p>profile: {user.name}</p>
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
