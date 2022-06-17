import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ImFacebook2 } from "react-icons/im";
import { AiOutlineLoading } from "react-icons/ai";
import { validateRegisterForm } from "../features/validators";
import { useRouter } from "next/router";
import { auth } from "../libs/Firebase";
import useRecaptcha from "../features/hooks/useRecaptcha";
import {
  ConfirmationResult,
  signInWithPhoneNumber,
  updateEmail,
} from "firebase/auth";
import CenterModal from "../components/CenterModal";

export type registerFormError = {
  email: string;
  phone: string;
};
export type registerForm = {
  email: string;
  phone: string;
  error: Partial<registerFormError> | null;
};
const register = () => {
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerficationLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaVerifier = useRecaptcha("recaptcha-div");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult>();
  const router = useRouter();
  const [form, setForm] = useState<registerForm>({
    email: "",
    phone: "",
    error: null,
  });
  const handleChange = (key: string, val: string) => {
    setForm({ ...form, [key]: val });
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateRegisterForm(form);
    if (Object.keys(errors).length > 0) {
      setForm({ ...form, error: errors });
      return;
    }
    setLoading(true);
    const data = { email: form.email, phone: form.phone };
    if (recaptchaVerifier) {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        `+233${data.phone.substring(1)}`,
        recaptchaVerifier
      );
      if (confirmationResult) setConfirmationResult(confirmationResult);
    }
    setLoading(false);
  };
  const handleVerifyCode = async () => {
    setVerficationLoading(true);
    if (confirmationResult) {
      const { user } = await confirmationResult.confirm(code);
      updateEmail(user, form.email);
    }
    setVerficationLoading(false);
  };
  useEffect(() => {
    if (auth.currentUser) {
      const next = router.query["next"]?.toString() || "/";
      router.push(next);
    }
  }, [auth.currentUser]);
  return (
    <div className={`w-screen min-h-screen bg-graybg flex items-center`}>
      {confirmationResult && (
        <CenterModal show={true}>
          <div className={`w-full`}>
            <h2 className={`text-center mb-1`}>Enter Verification Code</h2>
            <p className="font-gothamThin text-sm font-thin">
              Verification code has been sent to your mobile number
            </p>
            <div className={`px-2 sm:px-5`}>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                }}
                autoFocus
                className={`w-full p-2 outline-orange-600 border border-slate-400 shadow rounded mb-4`}
              />
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={verificationLoading}
              className={`w-[160px] mt-3 transition-opacity duration-500 ${
                verificationLoading ? "opacity-80" : "opacity-100"
              } mx-auto flex items-center cursor-pointer bg-orange-700 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded`}
            >
              {verificationLoading ? (
                <AiOutlineLoading className={`animate-spin`} />
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </CenterModal>
      )}
      <div className={`sm:min-w-[50vw] min-h-screen mx-auto py-20`}>
        <div className={`flex w-full items-center justify-center`}>
          <Link href="/">
            <img
              src="/images/logo-no-bg.png"
              className={`w-[180px] sm:w-[240px] cursor-pointer`}
              alt="Homiez Foods logo"
            />
          </Link>
        </div>
        <div className={`flex flex-col items-center h-[80%]`}>
          <h2 className={`font-gotham mt-5 text-md`}>Dine With Us</h2>
          <form
            className={`w-full flex flex-col h-full items-center px-5 pt-2 mt-2`}
          >
            {error && (
              <p
                className={`mb-4 font-sm font-thin font-gothamThin text-red-400 px-2 text-center`}
              >
                {error}
              </p>
            )}

            <div
              className={`flex items-center flex-col w-full sm:w-[400px] w-[280px]`}
            >
              {form.error?.phone && (
                <p
                  className={`font-sm font-thin font-gothamThin text-red-400 px-2 text-center`}
                >
                  {form.error.phone}
                </p>
              )}
              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                type="tel"
                placeholder="Phone Number"
                className={`w-full p-2 outline-orange-600 border border-slate-400 shadow rounded mb-4`}
              />
            </div>
            <div
              className={
                "flex items-center flex-col w-full sm:w-[400px] w-[280px]"
              }
            >
              {form.error?.email && (
                <p className="font-sm font-thin font-gothamThin text-red-400 px-2 text-center">
                  {form.error.email}
                </p>
              )}
              <input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                type="email"
                placeholder="Email"
                className={`w-full p-2 outline-orange-600 border border-slate-400 shadow rounded mb-4`}
              />
            </div>
            <div className={`w-[80%] mx-auto`}>
              <div id="recaptcha-div"></div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background:
                    "radial-gradient(circle, rgba(234,88,12,1) 35%, rgba(255,131,0,1) 100%)",
                }}
                className={`mt-3 w-full uppercase transition-opacity duration-500 ${
                  loading ? "opacity-80" : "opacity-100"
                } flex items-center justify-center transition-opacity duration-500 ${
                  loading ? "opacity-80" : "opacity-100"
                } mx-auto p-3 hover:opacity-[0.7] text-slate-100 rounded-md shadow-md`}
              >
                {loading ? (
                  <AiOutlineLoading className={`animate-spin`} />
                ) : (
                  "Register"
                )}
              </button>
            </div>
            <div className={`w-[80%] mx-auto mt-4`}>
              <button className="flex items-center justify-center shadow uppercase h-12 mt-3 text-white w-full rounded bg-blue-600 hover:bg-blue-700">
                <ImFacebook2 className={`text-white text-xl ml-3 mr-auto`} />
                <span className={`text-gothamMedium text-sm mr-auto`}>
                  Register With Facebook
                </span>
              </button>
            </div>
            <p className={`text-md font-gothamBook mt-2`}>
              <span>Already Have An Account, </span>
              <Link href="/login">
                <a className={`text-blue-600 hover:text-blue-700`}>Login</a>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default register;
