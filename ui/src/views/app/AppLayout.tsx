import { ParentComponent } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import Log from "lucide-solid/icons/pencil-line";
import Routine from "lucide-solid/icons/notebook-text";
import History from "lucide-solid/icons/history";
import User from "lucide-solid/icons/user";

export const AppLayout: ParentComponent = (props) => {
  const location = useLocation();

  const isLogActive = () => location.pathname.startsWith("/log");

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const linkClasses = (path: string) =>
    `flex flex-row space-x-2 mx-4 hover:text-gray-300 active:opacity-80 ${
      isActive(path) ? "text-cambridge-blue-700" : "text-dark-slate-gray-900"
    }`;

  const iconClasses = (path: string) =>
    `active:opacity-80 ${isActive(path) ? "text-cambridge-blue-700" : "text-white"}`;

  return (
    <div class="flex h-screen bg-charcoal-500 text-dark-slate-gray-900">
      {/* Sidebar (desktop global nav) */}
      <nav class="hidden sm:flex  flex-col items-start bg-charcoal-100/80 py-4 space-y-6">
        <A href="/" class={linkClasses("/")}>
          <History size={24} class={iconClasses("/")} />
          <p>History</p>
        </A>
        <A href="/routines" class={linkClasses("/routines")}>
          <Routine size={24} class={iconClasses("/routines")} />
          <p>Routines</p>
        </A>
        <A
          href="/log"
          class={linkClasses("/log")}
          onClick={(e) => {
            if (isLogActive()) {
              e.preventDefault();
            }
          }}
        >
          <Log size={24} class={iconClasses("/log")} />
          <p>Log</p>
        </A>
        <A href="/profile" class={linkClasses("/profile")}>
          <User size={24} class={iconClasses("/profile")} />
          <p>Profile</p>
        </A>
      </nav>

      {/* Main content */}
      <main class="flex-1 flex flex-col overflow-y-auto">{props.children}</main>

      {/* Bottom nav (mobile global nav) */}
      <nav
        class="sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2
         bg-charcoal-100/50 flex justify-between
         py-2.5 px-5 space-x-[7vw]  rounded-full backdrop-blur-xs"
      >
        <A href="/" class="flex flex-col items-center">
          <History size={30} class={iconClasses("/")} />
          <p class="text-xs">History</p>
        </A>
        <A href="/routines" class="flex flex-col items-center">
          <Routine size={30} />
          <p class="text-xs">Routines</p>
        </A>
        <A
          href="/log"
          class="flex flex-col items-center"
          onClick={(e) => {
            if (isLogActive()) {
              e.preventDefault();
            }
          }}
        >
          <Log size={30} class={iconClasses("/log")} />
          <p class="text-xs">Log</p>
        </A>
        <A href="/profile" class="flex flex-col items-center">
          <User size={30} class={iconClasses("/profile")} />
          <p class="text-xs">Profile</p>
        </A>
      </nav>
    </div>
  );
};

export default AppLayout;
