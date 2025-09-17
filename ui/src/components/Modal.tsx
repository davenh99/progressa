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
          class="bg-white rounded-xl shadow-lg p-6 w-full mx-3 sm:w-[50vw] lg:w-[35vw] max-h-[60vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {props.children}
          <div class="w-full flex justify-end">
            <Button onClick={() => props.setModalVisible(false)} class="mt-2">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
