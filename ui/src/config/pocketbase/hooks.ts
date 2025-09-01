import { createEffect, useContext } from "solid-js";
import { PBContext } from "./context";
import { UserSession, UserSessionExercise } from "../../../Types";
import { ClientResponseError } from "pocketbase";
import { USER_SESSION_EXPAND } from "../constants";
import { sortUserSessionExercises } from "../../methods/sortUserSessionExercises";

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

  const OAuthSignIn = async (provider: string) => {
    const authData = await pb.collection("users").authWithOAuth2({
      provider,
      createData: { ...BaseSignUpData, name: "user" },
    });
    // after succesful auth we can update the user with a different username from the authData
    if (authData.meta?.name) {
      try {
        const formData = new FormData();

        if (authData.meta?.name) {
          formData.append("name", authData.meta.name);
        }

        await pb.collection("users").update(authData.record.id, formData);
      } catch (e: any) {
        alert(`${e}: ${e.originalError}`);
        alert("could not update name");
      }
    }
  };

  return { ...context, login, signUp, logout, OAuthSignIn };
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

  const getUserSessions = async () => {
    try {
      const userSessions = await pb.collection<UserSession>("userSessions").getFullList({
        filter: `user = '${user.id}'`,
        sort: "-userDay",
      });

      return userSessions;
    } catch (e) {
      throw new Error("get userSessions error", e);
    }
  };

  const updateRecord = async <T>(collectionName: string, recordID: string, field: string, newVal: any) => {
    const data = {};
    data[`${field}`] = newVal;

    try {
      const record = await pb
        .collection<T>(collectionName)
        .update(recordID, data, { requestKey: `${collectionName}.${recordID}.${field}` });
      return record as T;
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 0) {
      } else {
        throw e;
      }
    }
  };

  const userSessionToSortedExercises = (session: UserSession) => {
    const newSession = { ...session };
    newSession.expand.userSessionExercises_via_userSession = sortUserSessionExercises(
      newSession.expand.userSessionExercises_via_userSession ?? [],
      newSession.itemsOrder ?? []
    );
    return newSession;
  };

  const getSessionByID = async (id: string) => {
    try {
      return userSessionToSortedExercises(
        await pb.collection<UserSession>("userSessions").getOne(id, { expand: USER_SESSION_EXPAND })
      );
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 404) {
      } else {
        throw e;
      }
      return null;
    }
  };

  const getSessionByDate = async (date: string) => {
    try {
      return userSessionToSortedExercises(
        await pb.collection<UserSession>("userSessions").getFirstListItem(`userDay = '${date}'`, {
          expand: USER_SESSION_EXPAND,
        })
      );
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 404) {
      } else {
        throw e;
      }
      return null;
    }
  };

  return { pb, user, logout, getUserSessions, updateRecord, getSessionByID, getSessionByDate };
}
