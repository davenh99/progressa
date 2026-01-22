import { createEffect, onCleanup, ParentComponent } from "solid-js";
import PocketBase, { ClientResponseError } from "pocketbase";
import { createStore } from "solid-js/store";

import { PBContext } from "./context";
import { Collections, TypedPocketBase } from "../../../pocketbase";

const apiUrl =
  import.meta.env.VITE_PUBLIC_API_URL ||
  (window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? "http://127.0.0.1:8090"
    : window.location.origin);

export const PBProvider: ParentComponent = (props) => {
  const pb = new PocketBase(apiUrl) as TypedPocketBase;
  const [pbStore, setPBStore] = createStore({
    user: pb.authStore.record as UsersRecord | null,
    loading: true,
    networkError: false,
  });

  pb.authStore.onChange(() => {
    setPBStore("user", pb.authStore.record as UsersRecord | null);
  });

  const checkAuth = async () => {
    if (pb.authStore.token) {
      if (pb.authStore.isValid) {
        try {
          await pb.collection(Collections.Users).authRefresh();
          setPBStore("networkError", false);
        } catch (e) {
          if (e instanceof ClientResponseError && [401, 403].includes(e.status)) {
            pb.authStore.clear();
          } else {
            setPBStore("networkError", true);
          }
        }
      } else {
        pb.authStore.clear();
      }
    } else {
      setPBStore("user", null);
    }
  };

  checkAuth().then(() => {
    setPBStore("loading", false);
  });

  createEffect(() => {
    if (!pb.authStore.record?.id) return;

    const unsubscribe = pb.collection(Collections.Users).subscribe(pb.authStore.record.id, (e) => {
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

  return <PBContext.Provider value={{ pb, store: pbStore, checkAuth }}>{props.children}</PBContext.Provider>;
};
