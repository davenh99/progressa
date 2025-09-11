import { Component, ParentComponent } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import Dumbbell from "lucide-solid/icons/dumbbell";
import Utensils from "lucide-solid/icons/utensils";
import Settings from "lucide-solid/icons/settings";

export const LogSessionNav: Component = () => {
  return (
    <div class="sm:px-[15vw] px-4 border-b">
      <Tabs.List class="relative flex justify-between">
        <TabTrigger value="exercises" label="Exercises">
          <Dumbbell size={30} />
        </TabTrigger>
        <TabTrigger value="meals-sleep" label="Meals">
          <Utensils size={30} />
        </TabTrigger>
        <TabTrigger value="settings" label="Settings">
          <Settings size={30} />
        </TabTrigger>
        <Tabs.Indicator class="absolute bottom-0 h-0.5 bg-ash-gray-200 transition-all duration-250" />
      </Tabs.List>
    </div>
  );
};

export default LogSessionNav;

interface TabTriggerProps {
  label: string;
  value: string;
}

const TabTrigger: ParentComponent<TabTriggerProps> = (props) => {
  return (
    <Tabs.Trigger value={props.value} class={`flex flex-col items-center px-2 py-4 w-20 cursor-pointer`}>
      {props.children}
      <p class="hidden sm:flex">{props.label}</p>
    </Tabs.Trigger>
  );
};
