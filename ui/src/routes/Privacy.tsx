import { A } from "@solidjs/router";
import { Component } from "solid-js";

const Privacy: Component = () => {
  return (
    <div class="flex-1 overflow-y-auto text-dark-slate-gray-900 space-y-3 max-w-150">
      <div>
        <h1 class="text-dark-slate-gray-800 mb-2 text-2xl">Privacy policy</h1>
        <p>Effective Date: October 9, 2025</p>
        <p>Developer: David Ham</p>
        <p>Email: davenh99@gmail.com</p>
      </div>
      <div>
        <p>App: Progressa</p>
        <p>
          Website: <A href="https://progressa.davidham.dev">https://progressa.davidham.dev</A>
        </p>
      </div>
      <h2>Overview</h2>
      <p>
        Progressa is an open-source progressive web app (PWA) for tracking workouts and exercise progress.
        This policy explains how your data is stored and handled when you use Progressa.
      </p>
      <h2>Data Storage</h2>
      <p>
        When using <A href="https://progressa.davidham.dev">progressa.davidham.dev</A>:
      </p>
      <ul>
        <li>Your workout and account data are stored in a PocketBase database managed by David Ham.</li>
        <li>
          This data is not shared, sold, or used for analytics beyond what is required for app functionality.
        </li>
      </ul>
      <p>If you deploy your own instance of Progressa:</p>
      <ul>
        <li>You are in full control of your data storage and privacy.</li>
        <li>The developer (David Ham) does not have any access to your data.</li>
      </ul>
      <h2>Data Collected</h2>
      <p>Progressa only stores the information you provide, such as:</p>
      <ul>
        <li>Account credentials (if you register an account)</li>
        <li>Workout logs, exercises, and related notes</li>
      </ul>
      <p>
        No additional personal data (such as location, device info, or analytics) is collected automatically.
      </p>
      <h2>Open Source</h2>
      <p>
        Progressa is open source. You can inspect, modify, contribute to, or self-host the code to ensure your
        privacy preferences are met. <A href="https://github.com/davenh99/progressa">Source code here</A>
      </p>
      <h2>Contact</h2>
      <p>For questions or concerns about privacy, contact:</p>
      <p>
        📧 <a href="mailto:davenh99@gmail.com">davenh99@gmail.com</a>
      </p>
    </div>
  );
};

export default Privacy;
