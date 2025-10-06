import { Component } from "solid-js";
import { usePB } from "../../config/pocketbase";
import { Button } from "../../components";

interface Props {
  name: string;
  displayName: string;
}

const OAuthButton: Component<Props> = (props) => {
  const { OAuthSignIn } = usePB();

  return (
    <Button
      onClick={() => {
        OAuthSignIn(props.name);
      }}
    >
      <p>Continue with {props.displayName}</p>
    </Button>
  );
};

export default OAuthButton;
