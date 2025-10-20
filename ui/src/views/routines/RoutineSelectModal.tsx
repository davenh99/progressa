import { Component } from "solid-js";

import { Routine } from "../../../Types";
import { Modal } from "../../components";
import { RoutineList } from "./RoutineList";

interface Props {
  setModalVisible: (v: boolean) => void;
  addRoutine: (routine: Routine) => Promise<void>;
}

export const RoutineSelectModal: Component<Props> = (props) => {
  return (
    <Modal setModalVisible={props.setModalVisible}>
      <h2 class="pb-2">Select Routine</h2>
      <RoutineList onClick={props.addRoutine} />
    </Modal>
  );
};

export default RoutineSelectModal;
