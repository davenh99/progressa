import { Component, createSignal, For, JSX } from "solid-js";
import { Button as KobalteButton } from "@kobalte/core/button";
import CloseIcon from "lucide-solid/icons/x";

import type { Tag as TagType } from "../../Types";
import Input from "./Input";
import { useAuthPB } from "../config/pocketbase";
import { ClientResponseError } from "pocketbase";

interface Props {
  onClick: () => void;
  name: string;
}

export const Tag: Component<Props> = (props) => {
  return (
    <div class="flex items-center bg-cambridge-blue-600 pl-2 pr-1 py-1 rounded-full select-none">
      <span class="text-sm font-bold">{props.name}</span>
      <KobalteButton onClick={props.onClick} class="ml-1 p-1 rounded-full flex items-center justify-center">
        <CloseIcon size={14} />
      </KobalteButton>
    </div>
  );
};

export default Tag;

interface TagAreaProps {
  tags: TagType[];
  setTags: (tags: TagType[]) => void;
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
            .collection<TagType>("tags")
            .getFirstListItem(`createdBy = '${user.id}' && name = '${newTag}'`);

          await updateFn(props.modelName, props.recordID, "+tags", foundTag.id);
          props.setTags([...props.tags, foundTag]);
        } catch (e) {
          if (e instanceof ClientResponseError && e.status == 404) {
            const createdTag = await pb
              .collection<TagType>("tags")
              .create({ name: newTag, public: false, createdBy: user.id });

            await updateFn(props.modelName, props.recordID, "+tags", createdTag.id);
            props.setTags([...props.tags, createdTag]);
          } else {
            console.log(e);
          }
        }
      }
      setTagInput("");
    }
  };

  const deleteTag = async (t: TagType) => {
    try {
      await updateFn(props.modelName, props.recordID, "tags-", t.id);
      props.setTags((props.tags || []).filter((tag) => tag.id !== t.id));
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div class="border-2 border-ash-gray-400 rounded-sm p-2 flex flex-col">
      <Input
        label=""
        type="text"
        value={tagInput()}
        onInput={(e) => setTagInput(e.currentTarget.value)}
        onKeyDown={handleTagInput}
        placeholder="Add tags (press Enter)"
        class="flex-1 min-w-[120px] mb-2"
      />
      <div class="flex flex-wrap gap-2">
        <For each={props.tags || []}>{(t) => <Tag name={t.name} onClick={() => deleteTag(t)} />}</For>
      </div>
    </div>
  );
};
