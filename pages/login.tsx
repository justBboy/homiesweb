import {
  ConfirmationResult,
  getIdToken,
  signInWithCustomToken,
  signInWithPhoneNumber,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { AiOutlineLoading, AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsCheckLg } from "react-icons/bs";
import CenterModal from "../components/CenterModal";
import { selectRefCode, setUser } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import useRecaptcha from "../features/hooks/useRecaptcha";
import { validateLoginForm } from "../features/validators";
import { auth } from "../libs/Firebase";
import axios from "../libs/axios";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import Head from "next/head";

export type loginFormErrors = {
  phone: string;
};
export type loginForm = {
  phone: string;
  error: Partial<loginFormErrors> | null;
};
const Login = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const srefCode = useAppSelector(selectRefCode);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [username, setUsername] = useState("");
  const { user, completed } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [validationError, setValidationError] = useState("");
  const [error, setError] = useState("");
  const { createRecaptcha } = useRecaptcha("recaptcha-div");
  const [refCode, setRefCode] = useState("");
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [recaptchaLoading, setRecaptchaLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult>();
  const [form, setForm] = useState<loginForm>({
    phone: "",
    error: null,
  });

  const sendVerification = async (phone: string) => {
    const recaptcha = createRecaptcha("recaptcha-div");
    if (recaptcha) {
      setRecaptchaLoading(true);
      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          `+233${phone.substring(1)}`,
          recaptcha
        );
        if (confirmationResult) setConfirmationResult(confirmationResult);

        if (recaptchaContainerRef.current) {
          recaptchaContainerRef.current?.replaceChildren();
          recaptchaContainerRef.current.innerHTML =
            "<div id='recaptcha-div'></div>";
        }
        setTimeout(() => {
          createRecaptcha("recaptcha-div");
        }, 5000);
        setRecaptchaLoading(false);
      } catch (err) {
        console.log(err);
        setError("There was an error verifiying, please try later");
        if (recaptchaContainerRef.current) {
          recaptchaContainerRef.current?.replaceChildren();
          recaptchaContainerRef.current.innerHTML =
            "<div id='recaptcha-div'></div>";
          setTimeout(() => {
            createRecaptcha("recaptcha-div");
          }, 5000);
        }
        setRecaptchaLoading(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateLoginForm(form);
    if (Object.keys(errors).length > 0) {
      setForm({ ...form, error: errors });
      return;
    }
    setLoading(true);
    const data = { phone: form.phone };
    try {
      await sendVerification(data.phone);
      setLoading(false);
      setOpenConfirmModal(true);
    } catch (err) {
      console.log(err);
      setError("There was an error verifiying, please try later");
      setLoading(false);
    }
  };
  const handleVerifyCode = async () => {
    setVerificationLoading(true);
    setValidationError("");
    if (confirmationResult) {
      try {
        const { user } = await confirmationResult.confirm(code);
        setVerificationComplete(true);
        dispatch(
          setUser({
            uid: user.uid,
            phone: user.phoneNumber,
            email: user.email,
            username: user.displayName,
          })
        );
        setTimeout(() => {
          if (user.email && user.displayName) {
            const next = router.query["next"]?.toString() || "/";
            router.push(next);
          }
          setOpenConfirmModal(false);
        }, 1000);
        setVerificationLoading(false);
      } catch (err) {
        setVerificationLoading(false);
        if (typeof err === "object") {
          if ((err as any).code === "auth/invalid-verification-code")
            setValidationError("Invalid verification code");
          if ((err as any).code === "auth/too-many-requests")
            setValidationError("Too Many Requests, try again later");
          else setValidationError("There was an error, please try again");
        } else if (typeof err === "string")
          setValidationError("There was an error, please try again");
      }
    }
  };
  console.log(user);
  const handleUpdateDetails = async () => {
    setLoading(true);
    setError("");
    if (auth.currentUser) {
      try {
        //await updateEmail(auth.currentUser, email);
        await updateProfile(auth.currentUser, {
          displayName: username,
        });
        const token = await getIdToken(auth.currentUser);
        const res = await axios.post("/auth/registerCustomer", {
          uid: auth.currentUser.uid,
          email,
          refCode,
          token,
        });
        if (res.data.error) {
          //setError(res.data.error);
        }
        setLoading(false);
        await signInWithCustomToken(auth, res.data.customToken);
      } catch (err) {
        if (typeof err === "object") {
          if ((err as any).code === "auth/email-already-in-use") {
            setError("Email already in use");
            setLoading(false);
            return;
          }
        }
        setError("");
        console.log(err);
      }
      const next = router.query["next"]?.toString() || "/";
      router.push(next);
    }
    setLoading(false);
  };

  /*
  const handleFacebookLogin = async (e: any) => {
    e.preventDefault();
    try {
      const provider = new FacebookAuthProvider();
      const { user }: { user: User } = await signInWithRedirect(auth, provider);
      console.log(auth.currentUser);
      const data = {
        email: user.email,
        phone: user.phoneNumber,
        username: user.displayName,
      };
      console.log(data);
      e.preventDefault();
      const next = router.query["next"]?.toString() || "/";
      router.push(next);
    } catch (err) {
      console.log(err);
    }
  };
  */

  useEffect(() => {
    router.beforePopState(({ as }) => {
      router.replace("/");
      return false;
    });
    return () => {
      router.beforePopState(() => true);
    };
  }, []);

  useEffect(() => {
    if (srefCode) {
      setRefCode(srefCode);
    }
  }, [srefCode]);

  console.log(openConfirmModal);
  return (
    <div
      className={`w-screen min-h-screen bg-graybg flex items-center animate__animated animate__fadeIn`}
    >
      <Head>
        <title>Homiezfoods - login</title>
      </Head>
      {confirmationResult && openConfirmModal && (
        <CenterModal show={true}>
          <div className={`w-full flex flex-col items-center`}>
            <div
              className={`${
                (verificationLoading || verificationComplete) && "h-[120px]"
              }`}
            >
              <AiOutlineLoading3Quarters
                className={`text-6xl mb-3 animate-spin ${
                  verificationLoading && !verificationComplete
                    ? "block"
                    : "hidden"
                }`}
                color="#4f3"
              />
              <BsCheckLg
                className={`text-6xl mb-3 animate__fadeIn ${
                  verificationComplete ? "block" : "hidden"
                }`}
                color="#4f3"
              />
            </div>
            {validationError && (
              <p className="text-red-400 text-sm mb-2">{validationError}</p>
            )}
            <h2 className={`text-center mb-1`}>Enter Verification Code</h2>
            <p className="font-gothamThin text-sm font-thin text-center">
              Verification code has been sent to your mobile number
            </p>
            <div className={`px-2 sm:px-5 flex justify-center mt-2`}>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                }}
                autoFocus
                className={`w-[70%] sm:w-[60%] mx-auto p-3 outline-orange-600 border border-slate-400 shadow rounded mb-4`}
              />
            </div>
            <div className={`flex flex-col w-full items-center justify-center`}>
              <button
                onClick={handleVerifyCode}
                disabled={verificationLoading}
                className={`w-[160px] mt-3 transition-opacity duration-500 ${
                  verificationLoading ? "opacity-60" : "opacity-100"
                } flex items-center justify-center cursor-pointer bg-orange-700 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded`}
              >
                Verify
              </button>
              <button
                type="button"
                onClick={() => sendVerification(form.phone)}
                className={`text-blue-600`}
              >
                {recaptchaLoading ? (
                  <AiOutlineLoading className={`animate-spin`} />
                ) : (
                  "Didn't get?"
                )}
              </button>
            </div>
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
          <h2 className={`font-gotham mt-5 text-md`}>Food You Love</h2>
          <form
            className={`w-full flex flex-col h-full items-center px-5 pt-2 mt-2`}
          >
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            {(user && !user.username) || (user && !user.email) ? (
              <>
                <h4 className={`text-xs font-gothamThin`}>Additional Info</h4>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`sm:w-[400px] w-[280px] animate__animated animate__shakeX p-2 outline-orange-600 border border-slate-400 shadow rounded mb-4`}
                />
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`sm:w-[400px] w-[280px] animate__animated animate__shakeX p-2 outline-orange-600 border border-slate-400 shadow rounded mb-4`}
                />
                <div>
                  <input
                    type="text"
                    placeholder="Referral Code (Optional)"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    className={`sm:w-[400px] w-[280px] animate__animated animate__shakeX p-2 outline-orange-600 border border-slate-400 shadow rounded`}
                  />
                  <p className={`font-gothamLight text-[10px] mb-4`}>
                    Referral Code (optional)
                  </p>
                </div>
              </>
            ) : (
              <input
                type="tel"
                placeholder="Enter Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`sm:w-[400px] w-[280px] p-2 outline-orange-600 border border-slate-400 shadow rounded mb-4`}
              />
            )}
            <div className={`w-[80%] mx-auto`}>
              <div ref={recaptchaContainerRef}>
                <div id="recaptcha-div"></div>
              </div>
              <button
                onClick={(e) => {
                  if (user) handleUpdateDetails();
                  else handleSubmit(e);
                }}
                disabled={loading}
                style={{
                  background:
                    "radial-gradient(circle, rgba(234,88,12,1) 35%, rgba(255,131,0,1) 100%)",
                }}
                className={`mt-3 w-full uppercase transition-opacity duration-500 ${
                  loading ? "opacity-80" : "opacity-100"
                } flex items-center justify-center  mx-auto p-3 hover:opacity-[0.7] text-slate-100 rounded-md shadow-md`}
              >
                {loading ? (
                  <AiOutlineLoading className={`animate-spin`} />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
            {/*
              <div className={`w-[80%] mx-auto mt-4`}>
                <button
                  onClick={handleFacebookLogin}
                  className="flex items-center justify-center shadow uppercase h-12 mt-3 text-white w-full rounded bg-blue-600 hover:bg-blue-700"
                >
                  <ImFacebook2 className={`text-white text-xl ml-3 mr-auto`} />
                  <span className={`text-gothamMedium text-sm mr-auto`}>
                    Log In With Facebook
                  </span>
                </button>
              </div>
              */}

            {/*
              <p className={`text-md font-gothamBook mt-2`}>
                <span>Don't Have an Account, </span>
                <Link href="/register">
                  <a className={`text-blue-600 hover:text-blue-700`}>Register</a>
                </Link>
              </p>
              */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
