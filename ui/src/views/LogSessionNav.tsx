import { ParentComponent } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import Dumbbell from "lucide-solid/icons/dumbbell";
import Utensils from "lucide-solid/icons/utensils";
import Settings from "lucide-solid/icons/settings";

export const LogSessionNav: ParentComponent = (props) => {
  return (
    <>
      {/* mobile */}
      <Tabs.List class="sm:hidden flex justify-around border-b bg-white py-2">
        <Tabs.Trigger value="exercises" class="p-2 hover:bg-ash-gray-600">
          <Dumbbell size={20} />
        </Tabs.Trigger>
        <Tabs.Trigger value="meals-sleep" class="p-2 hover:bg-ash-gray-600">
          <Utensils size={20} />
        </Tabs.Trigger>
        <Tabs.Trigger value="settings" class="p-2 hover:bg-ash-gray-600">
          <Settings size={20} />
        </Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>

      {/* desktop */}
      <Tabs.List class="hidden sm:flex border-b bg-white px-4 space-x-6">
        <Tabs.Trigger value="exercises" class="p-2 hover:bg-ash-gray-600">
          <Dumbbell size={20} />
          <p>Exercises</p>
        </Tabs.Trigger>
        <Tabs.Trigger value="meals-sleep" class="p-2 hover:bg-ash-gray-600">
          <Utensils size={20} />
          <p>Meals</p>
        </Tabs.Trigger>
        <Tabs.Trigger value="settings" class="p-2 hover:bg-ash-gray-600">
          <Settings size={20} />
          <p>Settings</p>
        </Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
    </>
  );
};

export default LogSessionNav;
