import { ParentComponent } from "solid-js";

import Container from "./Container";
import Header from "./Header";
import User from "lucide-solid/icons/user";
import { A } from "@solidjs/router";
import Footer from "./Footer";

export const SiteLayout: ParentComponent = (props) => {
  return (
    <div class="flex flex-col h-screen bg-charcoal-500 text-dark-slate-gray-900">
      <Header>
        <nav class="flex justify-between items-center">
          <A href="/">
            <p style={{ "font-family": "Audiowide" }} class="text-dark-slate-gray-800 text-xl">
              Progressa
            </p>
          </A>

          <A href="/auth" class="flex flex-col items-center">
            <User size={28} />
          </A>
        </nav>
      </Header>

      <main class="flex-1 flex flex-col overflow-y-auto">
        <Container class="flex flex-col items-center">{props.children}</Container>
      </main>

      <Footer class="text-xs">
        <p>version 0.1</p>
        <A class="underline" href="/">
          Privacy Policy
        </A>
        <A class="underline" href="https://github.com/davenh99/progressa">
          <i class="fa-brands fa-github"></i> Source Code
        </A>
        <p>© 2025 David Ham</p>
      </Footer>
    </div>
  );
};

export default SiteLayout;
