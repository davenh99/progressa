import { SessionMealCreateData } from "../../Types";

export const extractMealData = (meal: SessionMealsRecordExpand): SessionMealCreateData => {
  const { session, name, description, tags, kj, gramsProtein, gramsCarbohydrate, gramsFat } = meal;
  return {
    session,
    name: name || "",
    description: description || "",
    tags: tags || [],
    kj: kj || 0,
    gramsProtein: gramsProtein || 0,
    gramsCarbohydrate: gramsCarbohydrate || 0,
    gramsFat: gramsFat || 0,
  };
};

export const sortMeals = (sessionExercises: SessionMealsRecordExpand[], order: string[]) => {
  const itemsMap = new Map(sessionExercises.map((item) => [item.id, item]));

  const orderedItems = order.map((id) => itemsMap.get(id)).filter((item) => item !== undefined);
  const unorderedItems = sessionExercises.filter((item) => !order.includes(item.id));

  return [...orderedItems, ...unorderedItems];
};
