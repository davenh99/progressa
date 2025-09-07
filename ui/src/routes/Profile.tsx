import { Component, createSignal, Show } from "solid-js";

import { useAuthPB } from "../config/pocketbase";
import { getAge } from "../methods/getAge";
import { DataInput } from "../components";
import Container from "../views/Container";

const Profile: Component = () => {
  const { user, logout, updateRecord } = useAuthPB();
  const [height, setHeight] = createSignal(user.height);
  const [weight, setWeight] = createSignal(user.weight);
  const [dob, setDob] = createSignal(user.dob);

  return (
    <>
      <Container>
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
                  value={height()}
                  onValueChange={(v) => setHeight(Number(v))}
                  type="number"
                  saveFunc={(v) => updateRecord<any>("users", user.id, "height", v)}
                />
                <p>cm</p>
              </div>
              <div class="flex flex-row">
                <DataInput
                  label="Weight"
                  value={weight()}
                  onValueChange={(v) => setWeight(Number(v))}
                  type="number"
                  saveFunc={(v) => updateRecord<any>("users", user.id, "weight", v)}
                />
                <p>kg</p>
              </div>
              <div class="flex flex-row">
                <DataInput
                  label="DOB"
                  type="date"
                  value={dob()}
                  onValueChange={(v) => setDob(v as string)}
                  saveFunc={(v) => updateRecord<any>("users", user.id, "dob", v)}
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
      </Container>
    </>
  );
};

export default Profile;
