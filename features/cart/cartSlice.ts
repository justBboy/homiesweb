import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type cartItemType = {
  id: string;
  name: string;
  price: number;
  imgURL: string;
  quantity: number;
};

interface state {
  carts: cartItemType[];
}

const initialState: state = {
  carts: [],
};

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<cartItemType>) => {
      const indx = state.carts.findIndex((s) => s.id === action.payload.id);
      if (indx === -1) state.carts.unshift(action.payload);
    },
    setCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      if (action.payload.quantity < 0) return;
      const indx = state.carts.findIndex((s) => s.id === action.payload.id);
      if (indx !== -1) {
        state.carts[indx].quantity = action.payload.quantity;
      }
    },
  },
});

export const { addToCart, setCartItemQuantity } = slice.actions;

export const selectCarts = (state: RootState) => state.carts.carts;

export default slice.reducer;
