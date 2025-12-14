import { createEffect, onCleanup } from "solid-js";

type Disposable = () => void;

export function createDisposableEffect(enabled: () => boolean, setup: () => Disposable | void) {
  createEffect(() => {
    if (!enabled()) return;

    const dispose = setup();
    if (typeof dispose === "function") {
      onCleanup(dispose);
    }
  });
}
