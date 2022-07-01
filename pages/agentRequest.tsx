import React, { useEffect, useRef, useState } from "react";
import { Header } from "../components";
import { GrFormDown } from "react-icons/gr";
import { MdOutlineNavigateNext } from "react-icons/md";
import { AiOutlineClose, AiOutlineLoading } from "react-icons/ai";
import axios from "../libs/axios";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import { useRouter } from "next/router";
import { getIdToken } from "firebase/auth";
import { auth } from "../libs/Firebase";
import { validateEmail, validatePhone } from "../features/validators";
import Image from "next/image";
import Loader from "../components/Loader";

export type reqFormError = {
  firstName: string | undefined;
  lastName: string | undefined;
  phoneNumber: string | undefined;
  email: string | undefined;
};

export type reqForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  error: reqFormError | null;
};
const AgentRequest = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, completed } = useFirebaseAuth();
  const [form, setForm] = useState<reqForm>({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    error: null,
  });
  const [loading, setLoading] = useState(false);
  const [completeMessage, setCompleteMessage] = useState("");
  const [formShown, setFormShown] = useState(false);
  const [error, setError] = useState("");

  const handleToggleShowForm = () => {
    setFormShown((v) => !v);
  };

  const handleFormChange = (key: string, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  const cleanForm = () => {
    setForm({
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      error: null,
    });
  };

  const handleValidate = () => {
    let error = "";
    if (!form.firstName || !form.lastName)
      error = "First name or last name isn't set";
    else if (validatePhone(form.phoneNumber))
      error = "Phone number pattern incorrect";
    else if (validateEmail(form.email)) error = "Email pattern incorrect";
    return error;
  };

  const handleSendRequest = async () => {
    setError("");
    setCompleteMessage("");
    const error = handleValidate();
    if (error) {
      setError(error);
      return;
    }
    if (auth.currentUser) {
      setLoading(true);
      const token = await getIdToken(auth.currentUser);
      const data = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        token,
      };
      try {
        const res = await axios.post("/customers/agentRequest", data);
        if (res.data.error) {
          setError(res.data.error);
          setLoading(false);
          return;
        }
        setCompleteMessage(
          "Your request has been sent successfully, you will receive a call soon"
        );
        setLoading(false);
        cleanForm();
      } catch (err) {
        console.log(err);
        setLoading(false);
        setError("There was an error, please try again");
      }
    } else {
      setError("You must be signed in first");
    }
  };

  useEffect(() => {
    if (!emailRef.current?.checkValidity()) {
      emailRef.current?.reportValidity();
    }
  }, [form.email, form.phoneNumber]);

  useEffect(() => {
    if (completed && !user) {
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } else if (completed && user?.agent) {
      router.push("/");
    }
  }, [user, completed]);
  if (completed && user) {
    return (
      <div className={`w-[100vw] overflow-x-hidden min-h-[100vh] bg-graybg`}>
        <div
          style={{
            background:
              "radial-gradient(circle, rgba(234,88,12,1) 35%, rgba(255,131,0,1) 100%)",
          }}
          className={`w-full transition-max-h z-10 h-[100vh] duration-1000 overflow-hidden`}
        >
          <Header withoutSearch>
            <div
              className={`w-full flex md:flex-row flex-col items-center h-full`}
            >
              <div
                className={`sm:flex hidden w-1/2 aspect-[0.980/1] justify-center relative`}
              >
                <Image
                  layout="fill"
                  src="/v1656685002/pizza-slice_jyugt1.png"
                  alt="Pizza slice image"
                />
              </div>
              <div
                className={`relative flex flex-col items-center justify-center h-full w-full md:w-1/2 p-5`}
              >
                <h2
                  className={`text-5xl font-gothamBold font-bold text-center tracking-wider text-slate-100 w-[80%] leading-[4.5rem]`}
                >
                  Share And Earn With Us
                </h2>
                <p
                  className={`text-md font-gothamMedium tracking-wider text-center text-slate-200 w-[80%] leading-[4.5rem]`}
                >
                  Share A Link to buy food and earn from it
                </p>
                <button
                  onClick={handleToggleShowForm}
                  type="button"
                  className={`flex items-center justify-center w-[80%] p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}
                >
                  <span className={`mx-auto`}>Proceed to Form</span>
                  <span className={`ml-auto`}>
                    <GrFormDown
                      className={`text-slate-100 text-xl bg-slate-100 rounded`}
                    />
                  </span>
                </button>
                <div
                  className={`${
                    formShown
                      ? "visible opacity-1 translate-y-[0px]"
                      : "opacity-0 translate-y-[20px] invisible"
                  } transition-all absolute w-[90%] sm:w-[80%] bg-slate-50 rounded min-h-[80%]`}
                >
                  <div className={`relative w-full h-full`}>
                    <a
                      href="#close"
                      onClick={() => {
                        setFormShown(false);
                      }}
                    >
                      <AiOutlineClose
                        className={`text-xl text-slate-400 absolute right-4 top-2`}
                      />
                    </a>

                    <form className={`w-full pt-10 p-5`}>
                      {completeMessage && (
                        <div className={`p-2 m-3 bg-green-600 rounded`}>
                          <p
                            className={`font-gothamBlack text-center text-white text-md`}
                          >
                            {completeMessage}
                          </p>
                        </div>
                      )}
                      {error && (
                        <div className={`p-2 m-3 bg-red-400 rounded`}>
                          <p
                            className={`text-md font-gothamBlack text-center text-white`}
                          >
                            {error}
                          </p>
                        </div>
                      )}
                      <div>
                        <label
                          htmlFor="First Name"
                          className={`font-bold text-slate-800`}
                        >
                          First Name*
                        </label>
                        <input
                          type="text"
                          placeholder="E.g John"
                          value={form.firstName}
                          onChange={(e) =>
                            handleFormChange("firstName", e.target.value)
                          }
                          className={
                            "w-full outline-none p-2 border border-slate-200 rounded font-md font-gotham"
                          }
                        />
                      </div>
                      <div className={`mt-3`}>
                        <label
                          htmlFor="Last Name"
                          className={`font-bold text-slate-800`}
                        >
                          Last Name *
                        </label>
                        <input
                          type="text"
                          placeholder="E.g Appiah"
                          value={form.lastName}
                          onChange={(e) =>
                            handleFormChange("lastName", e.target.value)
                          }
                          className={
                            "w-full outline-none p-2 border border-slate-200 rounded font-md font-gotham"
                          }
                        />
                      </div>
                      <div className={`mt-3`}>
                        <label
                          htmlFor="PhoneNumber"
                          className={`font-bold text-slate-800`}
                        >
                          Phone Number*
                        </label>
                        <input
                          type="tel"
                          placeholder="E.g 024*********"
                          ref={phoneRef}
                          value={form.phoneNumber}
                          onChange={(e) =>
                            handleFormChange("phoneNumber", e.target.value)
                          }
                          className={
                            "w-full outline-none p-2 border border-slate-200 rounded font-md font-gotham"
                          }
                        />
                      </div>
                      <div className={`mt-3`}>
                        <label
                          htmlFor="Email"
                          className={`font-bold text-slate-800`}
                        >
                          Email*
                        </label>
                        <input
                          ref={emailRef}
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            handleFormChange("email", e.target.value)
                          }
                          placeholder="E.g *@*.*"
                          className={
                            "w-full outline-none p-2 border border-slate-200 rounded font-md font-gotham"
                          }
                        />
                      </div>
                      <button
                        onClick={handleSendRequest}
                        disabled={loading}
                        className={`mt-3 flex items-center justify-center w-full p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}
                      >
                        {loading ? (
                          <AiOutlineLoading
                            className={`text-2xl animate-spin`}
                            color="black"
                          />
                        ) : (
                          <>
                            <span className={`mx-auto`}>Submit</span>
                            <span className={`ml-auto`}>
                              <MdOutlineNavigateNext
                                className={`text-slate-100 text-xl`}
                              />
                            </span>
                          </>
                        )}
                      </button>
                      <p
                        className={`font-md font-gothamMedium text-slate-600 text-center mt-3`}
                      >
                        You will be called to complete the procedure to becoming
                        an agent with us
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Header>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background:
          "radial-gradient(circle, rgba(234,88,12,1) 35%, rgba(255,131,0,1) 100%)",
      }}
      className={`w-full h-screen flex justify-center items-center`}
    >
      <Loader />
    </div>
  );
};

export default AgentRequest;
