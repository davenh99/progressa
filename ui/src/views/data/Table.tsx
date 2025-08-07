import { ParentComponent } from "solid-js";

export const Table: ParentComponent = (props) => {
  return <table class="table w-full border-separate border-spacing-y-1">{props.children}</table>;
};

export const TableBody: ParentComponent = (props) => {
  return <tbody>{props.children}</tbody>;
};

export const TableHeader: ParentComponent = (props) => {
  return <thead>{props.children}</thead>;
};

export const Row: ParentComponent = (props) => {
  return <tr>{props.children}</tr>;
};

export const Cell: ParentComponent = (props) => {
  return (
    <td
      class={`p-1 border-t-1 border-b-1 first-of-type:border-l-1 first-of-type:rounded-bl-md first-of-type:rounded-tl-md
        last-of-type:border-r-1 last-of-type:rounded-br-md last-of-type:rounded-tr-md`}
    >
      {props.children}
    </td>
  );
};

export const TableHeaderCell: ParentComponent = (props) => {
  return <td class="text-left p-3">{props.children}</td>;
};
