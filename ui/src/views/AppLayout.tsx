import { ParentComponent } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import Home from "lucide-solid/icons/home";
import ClipboardList from "lucide-solid/icons/clipboard-list";
import User from "lucide-solid/icons/user";

export const AppLayout: ParentComponent = (props) => {
  const location = useLocation();

  const isLogActive = () => location.pathname.startsWith("/log");

  return (
    <div class="flex h-screen">
      {/* Sidebar (desktop global nav) */}
      <nav class="hidden sm:flex  flex-col items-start bg-gray-900 text-white py-4 space-y-6">
        <A href="/" class="hover:text-gray-300 flex flex-row space-x-2 mx-4">
          <Home size={24} />
          <p>History</p>
        </A>
        <A
          href="/log"
          class="hover:text-gray-300 flex flex-row space-x-2 mx-4"
          onClick={(e) => {
            if (isLogActive()) {
              e.preventDefault();
            }
          }}
        >
          <ClipboardList size={24} />
          <p>Log</p>
        </A>
        <A href="/profile" class="hover:text-gray-300 flex flex-row space-x-2 mx-4">
          <User size={24} />
          <p>Profile</p>
        </A>
      </nav>

      {/* Main content */}
      <main class="flex-1 overflow-y-auto bg-gray-100">{props.children}</main>

      {/* Bottom nav (mobile global nav) */}
      <nav class="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex justify-around py-4 border-t border-gray-800">
        <A href="/" class="flex flex-col items-center">
          <Home size={30} />
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
          <ClipboardList size={30} />
        </A>
        <A href="/profile" class="flex flex-col items-center">
          <User size={30} />
        </A>
      </nav>
    </div>
  );
};

export default AppLayout;
