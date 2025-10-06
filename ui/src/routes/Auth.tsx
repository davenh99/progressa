import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { AuthProviderInfo } from "pocketbase";

import { usePB } from "../config/pocketbase";
import AuthEmail from "../views/auth/AuthEmail";
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
    <Container class="bg-charcoal-500 w-screen h-screen flex flex-col items-center justify-center">
      <Card class="w-[90vw] max-w-80 flex flex-col items-center pb-5">
        <h1 style={{ "font-family": "Audiowide" }} class="mb-3 text-dark-slate-gray-800">
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
          <h2 class="mb-6">Sign in</h2>
          <For each={OAuthProviders}>
            {(provider) => <OAuthButton name={provider.name} displayName={provider.displayName} />}
          </For>
          <Button class="w-[95%]" variantColor="neutral" onClick={() => setEmailLogin(true)}>
            Continue with Email
          </Button>
        </Show>
      </Card>
    </Container>
  );
};

export default Auth;
