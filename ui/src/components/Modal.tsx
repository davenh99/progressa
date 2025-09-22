import { ParentComponent } from "solid-js";
import { Portal } from "solid-js/web";

import { Button } from "./";

interface Props {
  setModalVisible: (v: boolean) => void;
}

export const Modal: ParentComponent<Props> = (props) => {
  return (
    <Portal>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/35"
        onClick={() => props.setModalVisible(false)}
      >
        <div
          class="bg-white rounded-xl shadow-lg p-4 md:p-6 w-full mx-3 sm:w-[50vw] lg:w-[35vw] max-h-[60vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div class="flex flex-col flex-1 overflow-y-hidden">{props.children}</div>
          <div class="w-full flex justify-end">
            <Button onClick={() => props.setModalVisible(false)} class="mt-3">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
