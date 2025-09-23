import { Meal, MealCreateData } from "../../Types";

export const extractMealData = (meal: Meal): MealCreateData => {
  const { userSession, name, description, tags, kj, gramsProtein, gramsCarbohydrate, gramsFat } = meal;
  return {
    userSession,
    name,
    description,
    tags,
    kj,
    gramsProtein,
    gramsCarbohydrate,
    gramsFat,
  };
};

export const sortMeals = (userSessionExercises: Meal[], order: string[]) => {
  const itemsMap = new Map(userSessionExercises.map((item) => [item.id, item]));

  const orderedItems = order.map((id) => itemsMap.get(id)).filter((item) => item !== undefined);
  const unorderedItems = userSessionExercises.filter((item) => !order.includes(item.id));

  return [...orderedItems, ...unorderedItems];
};
