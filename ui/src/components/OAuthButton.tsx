import { Component } from "solid-js";
import { usePB } from "../config/pocketbase";

interface Props {
  name: string;
  displayName: string;
}

const OAuthButton: Component<Props> = (props) => {
  const { OAuthSignIn } = usePB();

  return (
    <div
      onClick={() => {
        OAuthSignIn(props.name);
      }}
    >
      <p>Continue with {props.displayName}</p>
    </div>
  );
};

export default OAuthButton;
