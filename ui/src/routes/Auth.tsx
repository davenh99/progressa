import { Component, createSignal, Show } from "solid-js";
import AuthEmail from "../components/AuthEmail";

const Auth: Component = () => {
  const [emailLogin, setEmailLogin] = createSignal(false);

  return (
    <Show
      when={!emailLogin()}
      fallback={
        <>
          <AuthEmail />
          <div onclick={() => setEmailLogin(false)}>
            <p>Sign in another way</p>
          </div>
        </>
      }
    >
      <div>
        <div>
          <h2>Sign in</h2>
          <div>
            <p>Continue with Google</p>
          </div>
          <div>
            <p>Continue with Facebook</p>
          </div>
          <div>
            <p>Continue with Instagram</p>
          </div>
          <div></div>
          <div onclick={() => setEmailLogin(true)}>
            <p>Continue with Email</p>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default Auth;
