import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getFoodsApi } from "./foodsApi";

export type foodType = {
  id: string;
  name: string;
  price: number;
  available?: boolean;
  imgURL: string | ArrayBuffer | null | undefined;
};

interface state {
  foods: foodType[];
  lastUpdateFoods: number;
}

const initialState: state = {
  foods: [],
  lastUpdateFoods: 0,
};

export const getFoods = createAsyncThunk(
  "foods/getFoods",
  async (
    { page, lastUpdate }: { page: number; lastUpdate: number },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const sLastUpdate = state.foods.lastUpdateFoods;
    console.log(">>>>>>>>>> ", sLastUpdate, lastUpdate);
    if (
      sLastUpdate < lastUpdate ||
      lastUpdate === 0 ||
      !lastUpdate ||
      !sLastUpdate
    ) {
      const res = await getFoodsApi(page, lastUpdate);
      return res;
    } else {
      return null;
    }
  }
);

const slice = createSlice({
  name: "foods",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getFoods.fulfilled, (state, action: any) => {
      if (!action.payload) return;
      console.log("payload ==========> ", action.payload);
      state.lastUpdateFoods = action.payload?.lastUpdate || 0;
      state.foods = action.payload?.data || [];
    });
  },
});

export const selectFoods = (state: RootState) => state.foods.foods;

export default slice.reducer;
