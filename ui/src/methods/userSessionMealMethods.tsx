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
