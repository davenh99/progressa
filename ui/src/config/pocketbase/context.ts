import PocketBase from "pocketbase";
import { createContext } from "solid-js";

type TPBContext = {
  pb: PocketBase;
  store: { user: UsersRecord | null; loading: boolean; networkError: boolean };
  checkAuth: () => Promise<void>;
};

export const PBContext = createContext<TPBContext>();
