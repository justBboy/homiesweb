import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  AiOutlineInfoCircle,
  AiOutlineLoading,
  AiOutlineLogout,
} from "react-icons/ai";
import { MdEdit } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";
import { Header } from "../../components";
import ConfirmModal from "../../components/ConfirmModal";
import { GrFormNext } from "react-icons/gr";
import useFirebaseAuth from "../../features/hooks/useFirebaseAuth";
import Loader from "../../components/Loader";
import { useAlert } from "react-alert";
import { useRouter } from "next/router";
import axios from "../../libs/axios";
import { auth } from "../../libs/Firebase";
import { getIdToken, updateProfile } from "firebase/auth";
import Head from "next/head";
export type accountFormErrors = {
  username: string | undefined;
  phoneNumber: string | undefined;
  email: string | undefined;
};

export type accountForm = {
  username: { v: string; active: boolean };
  phoneNumber: { v: string; active: boolean };
  email: { v: string; active: boolean };
  errors: accountFormErrors | null;
};

const Account = () => {
  const alert = useAlert();
  const router = useRouter();
  const { user, completed } = useFirebaseAuth();
  const [form, setForm] = useState<accountForm>({
    email: { v: "", active: false },
    phoneNumber: { v: "", active: false },
    username: { v: "", active: false },
    errors: null,
  });
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState("");

  const handleFormChange = (key: string, v: string | number) => {
    setForm({ ...form, [key]: { ...(form as any)[key as string], v } });
  };

  const resetForm = () => {
    setForm({
      email: { v: form.email.v, active: false },
      phoneNumber: { v: form.phoneNumber.v, active: false },
      username: { v: form.username.v, active: false },
      errors: null,
    });
  };

  const handleUpdate = async () => {
    setError("");
    if (user && auth.currentUser) {
      setSubmitLoading(true);
      if (form.username.v !== user.username) {
        await updateProfile(auth.currentUser, {
          displayName: form.username.v,
        });
        alert.success("User name changed");
      }
      if (
        form.email.v !== user.email ||
        form.phoneNumber.v !== `0${user.phone?.substring(4)}`
      ) {
        try {
          const token = await getIdToken(auth.currentUser);
          const res = await axios.post("/users/changeDetails", {
            token,
            email: form.email.v,
            phoneNumber: form.phoneNumber.v,
          });
          if (res.data.error) {
            setError(res.data.error);
            setSubmitLoading(false);
            return;
          }
          alert.success(
            `Email has been sent to ${user.email}, follow instructions to change details`
          );
        } catch (err) {
          console.log(err);
          setError("There was an error, please try again");
        }
      }
      resetForm();
      setSubmitLoading(false);
    } else {
      setError("No Authenticated User");
    }
  };

  useEffect(() => {
    if (error) alert.error(error);
  }, [error]);

  useEffect(() => {
    if (completed && !user) {
      alert.error("Log In Before Checking Account");
      router.push("/login?next=/account");
    }
    if (completed && user) {
      setForm({
        email: { v: user.email || "", active: false },
        phoneNumber: {
          v: `0${user?.phone?.substring(4)}` || "",
          active: false,
        },
        username: { v: user?.username || "", active: false },
        errors: null,
      });
    }
  }, [completed, user]);

  useEffect(() => {
    setChanged(
      form.email.v != user?.email ||
        form.phoneNumber.v != `0${user?.phone?.substring(4)}` ||
        form.username.v != user?.username
    );
  }, [form]);

  if (completed && user) {
    return (
      <div
        className={`w-screen min-h-screen bg-graybg animate__animated animate__fadeIn`}
      >
        <Head>
          <title>Homiezfoods - Account</title>
        </Head>
        <Header withoutSearch />
        <div className={`w-full sm:p-10 p-5`}>
          <div
            className={`w-full shadow p-3 flex justify-between items-center`}
          >
            <h2 className={`font-bold text-md`}>Your Profile</h2>
            <button
              onClick={() => setLogoutConfirm(true)}
              title="Logout"
              className={`w-[35px] h-[35px] bg-red-600 hover:bg-red-700 rounded-[50%] shadow flex justify-center items-center`}
            >
              <AiOutlineLogout color="#eee" className="text-xl" />
            </button>
          </div>
          <div className={`w-full flex min-h-[60vh]`}>
            <div className={`w-[20%] flex flex-col border-r min-h-[60vh]`}>
              <div
                className={`sm:font-md font-sm text-sm sm:text-md 
                bg-slate-200 cursor-pointer p-3 flex items-center hover:bg-slate-200 border-b border-slate-100`}
              >
                <AiOutlineInfoCircle
                  color="#222"
                  className={`text-2xl sm:text-lg mr-1`}
                />
                <span className={`hidden sm:inline`}>Info</span>
              </div>
            </div>
            <div className={`w-[80%]`}>
              <div className={`animate__animated animate__fadeIn`}>
                <div
                  className={`flex flex-col w-full items-center pt-2 sm:p-3`}
                >
                  <h2 className={`font-bold text-md`}>Profile Info</h2>
                  <div className="relative">
                    <label
                      htmlFor="username"
                      className={`ml-3 mt-2 font-sm text-sm text-slate-700`}
                    >
                      {" "}
                      Your Name:
                    </label>
                    <input
                      readOnly={!form.username.active}
                      value={form.username.v}
                      onChange={(e) =>
                        handleFormChange("username", e.target.value)
                      }
                      type="text"
                      className={`outline-none pr-[20px] ${
                        form.username.active
                          ? "opacity-100 text-slate-900"
                          : "opacity-70 text-slate-600"
                      } border border-slate-300 pr-[50px] p-3 w-full relative z-1 mx-3 mb-3 max-w-[380px] rounded-md`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          username: {
                            ...form.username,
                            active: !form.username.active,
                          },
                        });
                      }}
                      className="absolute top-[50%] right-2 translate-y-[-50%] z-5 mt-1 cursor-pointer"
                    >
                      <FiEdit2
                        className={`text-xl hover:text-black`}
                        color="#555"
                      />
                    </button>
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="email"
                      className={`ml-3 mt-2 font-sm text-sm text-slate-700`}
                    >
                      Your Email:
                    </label>
                    <input
                      readOnly={!form.email.active}
                      value={form.email.v}
                      onChange={(e) =>
                        handleFormChange("email", e.target.value)
                      }
                      type="email"
                      className={`outline-none ${
                        form.email.active
                          ? "opacity-100 text-slate-900"
                          : "opacity-70 text-slate-600"
                      } border pr-[50px] border-slate-300 p-3 w-full relative z-1 mx-3 mb-3 max-w-[380px] rounded-md`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          email: {
                            ...form.email,
                            active: !form.email.active,
                          },
                        });
                      }}
                      className="absolute top-[50%] right-2 translate-y-[-50%] z-5 mt-1 cursor-pointer"
                    >
                      <FiEdit2
                        className={`text-xl hover:text-black`}
                        color="#555"
                      />
                    </button>
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="email"
                      className={`ml-3 mt-2 font-sm text-sm text-slate-700`}
                    >
                      Your Phone:
                    </label>
                    <input
                      readOnly={!form.phoneNumber.active}
                      value={`${
                        form.phoneNumber.v.startsWith("+")
                          ? "0" + form.phoneNumber.v.substring(4)
                          : form.phoneNumber.v
                      }`}
                      onChange={(e) =>
                        handleFormChange("phoneNumber", e.target.value)
                      }
                      type="tel"
                      className={`outline-none ${
                        form.phoneNumber.active
                          ? "opacity-100 text-slate-900"
                          : "opacity-70 text-slate-600"
                      } border pr-[50px] border-slate-300 p-3 w-full relative z-1 mx-3 mb-3 max-w-[380px] rounded-md`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          phoneNumber: {
                            ...form.phoneNumber,
                            active: !form.phoneNumber.active,
                          },
                        });
                      }}
                      className="absolute top-[50%] right-2 translate-y-[-50%] z-5 mt-1 cursor-pointer"
                    >
                      <FiEdit2
                        className={`text-xl hover:text-black`}
                        color="#555"
                      />
                    </button>
                  </div>
                  <button
                    onClick={handleUpdate}
                    disabled={submitLoading || !changed}
                    className={`${
                      changed || submitLoading
                        ? "opacity-100 cursor-pointer hover:bg-yellow-700"
                        : "opacity-60 cursor-not-allowed"
                    } flex items-center justify-center p-3 w-full max-w-[380px] bg-yellow-600 text-slate-100 rounded-md shadow-md`}
                  >
                    {submitLoading ? (
                      <AiOutlineLoading className={`text-md animate-spin`} />
                    ) : (
                      <>
                        <span className={`mx-auto`}>update</span>
                        <span className={`ml-auto`}>
                          <GrFormNext
                            className={`text-slate-100 text-xl bg-slate-100 rounded`}
                          />
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <ReauthModal setShow={setReAuthShow} show={reAuthShow} /> */}
        <ConfirmModal
          onConfirm={() => {}}
          confirmText="Are you sure you want to logout From your account?"
          loading={false}
          setShow={setLogoutConfirm}
          show={logoutConfirm}
        />
      </div>
    );
  }
  return (
    <div
      className={`w-full h-screen flex opacity-40 justify-center items-center`}
    >
      <Loader />
    </div>
  );
};

export default Account;
