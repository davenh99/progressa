import { Component, createEffect, createSignal, For, Show } from "solid-js";
import AuthEmail from "../components/AuthEmail";
import { usePB } from "../config/pocketbase";
import { createStore } from "solid-js/store";
import { AuthMethodsList } from "pocketbase";
import OAuthButton from "../components/OAuthButton";

const Auth: Component = () => {
  const [emailLogin, setEmailLogin] = createSignal(false);
  const [OAuthProviders, setOAuthProviders] = createStore([]);
  const { pb } = usePB();

  const getAuthMethods = async () => {
    const methods = await pb.collection("users").listAuthMethods();

    if (methods.oauth2.enabled) {
      setOAuthProviders(methods.oauth2.providers);
    }
  };

  createEffect(() => {
    getAuthMethods();
  });

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
          <For each={OAuthProviders}>
            {(provider) => <OAuthButton name={provider.name} displayName={provider.displayName} />}
          </For>
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
