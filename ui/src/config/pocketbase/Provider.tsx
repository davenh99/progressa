import { createEffect, createSignal, onCleanup, ParentComponent } from "solid-js";
import PocketBase, { ClientResponseError } from "pocketbase";
import { createStore } from "solid-js/store";

import { PBContext } from "./context";
import { User } from "../../../Types";

const apiUrl = import.meta.env.VITE_PUBLIC_API_URL
  ? import.meta.env.VITE_PUBLIC_API_URL
  : "https://localhost:8090";

export const PBProvider: ParentComponent = (props) => {
  const [pb] = createStore(new PocketBase(apiUrl));
  const [user, setUser] = createStore(pb.authStore.record as unknown as User | null);
  const [loading, setLoading] = createSignal(true);
  const [networkError, setNetworkError] = createSignal(false);

  const checkAuth = async () => {
    if (pb.authStore.token) {
      if (pb.authStore.isValid) {
        try {
          await pb.collection("users").authRefresh();
          setNetworkError(false);
        } catch (e) {
          if (e instanceof ClientResponseError && [401, 403].includes(e.status)) {
            pb.authStore.clear();
          } else {
            setNetworkError(true);
          }
        }
      } else {
        pb.authStore.clear();
      }
    }
  };

  createEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.record as unknown as User | null);
    });

    checkAuth().then(() => {
      setLoading(false);
    });

    onCleanup(unsubscribe);
  });

  createEffect(() => {
    if (!pb.authStore.record?.id) return;

    const unsubscribe = pb.collection("users").subscribe(pb.authStore.record.id, (e) => {
      if (e.action == "delete") {
        pb.authStore.clear();
      } else {
        pb.authStore.save(pb.authStore.token, e.record);
      }
    });

    onCleanup(() => {
      unsubscribe.then((unsubscribeFunc) => unsubscribeFunc());
    });
  });

  createEffect(() => {
    console.log(loading());
  });

  const value = {
    pb,
    user,
    get loading() {
      return loading();
    },
    get networkError() {
      return networkError();
    },
    checkAuth,
  };

  return <PBContext.Provider value={value}>{props.children}</PBContext.Provider>;
};
