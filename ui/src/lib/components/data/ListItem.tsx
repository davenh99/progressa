import { Component } from "solid-js";
import { useTheme } from "../../../config/theme";

export const ListItem: Component = () => {
  const { theme } = useTheme();

  return (
    <div>
      <header>
        <p>404 haha</p>
      </header>
    </div>
  );
};
