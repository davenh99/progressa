import { Component, createSignal, For, JSX } from "solid-js";
import { Button as KobalteButton } from "@kobalte/core/button";
import CloseIcon from "lucide-solid/icons/x";

import type { Tag as TTag } from "../../Types";
import Input from "./Input";
import { useAuthPB } from "../config/pocketbase";
import { ClientResponseError } from "pocketbase";

interface Props {
  onClick: () => void;
  tag: TTag;
}

const Tag: Component<Props> = (props) => {
  return (
    <div
      style={{ "background-color": `${props.tag.colorHex}30`, color: "#ccf" }}
      class="flex items-center pl-2 pr-1 py-1 rounded-full select-none border-1"
    >
      <span class="text-sm font-bold">{props.tag.name}</span>
      <KobalteButton onClick={props.onClick} class="p-1 rounded-full flex items-center justify-center">
        <CloseIcon size={14} />
      </KobalteButton>
    </div>
  );
};

interface TagAreaProps {
  tags: TTag[];
  setTags: (tags: TTag[]) => void;
  modelName: string;
  recordID: string;
  updateRecord?: (modelName: string, recordID: string, field: string, newVal: any) => Promise<any>;
}

export const TagArea: Component<TagAreaProps> = (props) => {
  const [tagInput, setTagInput] = createSignal("");
  const { pb, user, updateRecord } = useAuthPB();
  const updateFn = props.updateRecord ?? updateRecord;

  const handleTagInput: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = async (e) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();

      if (!props.tags.map((t) => t.name).includes(newTag)) {
        try {
          const foundTag = await pb
            .collection<TTag>("tags")
            .getFirstListItem(`createdBy = '${user.id}' && name = '${newTag}'`);

          await updateFn(props.modelName, props.recordID, "+tags", foundTag.id);
          props.setTags([...props.tags, foundTag]);
        } catch (e) {
          if (e instanceof ClientResponseError && e.status == 404) {
            const createdTag = await pb
              .collection<TTag>("tags")
              .create({ name: newTag, public: false, createdBy: user.id, colorHex: "#ccccff" });

            await updateFn(props.modelName, props.recordID, "+tags", createdTag.id);
            props.setTags([...props.tags, createdTag]);
          } else {
            console.error(e);
          }
        }
      }
      setTagInput("");
    }
  };

  const deleteTag = async (t: TTag) => {
    try {
      await updateFn(props.modelName, props.recordID, "tags-", t.id);
      props.setTags((props.tags || []).filter((tag) => tag.id !== t.id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div class="rounded-md p-2 flex flex-col bg-charcoal-600">
      <Input
        label=""
        noPadding
        value={tagInput()}
        onChange={(v) => setTagInput(v)}
        inputProps={{
          onKeyDown: handleTagInput,
          placeholder: "Add tags (press Enter)",
        }}
        class="flex-1 min-w-[120px] mb-2"
      />
      <div class="flex flex-wrap gap-2">
        <For each={props.tags || []}>{(t) => <Tag tag={t} onClick={() => deleteTag(t)} />}</For>
      </div>
    </div>
  );
};

export default TagArea;
