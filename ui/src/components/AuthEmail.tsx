import { Component, createSignal, Show } from "solid-js";
import { usePB } from "../config/pocketbase";

const AuthEmail: Component = () => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [passwordConfirm, setPasswordConfirm] = createSignal("");
  const [error, setError] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [isCreatingAccount, setIsCreatingAccount] = createSignal(false);
  const { login, signUp } = usePB();

  const handleSubmit = async (e) => {
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
        await signUp(email(), password(), passwordConfirm());
      }
      await login(email(), password());
    } catch (err) {
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
    <div
      style={{
        "max-width": "400px",
        margin: "0 auto",
        padding: "20px",
        "border-radius": "8px",
        "box-shadow": "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ "text-align": "center" }}>{isCreatingAccount() ? "Create Account" : "Login"}</h2>

      <Show when={error()}>
        <div
          style={{
            color: "red",
            padding: "10px",
            margin: "10px 0",
            "border-radius": "4px",
            background: "#ffebee",
          }}
        >
          {error()}
        </div>
      </Show>

      <form onSubmit={handleSubmit}>
        <div style={{ "margin-bottom": "15px" }}>
          <label
            for="email"
            style={{
              display: "block",
              "margin-bottom": "5px",
              "font-weight": "bold",
            }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              "border-radius": "4px",
              "box-sizing": "border-box",
            }}
            required
          />
        </div>

        <div style={{ "margin-bottom": "15px" }}>
          <label
            for="password"
            style={{
              display: "block",
              "margin-bottom": "5px",
              "font-weight": "bold",
            }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              "border-radius": "4px",
              "box-sizing": "border-box",
            }}
            required
          />
        </div>

        <Show when={isCreatingAccount()}>
          <div style={{ "margin-bottom": "15px" }}>
            <label
              for="passwordConfirm"
              style={{
                display: "block",
                "margin-bottom": "5px",
                "font-weight": "bold",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm()}
              onInput={(e) => setPasswordConfirm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                "border-radius": "4px",
                "box-sizing": "border-box",
              }}
              required
            />
          </div>
        </Show>

        <button
          type="submit"
          disabled={isLoading()}
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            "border-radius": "4px",
            cursor: "pointer",
            "font-size": "16px",
            "margin-bottom": "15px",
          }}
        >
          {isLoading()
            ? isCreatingAccount()
              ? "Creating account..."
              : "Logging in..."
            : isCreatingAccount()
            ? "Create Account"
            : "Login"}
        </button>

        <div style={{ "text-align": "center" }}>
          <button
            type="button"
            onClick={toggleAuthMode}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              "text-decoration": "underline",
            }}
          >
            {isCreatingAccount() ? "Already have an account? Login" : "Need to create an account?"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthEmail;
