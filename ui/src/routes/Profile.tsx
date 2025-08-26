import { Component, Show } from "solid-js";

import { useAuthPB } from "../config/pocketbase";
import { getAge } from "../methods/getAge";
import Header from "../components/Header";
import { DataInput } from "../components";

const Profile: Component = () => {
  const { user, logout, updateRecord } = useAuthPB();

  return (
    <>
      <Header />
      <div class="container mx-auto p-4">
        <div class="bg-base-100 rounded-lg shadow p-6 mb-6">
          <h2 class="text-2xl font-bold mb-4">Profile</h2>
          <div>
            <h4 class="text-xl font-semibold">Logged in as {user.name}</h4>
            <h5 class="text-lg font-medium mt-4">Stats</h5>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <p>Email: {user.email}</p>
              <div class="flex flex-row">
                <DataInput
                  label="Height"
                  initial={user.height}
                  type="number"
                  saveFunc={(v) => updateRecord<any>("users", user.id, v, "height")}
                />
              </div>
              <div class="flex flex-row">
                <DataInput
                  label="Weight"
                  initial={user.weight}
                  type="number"
                  saveFunc={(v) => updateRecord<any>("users", user.id, v, "weight")}
                />
              </div>
              <div class="flex flex-row">
                <DataInput
                  label="DOB"
                  type="date"
                  initial={user.dob}
                  saveFunc={(v) => updateRecord<any>("users", user.id, v, "dob")}
                />
                <Show when={!!user.dob}>
                  <p>(Age {getAge(user.dob)})</p>
                </Show>
              </div>
            </div>
            <button onClick={logout} class="btn btn-error mt-4">
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
