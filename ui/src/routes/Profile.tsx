import { Component, createSignal, Show } from "solid-js";
import Logout from "lucide-solid/icons/log-out";

import { useAuthPB } from "../config/pocketbase";
import { getAge } from "../methods/getAge";
import { Button, DataInput, DataNumberInput } from "../components";
import Container from "../views/Container";
import SectionHeader from "../views/SectionHeader";
import Blob from "../views/Blob";

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
      <Container class="space-y-4">
        <Blob class="flex flex-col">
          <h2 class="text-xl font-semibold">{user.name}</h2>
          <div class="flex flex-col space-y-2 mt-2">
            <p>Email: {user.email}</p>
            <div class="flex flex-row">
              <DataNumberInput
                label="Height:"
                value={height()}
                onValueChange={(v) => setHeight(Number(v))}
                saveFunc={(v) => updateRecord<any>("users", user.id, "height", v)}
              />
              <p>cm</p>
            </div>
            <div class="flex flex-row">
              <DataNumberInput
                label="Weight:"
                value={weight()}
                onValueChange={(v) => setWeight(Number(v))}
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
