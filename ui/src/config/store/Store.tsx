import { onMount, ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";
import { ClientResponseError } from "pocketbase";

import { StoreContext, TStore } from "./context";
import { useAuthPB } from "../pocketbase";
import { EXERCISE_EXPAND } from "../../../constants";

const initialState: TStore = {
  exercises: {
    data: [],
    loading: false,
    loaded: false,
  },
};

export const Store: ParentComponent = (props) => {
  const [store, setStore] = createStore<TStore>(initialState);
  const { pb } = useAuthPB();

  const fetchAllExercises = async () => {
    if (store.exercises.loading || store.exercises.loaded) {
      return;
    }

    setStore("exercises", "loading", true);

    let page = 1;
    let total = -1;
    let fetched: ExercisesRecordExpand[] = [];

    try {
      while (total < 0 || fetched.length < total) {
        const listResult = await pb.collection<ExercisesRecordExpand>("exercises").getList(page, 500, {
          sort: "name",
          expand: EXERCISE_EXPAND,
        });

        fetched = [...fetched, ...listResult.items];
        total = listResult.totalItems;
        page = listResult.page + 1;
      }

      setStore("exercises", {
        data: fetched,
        loaded: true,
      });
    } catch (e) {
      if (e instanceof ClientResponseError && e.isAbort) {
      } else {
        console.error("get exercises error: ", e);
      }
    } finally {
      setStore("exercises", "loading", false);
    }
  };

  onMount(() => {
    fetchAllExercises();
  });

  return <StoreContext.Provider value={{ setStore, ...store }}>{props.children}</StoreContext.Provider>;
};
