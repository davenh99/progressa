import { Component } from "solid-js";
import { Select as KobalteSelect } from "@kobalte/core/select";
import Check from "lucide-solid/icons/check";
import UpDown from "lucide-solid/icons/chevrons-up-down";
import { MeasurementValue } from "../../Types";

interface Props {
  values: MeasurementValue[];
  value: MeasurementValue | null;
  onChange: (v: MeasurementValue | null) => void;
  placeholder?: string;
}

export const Select: Component<Props> = (props) => {
  return (
    <KobalteSelect
      multiple={false}
      value={props.value}
      optionValue="id"
      optionTextValue="value"
      onChange={props.onChange}
      options={props.values}
      placeholder={props.placeholder}
      itemComponent={(props) => (
        <KobalteSelect.Item item={props.item}>
          <KobalteSelect.ItemLabel>{props.item.textValue}</KobalteSelect.ItemLabel>
          <KobalteSelect.ItemIndicator>
            <Check />
          </KobalteSelect.ItemIndicator>
        </KobalteSelect.Item>
      )}
    >
      <KobalteSelect.Trigger>
        <KobalteSelect.Value<MeasurementValue>>{(state) => state.selectedOption().value}</KobalteSelect.Value>
        <KobalteSelect.Icon>
          <UpDown />
        </KobalteSelect.Icon>
      </KobalteSelect.Trigger>
      <KobalteSelect.Portal>
        <KobalteSelect.Content>
          <KobalteSelect.Listbox />
        </KobalteSelect.Content>
      </KobalteSelect.Portal>
    </KobalteSelect>
  );
};

interface DataProps {
  values: MeasurementValue[];
  value: MeasurementValue | null;
  onValueChange: (v: MeasurementValue | null) => void;
  saveFunc: (id: string) => Promise<void>;
}

export const DataSelect: Component<DataProps> = (props) => {
  return (
    <Select
      value={props.value}
      values={props.values}
      onChange={(v) => props.saveFunc(v?.id || "").then(() => props.onValueChange(v))}
    />
  );
};

export default Select;
