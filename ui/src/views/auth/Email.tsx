import { Component, createSignal, Show, JSX } from "solid-js";
import { usePB } from "../../config/pocketbase";

const AuthEmail: Component = () => {
  const [email, setEmail] = createSignal("");
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [passwordConfirm, setPasswordConfirm] = createSignal("");
  const [error, setError] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [isCreatingAccount, setIsCreatingAccount] = createSignal(false);
  const { login, signUp } = usePB();

  const handleSubmit: JSX.EventHandlerUnion<HTMLFormElement, SubmitEvent> = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email() || !password()) {
        throw new Error("Please fill in all fields");
      }

      if (isCreatingAccount() && password() !== passwordConfirm()) {
        throw new Error("Passwords don't match");
      }

      if (isCreatingAccount()) {
        await signUp(email(), username(), password(), passwordConfirm());
      } else {
        await login(username(), password());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsCreatingAccount(!isCreatingAccount());
    setError("");
    setPassword("");
    setPasswordConfirm("");
  };

  return (
    <div>
      <h2>{isCreatingAccount() ? "Create Account" : "Login"}</h2>

      <Show when={error()}>
        <div>{error()}</div>
      </Show>

      <form onSubmit={handleSubmit}>
        <Show when={isCreatingAccount()}>
          <div>
            <label for="username">username</label>
            <input
              type="text"
              id="username"
              value={username()}
              onInput={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </Show>

        <div>
          <label for="email">{isCreatingAccount() ? "email" : "email or username"}</label>
          <input type="email" id="email" value={email()} onInput={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label for="password">password</label>
          <input
            type="password"
            id="password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Show when={isCreatingAccount()}>
          <div>
            <label for="passwordConfirm">confirm password</label>
            <input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm()}
              onInput={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>
        </Show>

        <button type="submit" disabled={isLoading()}>
          {isLoading()
            ? isCreatingAccount()
              ? "Creating account..."
              : "Logging in..."
            : isCreatingAccount()
            ? "Create Account"
            : "Login"}
        </button>

        <div>
          <button type="button" onClick={toggleAuthMode}>
            {isCreatingAccount() ? "Already have an account? Login" : "Need to create an account?"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthEmail;
