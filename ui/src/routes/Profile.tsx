import { Component, createSignal, Show } from "solid-js";

import { useAuthPB } from "../config/pocketbase";
import { getAge } from "../methods/getAge";
import { Button, DataInput } from "../components";
import Container from "../views/Container";
import SectionHeader from "../views/SectionHeader";

const Profile: Component = () => {
  const { user, logout, updateRecord } = useAuthPB();
  const [height, setHeight] = createSignal(user.height);
  const [weight, setWeight] = createSignal(user.weight);
  const [dob, setDob] = createSignal(user.dob);

  return (
    <>
      <SectionHeader>
        <h1 class="text-2xl font-bold">Profile</h1>
      </SectionHeader>
      <Container>
        <div class="flex flex-col">
          <h2 class="text-xl font-semibold">{user.name}</h2>
          <div class="flex flex-col space-y-2 mt-2">
            <p>Email: {user.email}</p>
            <div class="flex flex-row">
              <DataInput
                label="Height:"
                value={height()}
                onValueChange={(v) => setHeight(Number(v))}
                type="number"
                saveFunc={(v) => updateRecord<any>("users", user.id, "height", v)}
              />
              <p>cm</p>
            </div>
            <div class="flex flex-row">
              <DataInput
                label="Weight:"
                value={weight()}
                onValueChange={(v) => setWeight(Number(v))}
                type="number"
                saveFunc={(v) => updateRecord<any>("users", user.id, "weight", v)}
              />
              <p>kg</p>
            </div>
            <div class="flex flex-row">
              <DataInput
                label="DOB:"
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
          <Button onClick={logout} class="self-end mt-5 bg-red-200">
            log out
          </Button>
        </div>
      </Container>
    </>
  );
};

export default Profile;
