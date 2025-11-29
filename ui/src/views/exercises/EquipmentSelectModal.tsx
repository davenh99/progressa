import { Component } from "solid-js";

import { Modal } from "../../components";
import { EquipmentList } from "./EquipmentList";

interface Props {
  setModalVisible: (v: boolean) => void;
  selectEquipment: (exercise: EquipmentsRecord) => Promise<void>;
}

export const EquipmentSelectModal: Component<Props> = (props) => {
  return (
    <Modal setModalVisible={props.setModalVisible} zIndexClass="z-70">
      <h2 class="pb-2">Select Equipment</h2>
      <EquipmentList
        onClick={(equipment: EquipmentsRecord) => {
          props.selectEquipment(equipment);
          props.setModalVisible(false);
        }}
      />
    </Modal>
  );
};

export default EquipmentSelectModal;
