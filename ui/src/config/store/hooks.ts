import { useContext } from "solid-js";
import { StoreContext } from "./context";

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within the Store provider");
  }

  return context;
}
