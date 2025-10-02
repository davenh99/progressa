import { Component, createEffect, createSignal, Show } from "solid-js";
import Logout from "lucide-solid/icons/log-out";

import { useAuthPB } from "../config/pocketbase";
import { getAge } from "../methods/getAge";
import { Button, DataInput, DataNumberInput } from "../components";
import Container from "../views/app/Container";
import SectionHeader from "../views/app/SectionHeader";
import Blob from "../views/app/Blob";

const Profile: Component = () => {
  const { user, logout, updateRecord } = useAuthPB();
  const [height, setHeight] = createSignal(user.height);
  const [weight, setWeight] = createSignal(user.weight);
  const [dob, setDob] = createSignal(new Date(user.dob).toLocaleDateString("en-ca"));

  return (
    <>
      <SectionHeader>
        <h1 class="text-2xl font-bold">Profile</h1>
      </SectionHeader>
      <Container class="space-y-4">
        <Blob class="flex flex-col">
          <h2 class="text-xl font-semibold">{user.name}</h2>
          <div class="flex flex-col space-y-2 mt-2">
            <p>Email: {user.email}</p>
            <div class="flex flex-row space-x-1">
              <DataNumberInput
                label="Height:"
                containerClass="flex-1 justify-between"
                class="rounded-sm bg-charcoal-600 pr-0.5"
                width="3.5rem"
                value={height()}
                onValueChange={(v) => setHeight(Number(v))}
                saveFunc={(v) => updateRecord<any>("users", user.id, "height", v)}
              />
              <p class="w-4">cm</p>
            </div>
            <div class="flex flex-row space-x-1">
              <DataNumberInput
                label="Weight:"
                containerClass="flex-1 justify-between"
                class="rounded-sm bg-charcoal-600 pr-0.5"
                width="3.5rem"
                value={weight()}
                onValueChange={(v) => setWeight(Number(v))}
                saveFunc={(v) => updateRecord<any>("users", user.id, "weight", v)}
              />
              <p class="w-4">kg</p>
            </div>
            <div class="flex flex-row items-center space-x-1">
              <DataInput
                label="DOB:"
                type="date"
                containerClass="justify-between flex-1"
                class="flex-1 w-full"
                value={dob()}
                onValueChange={(v) => setDob(v as string)}
                saveFunc={(v) => updateRecord<any>("users", user.id, "dob", v)}
              />
              <Show when={!!user.dob}>
                <p>(Age {getAge(user.dob)})</p>
              </Show>
            </div>
          </div>
          <Button
            variantColor="bad"
            onClick={logout}
            class="self-end mt-5 flex flex-row items-center space-x-1"
          >
            <Logout size={16} />
            <p>log out</p>
          </Button>
        </Blob>
        {/* <Blob class="space-y-4">
          <h2>Settings</h2>
          <Switch label="Use RPE" />
          <Switch label="Use Device Dark Mode" />
          <Switch label="Dark mode on" />
        </Blob> */}
      </Container>
    </>
  );
};

export default Profile;
