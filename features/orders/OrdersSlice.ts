import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { auth } from "../../libs/Firebase";
import { RootState } from "../store";
import { getOrdersApi, placeOrderManualApi } from "./OrdersApi";

export type orderLocationType = {
  locationStreet: string;
  locationLngLat: {
    longitude: number;
    latitude: number;
  };
};

export type distanceFromUsType = {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
};

export type orderType = {
  id: string;
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  createdBy: string;
  hasRefCode?: boolean;
  failed?: boolean;
  completed?: boolean;
  viewed?: boolean;
  ongoing?: boolean;
  location?: orderLocationType;
  distanceFromUs?: distanceFromUsType | null;
  items: {
    id: string;
    foodName: string;
    itemCategory: string;
    price: number;
    quantity: number;
  }[];
  createdAt:
    | {
        nanoseconds: number;
        seconds: number;
      }
    | any;
  csale?: boolean;
};

interface state {
  orders: {
    data: orderType[];
    page: number;
    lastUpdate: number;
  }[];
  lastUpdate: {
    nanoseconds: number;
    seconds: number;
  };
  lastDoc: Document | null;
  lastPage: number;
}

const initialState: state = {
  orders: [{ data: [], page: 1, lastUpdate: 0 }],
  lastUpdate: {
    nanoseconds: 0,
    seconds: 0,
  },
  lastDoc: null,
  lastPage: 1,
};

export const getOrders = createAsyncThunk(
  "orders/get",
  async (
    { page, lastUpdate }: { page: number; lastUpdate: number },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const cIndx = state.orders.orders.findIndex((o) => o.page === page);
    if (auth.currentUser) {
      if (cIndx === -1) {
        const lastDoc = state.orders.lastDoc;
        const res = await getOrdersApi(
          page,
          auth.currentUser.uid,
          lastDoc,
          lastUpdate
        );
        return res;
      } else {
        const isUpdated =
          state.orders.orders[cIndx]?.lastUpdate < lastUpdate ||
          lastUpdate === 0 ||
          !lastUpdate ||
          !state.orders.orders[cIndx].lastUpdate;

        if (isUpdated) {
          const lastDoc = state.orders.lastDoc;
          const res = await getOrdersApi(
            page,
            auth.currentUser.uid,
            lastDoc,
            lastUpdate
          );
          return res;
        } else {
          return {
            data: state.orders.orders[cIndx].data,
            page: state.orders.orders[cIndx].page,
          };
        }
      }
    }
    return null;
  }
);

export const placeOrderManual = createAsyncThunk(
  "orders/add",
  async (data: {
    foods: { id: string; quantity: number }[];
    locationStreet: string;
    locationLngLat: {
      longitude: number;
      latitude: number;
    };
  }) => {
    const res = await placeOrderManualApi(data);
    return res;
  }
);

const slice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setLastUpdate: (
      state,
      action: PayloadAction<{ seconds: number; nanoseconds: number }>
    ) => {
      state.lastUpdate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.fulfilled, (state, action: any) => {
        if (!action.payload) return;
        const cIndex = state.orders.findIndex(
          (o) => o.page === action.payload.page
        );
        const item = {
          data: action.payload.data,
          page: action.payload.page,
          lastUpdate: action.payload.lastUpdate || 0,
        };
        if (cIndex !== -1) state.orders[cIndex] = item;
        else state.orders.push(item);
        const lastPageNumber = state.orders[state.orders.length - 1].page;
        if (action.payload.lastDoc && lastPageNumber <= action.payload.page)
          state.lastDoc = action.payload.lastDoc;
      })
      .addCase(
        placeOrderManual.fulfilled,
        (state, action: PayloadAction<orderType>) => {
          state.orders[0].data.unshift(action.payload);
        }
      );
    /*
      .addCase(
        deleteOrders.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.orders.forEach((ord, indx) => {
            state.orders[indx].data = ord.data.filter((d) => {
              return !action.payload.includes(d.id);
            });
          });
        }
      )
      .addCase(addCustomer.fulfilled, (state, action: any) => {
        if (!action.payload) return;
        state.orders[0].data = [...state.orders[0].data, action.payload];
      });
      */
  },
});

export const { setLastUpdate } = slice.actions;

export const selectOrders = (page: number) => {
  return (state: RootState) => {
    const cIndx = state.orders.orders.findIndex((o) => o.page === page);
    if (cIndx !== -1) return state.orders.orders[cIndx].data;
    else return state.orders.orders[0].data;
  };
};

export const selectLastUpdated = (state: RootState) => state.orders.lastUpdate;
export default slice.reducer;
