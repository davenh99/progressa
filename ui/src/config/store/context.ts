import { createContext } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

export type TStore = {
  exercises: {
    data: ExercisesRecord[];
    loading: boolean;
    loaded: boolean;
  };
};

export type TStoreContext = TStore & {
  setStore: SetStoreFunction<TStore>;
};

export const StoreContext = createContext<TStoreContext>();
