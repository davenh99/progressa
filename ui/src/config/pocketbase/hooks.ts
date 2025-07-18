import { createEffect, useContext } from "solid-js";
import { PBContext } from "./context";

const BaseSignUpData = {
  dob: "",
  height: 0,
  weight: 0,
};

export function usePB() {
  const context = useContext(PBContext);
  if (!context) {
    throw new Error("usePB must be used within PBProvider");
  }
  const { pb } = context;

  const login = async (email: string, password: string) => {
    await pb.collection("users").authWithPassword(email, password);
  };

  const signUp = async (email: string, password: string, passwordConfirm: string) => {
    const data = {
      ...BaseSignUpData,
      password: password,
      passwordConfirm: passwordConfirm,
      name: email.split("@")[0],
      email: email,
    };
    await pb.collection("users").create(data);
    await login(email, password);
  };

  const logout = () => {
    pb.authStore.clear();
  };

  createEffect(() => {
    console.log(context.store.loading);
  });

  return { ...context, login, signUp, logout };
}

export function useAuthPB() {
  const {
    pb,
    store: { user },
  } = usePB();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return { pb, user };
}
