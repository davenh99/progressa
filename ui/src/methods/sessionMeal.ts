import { SessionMeal, SessionMealCreateData } from "../../Types";

export const extractMealData = (meal: SessionMeal): SessionMealCreateData => {
  const { session, name, description, tags, kj, gramsProtein, gramsCarbohydrate, gramsFat } = meal;
  return {
    session,
    name,
    description,
    tags,
    kj,
    gramsProtein,
    gramsCarbohydrate,
    gramsFat,
  };
};

export const sortMeals = (sessionExercises: SessionMeal[], order: string[]) => {
  const itemsMap = new Map(sessionExercises.map((item) => [item.id, item]));

  const orderedItems = order.map((id) => itemsMap.get(id)).filter((item) => item !== undefined);
  const unorderedItems = sessionExercises.filter((item) => !order.includes(item.id));

  return [...orderedItems, ...unorderedItems];
};
