import axios from "../../libs/axios";
export const getFoodCategoriesApi = async (
  page: number,
  lastUpdate: number
) => {
  try {
    const res = await axios.get("/users/getCategories");
    if (res.data.error) throw res.data.error;
    const data = res.data;
    return { data, lastUpdate };
  } catch (err) {
    console.log("getting error =========> ", err);
    throw err;
  }
};
