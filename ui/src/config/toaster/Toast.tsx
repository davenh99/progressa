import { Component, splitProps } from "solid-js";
import { Toast as KToast, ToastRootProps } from "@kobalte/core/toast";
import X from "lucide-solid/icons/x";

interface Props extends ToastRootProps {
  title: string;
  msg: string;
}

export const Toast: Component<Props> = (props) => {
  const [local, rootProps] = splitProps(props, ["msg", "title"]);

  return (
    <KToast
      {...rootProps}
      class={`flex flex-col items-center justify-between gap-2 border-1 border-ash-gray-400
        rounded-md p-2 bg-charcoal-500 data-[opened]:animate-slideIn data-[closed]:animate-hide
        data-[swipe=move]:translate-x-[var(--kb-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0
        data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200 data-[swipe=cancel]:ease-out
        data-[swipe=end]:animate-swipeOut text-dark-slate-gray-900`}
    >
      <div class={`flex items-start w-full`}>
        <div>
          <KToast.Title>{local.title}</KToast.Title>
          <KToast.Description class="text-sm">{local.msg}</KToast.Description>
        </div>
        <KToast.CloseButton class={`shrink-0 ml-auto`}>
          <X size={16} />
        </KToast.CloseButton>
      </div>
    </KToast>
  );
};

export default Toast;
