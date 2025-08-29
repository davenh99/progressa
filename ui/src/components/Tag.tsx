import { Component, For } from "solid-js";
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
    <div class="badge border-1 rounded-full p-2 flex flex-row">
      {props.name}
      <KobalteButton onClick={props.onClick} class="ml-1">
        <CloseIcon />
      </KobalteButton>
    </div>
  );
};

export default Tag;

interface TagAreaProps {
  tags?: TagType[];
  setTags: (tags: TagType[]) => void;
  modelName: string;
  recordID?: string;
  updateRecord?: (modelName: string, recordID: string, column: string, newVal: any) => Promise<any>;
}

export const TagArea: Component<TagAreaProps> = (props) => {
  const { pb, user, updateRecord } = useAuthPB();

  const handleTagInput = async (
    e: KeyboardEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }
  ) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();

      if (!(props.tags || []).map((t) => t.name).includes(newTag)) {
        try {
          const foundTag = await pb
            .collection<TagType>("tags")
            .getFirstListItem(`createdBy = '${user.id}' && name = '${newTag}'`);

          (await props.updateRecord?.(props.modelName, props.recordID, "+tags", foundTag.id)) ??
            updateRecord(props.modelName, props.recordID, foundTag.id, "+tags");
          props.setTags([...(props.tags || []), foundTag]);
        } catch (e) {
          if (e instanceof ClientResponseError && e.status == 404) {
            const createdTag = await pb
              .collection<TagType>("tags")
              .create({ name: newTag, public: false, createdBy: user.id });

            (await props.updateRecord?.(props.modelName, props.recordID, "+tags", createdTag.id)) ??
              updateRecord(props.modelName, props.recordID, createdTag.id, "+tags");
            props.setTags([...(props.tags || []), createdTag]);
          } else {
            console.log(e);
          }
        } finally {
          e.target.value = "";
        }
      }
    }
  };

  const deleteTag = async (t: TagType) => {
    try {
      (await props.updateRecord?.(props.modelName, props.recordID, "tags-", t.id)) ??
        updateRecord(props.modelName, props.recordID, t.id, "tags-");
      props.setTags((props.tags || []).filter((tag) => tag.id !== t.id));
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div class="border-2 rounded-lg p-2">
      <Input label="Tags" type="text" onKeyDown={handleTagInput} placeholder="Add tags (press Enter)" />
      <div class="">
        <For each={props.tags || []}>{(t) => <Tag name={t.name} onClick={() => deleteTag(t)} />}</For>
      </div>
    </div>
  );
};
