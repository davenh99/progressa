import { Component, For, JSX } from "solid-js";
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
  recordID: string;
  updateRecord?: (modelName: string, recordID: string, field: string, newVal: any) => Promise<any>;
}

export const TagArea: Component<TagAreaProps> = (props) => {
  const { pb, user, updateRecord } = useAuthPB();

  const updateFn = props.updateRecord ?? updateRecord;

  const handleTagInput: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = async (e) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();

      if (!(props.tags || []).map((t) => t.name).includes(newTag)) {
        try {
          const foundTag = await pb
            .collection<TagType>("tags")
            .getFirstListItem(`createdBy = '${user.id}' && name = '${newTag}'`);

          await updateFn(props.modelName, props.recordID, "+tags", foundTag.id);
          props.setTags([...(props.tags || []), foundTag]);
        } catch (e) {
          if (e instanceof ClientResponseError && e.status == 404) {
            const createdTag = await pb
              .collection<TagType>("tags")
              .create({ name: newTag, public: false, createdBy: user.id });

            await updateFn(props.modelName, props.recordID, "+tags", createdTag.id);
            props.setTags([...(props.tags || []), createdTag]);
          } else {
            console.log(e);
          }
        } finally {
          e.currentTarget.value = "";
        }
      }
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
    <div class="border-2 rounded-lg p-2">
      <Input label="Tags" type="text" onKeyDown={handleTagInput} placeholder="Add tags (press Enter)" />
      <div class="">
        <For each={props.tags || []}>{(t) => <Tag name={t.name} onClick={() => deleteTag(t)} />}</For>
      </div>
    </div>
  );
};
