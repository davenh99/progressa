import PocketBase from "pocketbase";
import { User } from "../../../Types";
import { createContext } from "solid-js";

type TPBContext = {
  pb: PocketBase;
  store: { user: User | null; loading: boolean; networkError: boolean };
  checkAuth: () => Promise<void>;
};

export const PBContext = createContext<TPBContext>();
