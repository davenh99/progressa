import { Component } from "solid-js";

import { useAuthPB } from "../config/pocketbase";
import { getAge } from "../methods/getAge";
import Sessions from "./Sessions";

const Home: Component = () => {
  const { user, logout } = useAuthPB();

  return (
    <div class="container mx-auto p-4">
      <div class="bg-base-100 rounded-lg shadow p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">Home</h2>
        <div>
          <h4 class="text-xl font-semibold">Logged in as {user.name}</h4>
          <h5 class="text-lg font-medium mt-4">Stats</h5>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <p>Email: {user.email}</p>
            <p>Height: {user.height}</p>
            <p>Weight: {user.weight}</p>
            <p>Age: {user.dob ? getAge(user.dob) : "N/A"}</p>
          </div>
          <button onClick={logout} class="btn btn-error mt-4">
            Logout
          </button>
        </div>
      </div>

      <Sessions />
    </div>
  );
};

export default Home;
