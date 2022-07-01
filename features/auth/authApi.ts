import {
  FacebookAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithRedirect,
  User,
} from "firebase/auth";

import { auth } from "../../libs/Firebase";
export const loginUserApi = async (email: string, password: string) => {
  try {
  } catch (err) {
    throw err;
  }
};

export const registerUserApi = async (
  data: { email: string; phone: string },
  recaptchaVerifier: RecaptchaVerifier
) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      `+233${data.phone.substring(1)}`,
      recaptchaVerifier
    );
  } catch (err) {
    console.log("register ============> ", err);
    throw err;
  }
};

export const registerUserFacebookApi = async () => {
  try {
    const provider = new FacebookAuthProvider();
    provider.addScope("phone");
    const { user }: { user: User } = await signInWithRedirect(auth, provider);
    const data = {
      email: user.email,
      phone: user.phoneNumber,
      username: user.displayName,
    };
    return user;
  } catch (err) {
    console.log("facebook register =========> ", err);
    throw err;
  }
};
