import { Component } from "solid-js";
import { Portal } from "solid-js/web";
import { Toast } from "@kobalte/core/toast";

export const Toaster: Component = () => {
  return (
    <Portal>
      <Toast.Region>
        <Toast.List
          class={`z-99999 top-0 right-0 flex flex-col p-[var(--viewport-padding)] fixed gap-2 w-100
            max-w-[100vw] m-0 outline-none list-none`}
        />
      </Toast.Region>
    </Portal>
  );
};

export default Toaster;
