import { Component, createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Logout from "lucide-solid/icons/log-out";

import { useAuthPB } from "../config/pocketbase";
import { getAge } from "../methods/getAge";
import { Button, DataDateInput, DataNumberInput } from "../components";
import Container from "../views/app/Container";
import Header from "../views/app/Header";
import Card from "../views/app/Card";

const Profile: Component = () => {
  const { user, logout, updateRecord } = useAuthPB();
  const [height, setHeight] = createSignal(user.height);
  const [weight, setWeight] = createSignal(user.weight);
  const [dob, setDob] = createSignal(new Date(user.dob).toLocaleDateString("en-ca"));
  const navigate = useNavigate();

  return (
    <>
      <Header>
        <h1 class="text-xl font-bold">Profile</h1>
      </Header>
      <Container class="space-y-4">
        <Card class="flex flex-col">
          <div class="flex flex-row items-center space-x-2">
            <h2 class="text-xl font-semibold">{user.name}</h2>
            <Show when={!!user.dob}>
              <p>({getAge(user.dob)} years old)</p>
            </Show>
          </div>
          <div class="flex flex-col space-y-2 mt-3">
            <p>Email: {user.email}</p>
            <div class="flex flex-row space-x-1">
              <DataNumberInput
                label="Height:"
                class="flex-1 justify-between"
                width="3.5rem"
                rawValue={height()}
                onRawValueChange={setHeight}
                saveFunc={(v) => updateRecord<any>("users", user.id, "height", v)}
                inputProps={{
                  class: "rounded-sm bg-charcoal-600 pr-0.5 text-right",
                }}
              />
              <p class="w-4">cm</p>
            </div>
            <div class="flex flex-row space-x-1">
              <DataNumberInput
                label="Weight:"
                class="flex-1 justify-between"
                width="3.5rem"
                rawValue={weight()}
                onRawValueChange={setWeight}
                saveFunc={(v) => updateRecord<any>("users", user.id, "weight", v)}
                inputProps={{
                  class: "rounded-sm bg-charcoal-600 pr-0.5 text-right",
                }}
              />
              <p class="w-4">kg</p>
            </div>
            <div class="flex flex-row items-center space-x-1">
              <DataDateInput
                label="DOB:"
                containerClass="justify-between flex-1 items-center"
                onChange={setDob}
                saveFunc={(v) => updateRecord<any>("users", user.id, "dob", v)}
                inputProps={{
                  type: "date",
                  value: dob(),
                  onInput: (e) => setDob(e.currentTarget.value),
                }}
              />
            </div>
          </div>
          <Button
            variantColor="bad"
            onClick={() => {
              logout();
              navigate("/");
            }}
            class="self-end mt-5 flex flex-row items-center space-x-1"
          >
            <Logout size={16} />
            <p>log out</p>
          </Button>
        </Card>
        {/* <Card class="space-y-4">
          <h2>Settings</h2>
          <Switch label="Use RPE" />
          <Switch label="Use Device Dark Mode" />
          <Switch label="Dark mode on" />
        </Card> */}
      </Container>
    </>
  );
};

export default Profile;
