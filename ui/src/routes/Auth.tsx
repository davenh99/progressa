import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { AuthProviderInfo } from "pocketbase";

import { usePB } from "../config/pocketbase";
import AuthEmail from "../views/auth/Email";
import OAuthButton from "../views/auth/OAuthButton";
import { Button } from "../components";
import Container from "../views/app/Container";
import Card from "../views/app/Card";

const Auth: Component = () => {
  const [emailLogin, setEmailLogin] = createSignal(false);
  const [OAuthProviders, setOAuthProviders] = createStore<AuthProviderInfo[]>([]);
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
    <Container class="bg-charcoal-500 w-screen h-screen flex flex-col items-center pt-[30vh]">
      <Card>
        <h1 style={{ "font-family": "Audiowide" }} class="mb-5">
          Progressa
        </h1>
        <Show
          when={!emailLogin()}
          fallback={
            <>
              <AuthEmail />
              <Button variant="text" onClick={() => setEmailLogin(false)}>
                <p>Sign in another way</p>
              </Button>
            </>
          }
        >
          <h2 class="mb-3">Sign in</h2>
          <For each={OAuthProviders}>
            {(provider) => <OAuthButton name={provider.name} displayName={provider.displayName} />}
          </For>
          <Button variantColor="neutral" onClick={() => setEmailLogin(true)}>
            Continue with Email
          </Button>
        </Show>
      </Card>
    </Container>
  );
};

export default Auth;
