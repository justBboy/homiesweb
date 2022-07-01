import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getFoodsApi } from "./foodsApi";

export type foodType = {
  id: string;
  name: string;
  includes?: string[];
  price: number;
  available?: boolean;
  category: string;
  imgURL: string | ArrayBuffer | null | undefined;
};

interface state {
  foods: {
    items: foodType[];
    categoryId: string;
    complete?: boolean;
    lastUpdate: number;
  }[];
  lastUpdateFoods: number;
}

const initialState: state = {
  foods: [{ items: [], categoryId: "", complete: false, lastUpdate: 0 }],
  lastUpdateFoods: 0,
};
export const getFoods = createAsyncThunk(
  "foods/getFoods",
  async (
    {
      page,
      lastUpdate,
      category,
    }: {
      page: number;
      lastUpdate: number;
      category: string;
    },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const itemIndx = state.foods.foods.findIndex(
      (f) => f.categoryId === category
    );
    const sLastUpdate =
      itemIndx !== -1 ? state.foods.foods[itemIndx].lastUpdate : 0;
    const indx = state.foods.foods.findIndex((f) => f.categoryId === category);
    let lastDoc;
    if (indx !== -1)
      lastDoc =
        state.foods.foods[indx].items[state.foods.foods[indx].items.length - 1];

    if (!sLastUpdate || !lastUpdate || sLastUpdate < lastUpdate) {
      const res = await getFoodsApi(page, lastUpdate, lastDoc, category, true);
      return res;
    } else {
      const indx = state.foods.foods.findIndex(
        (f) => f.categoryId === category
      );
      if (indx === -1) {
        const res = await getFoodsApi(page, lastUpdate, lastDoc, category);
        return res;
      } else {
        if (!state.foods.foods[indx].complete) {
          const res = await getFoodsApi(page, lastUpdate, lastDoc, category);
          return res;
        }
      }
    }
    return null;
  }
);

const slice = createSlice({
  name: "foods",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(
      getFoods.fulfilled,
      (
        state,
        action: PayloadAction<{
          lastUpdate: number;
          data: any;
          category: string;
          isNewSet: boolean;
        }>
      ) => {
        if (!action.payload) return;
        state.lastUpdateFoods = action.payload?.lastUpdate || 0;
        const fIndx = state.foods?.findIndex(
          (f) => f.categoryId === action.payload.category
        );
        if (fIndx === -1) {
          state.foods.push({
            items: action.payload.data || [],
            categoryId: action.payload.category,
            lastUpdate: action.payload.lastUpdate,
          });
        } else {
          if (!action.payload?.data?.length) state.foods[fIndx].complete = true;
          if (!action.payload.isNewSet && action.payload.data) {
            state.foods[fIndx].items = state.foods[fIndx].items.concat(
              action.payload.data?.filter((f: foodType) => {
                const indx = state.foods[fIndx]?.items.findIndex(
                  (i) => i.id === f.id
                );
                if (indx === -1) return true;
                return false;
              })
            );
            state.foods[fIndx].lastUpdate = action.payload.lastUpdate;
          } else {
            state.foods[fIndx].items = action.payload.data || [];
            state.foods[fIndx].lastUpdate = action.payload.lastUpdate;
          }
        }
      }
    );
  },
});

export const selectFoods = (state: RootState) => state.foods.foods;
export const selectFoodsWithCategory = (categoryId: string) => {
  return (state: RootState) => {
    const findx = state.foods.foods.findIndex(
      (f) => f.categoryId === categoryId
    );
    if (findx !== -1) return state.foods.foods[findx];
    return { items: [], categoryId: categoryId };
  };
};

export default slice.reducer;
