import axios from "../../libs/axios";

export const getFoodsApi = async (page: number, lastUpdate: number) => {
  try {
    const res = await axios.get(`/users/foods?page=${page}`);
    if (res.data.error) return res.data.error;
    const data = res.data;
    return { data, lastUpdate };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
