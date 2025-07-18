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
    await pb.collection("users").create({
      ...BaseSignUpData,
      name: email.split("@")[0],
      email,
      password,
      passwordConfirm,
    });
    await login(email, password);
  };

  const logout = () => {
    pb.authStore.clear();
  };

  return { ...context, login, signUp, logout };
}

export function useAuthPB() {
  const {
    pb,
    store: { user },
    logout,
  } = usePB();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return { pb, user, logout };
}
