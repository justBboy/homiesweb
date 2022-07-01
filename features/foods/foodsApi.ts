import axios from "../../libs/axios";

export const getFoodsApi = async (
  page: number,
  lastUpdate: number,
  lastDoc: any,
  category: string,
  isUpdated?: boolean
) => {
  try {
    console.log("here");
    const res = await axios.get(
      `/users/foods?page=${page}&lastDocId=${
        (!isUpdated && lastDoc && lastDoc.id) || ""
      }&category=${category}`
    );
    console.log(res.data);
    if (res.data.error) return res.data.error;
    const data = res.data.items;
    return { data, lastUpdate, category, isNewSet: res.data.isNewSet };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
