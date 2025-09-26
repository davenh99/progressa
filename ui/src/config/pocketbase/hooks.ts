import { useContext } from "solid-js";
import { PBContext } from "./context";
import { Session } from "../../../Types";
import { ClientResponseError } from "pocketbase";
import { SESSION_EXPAND } from "../constants";
import { sortSessionExercises } from "../../methods/sessionExercise";
import { sortMeals } from "../../methods/sessionMeal";

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

  const login = async (usernameOrEmail: string, password: string) => {
    await pb.collection("users").authWithPassword(usernameOrEmail, password);
  };

  const signUp = async (email: string, name: string, password: string, passwordConfirm: string) => {
    await pb.collection("users").create({ ...BaseSignUpData, name, email, password, passwordConfirm });
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

  const getSessions = async () => {
    try {
      const sessions = await pb.collection<Session>("sessions").getFullList({
        filter: `user = '${user.id}'`,
        sort: "-userDay",
      });

      return sessions;
    } catch (e: any) {
      throw new Error("get sessions error", e);
    }
  };

  const updateRecord = async <T>(collectionName: string, recordID: string, field: string, newVal: any) => {
    const data: any = {};
    data[`${field}`] = newVal;

    try {
      const record = await pb
        .collection<T>(collectionName)
        .update(recordID, data, { requestKey: `${collectionName}.${recordID}.${field}` });
      return record as T;
    } catch (e) {
      if (e instanceof ClientResponseError && e.isAbort) {
      } else {
        throw e;
      }
    }
  };

  const sessionToSortedExercisesAndMeals = (session: Session) => {
    const newSession = { ...session };
    if (newSession.expand?.sessionExercises_via_session) {
      newSession.expand.sessionExercises_via_session = sortSessionExercises(
        newSession.expand.sessionExercises_via_session ?? [],
        newSession.exercisesOrder ?? []
      );
    }
    if (newSession.expand?.sessionMeals_via_session) {
      newSession.expand.sessionMeals_via_session = sortMeals(
        newSession.expand.sessionMeals_via_session ?? [],
        newSession.mealsOrder ?? []
      );
    }
    return newSession;
  };

  const getSessionByDate = async (date: string): Promise<Session | null> => {
    try {
      return sessionToSortedExercisesAndMeals(
        await pb.collection<Session>("sessions").getFirstListItem(`userDay = '${date}'`, {
          expand: SESSION_EXPAND,
        })
      );
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 404) {
        return null;
      } else {
        throw e;
      }
    }
  };

  const getSessionByID = async (id: string): Promise<Session | null> => {
    try {
      return sessionToSortedExercisesAndMeals(
        await pb.collection<Session>("sessions").getOne(id, {
          expand: SESSION_EXPAND,
        })
      );
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 404) {
        return null;
      } else {
        throw e;
      }
    }
  };

  return { pb, user, logout, getSessions, updateRecord, getSessionByDate, getSessionByID };
}
