import { Accessor, createSignal, ParentComponent } from "solid-js";
import { Select as KobalteSelect } from "@kobalte/core/select";
import Check from "lucide-solid/icons/check";
import UpDown from "lucide-solid/icons/chevrons-up-down";
import { MeasurementValue } from "../../Types";

interface Props {
  values: MeasurementValue[];
  value: Accessor<MeasurementValue | null>;
  onChange: (v: MeasurementValue | null) => void;
  placeholder?: string;
}

export const Select: ParentComponent<Props> = (props) => {
  return (
    <KobalteSelect
      multiple={false}
      value={props.value()}
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
  initial?: MeasurementValue;
  saveFunc: (id: string) => Promise<void>;
}

export const DataSelect: ParentComponent<DataProps> = (props) => {
  const [val, setVal] = createSignal<MeasurementValue | null>(props.initial ?? null);

  return (
    <Select
      value={val}
      values={props.values}
      onChange={(v) => props.saveFunc(v?.id || "").then(() => setVal(v))}
    />
  );
};

export default Select;
