import { Accessor, Component, For, Setter } from "solid-js";
import { SegmentedControl as KSegmentedControl } from "@kobalte/core/segmented-control";

interface Props {
  options: string[];
  value: Accessor<string | undefined>;
  onChange: Setter<string>;
}

export const SegmentedControl: Component<Props> = (props) => {
  return (
    <KSegmentedControl class="flex flex-col gap-0.5 my-2" value={props.value()} onChange={props.onChange}>
      <div role="presentation" class="bg-charcoal-600 rounded-sm m-0 p-0 relative w-fit">
        <KSegmentedControl.Indicator
          class={`bg-charcoal-700 rounded-sm opacity-40 absolute transition-segmented-control-indicator
              border-1`}
        />
        <div role="presentation" class="inline-flex list-none">
          <For each={props.options}>
            {(option) => (
              <KSegmentedControl.Item value={option} class="relative flex justify-center px-3 py-1">
                <KSegmentedControl.ItemInput class="" />
                <KSegmentedControl.ItemLabel class="">{option}</KSegmentedControl.ItemLabel>
              </KSegmentedControl.Item>
            )}
          </For>
        </div>
      </div>
    </KSegmentedControl>
  );
};

export default SegmentedControl;
