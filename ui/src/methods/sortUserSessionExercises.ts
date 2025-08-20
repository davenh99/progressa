import { UserSessionExercise } from "../../Types";

export const sortUserSessionExercises = (userSessionExercises: UserSessionExercise[], order: string[]) => {
  const itemsMap = new Map(userSessionExercises.map((item) => [item.id, item]));

  const orderedItems = order.map((id) => itemsMap.get(id)).filter((item) => item !== undefined);
  const unorderedItems = userSessionExercises.filter((item) => !order.includes(item.id));

  return [...orderedItems, ...unorderedItems];
};
