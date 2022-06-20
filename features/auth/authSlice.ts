import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RecaptchaVerifier } from "firebase/auth";
import { RootState } from "../store";
import {
  loginUserApi,
  registerUserApi,
  registerUserFacebookApi,
} from "./authApi";

export type userType = {
  uid: string;
  username: string | null;
  phone: string | null;
  email: string | null;
  admin?: boolean;
  superadmin?: boolean;
};

interface state {
  user: userType | null;
}

const initialState: state = {
  user: null,
};

type userLoginData = {
  email: string;
  password: string;
};
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: userLoginData) => {
    const res = await loginUserApi(email, password);
    return res;
  }
);

type userRegisterData = {
  email: string;
  phone: string;
};
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({
    data,
    recaptchaVerifier,
  }: {
    data: userRegisterData;
    recaptchaVerifier: RecaptchaVerifier;
  }) => {
    const res = await registerUserApi(data, recaptchaVerifier);
    return res;
  }
);

export const registerUserFacebook = createAsyncThunk(
  "auth/registerFacebook",
  async ({}) => {
    const res = await registerUserFacebookApi();
    return res;
  }
);

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<userType | null>) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = slice.actions;

export const selectUser = (state: RootState) => state.auth.user;

export default slice.reducer;
