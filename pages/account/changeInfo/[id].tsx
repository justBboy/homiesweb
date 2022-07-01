import { getIdToken, signInWithCustomToken } from "firebase/auth";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import Loader from "../../../components/Loader";
import useFirebaseAuth from "../../../features/hooks/useFirebaseAuth";
import axios from "../../../libs/axios";
import { auth } from "../../../libs/Firebase";

const ChangeInfo: NextPage = () => {
  const alert = useAlert();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { id } = router.query;
  const [error, setError] = useState("");
  const { user, completed } = useFirebaseAuth();

  useEffect(() => {
    (async () => {
      if (auth.currentUser && id) {
        setLoading(true);
        const token = await getIdToken(auth.currentUser);
        const res = await axios.post("/users/changeDetails/verifyToken", {
          utoken: token,
          token: id,
        });
        console.log(res.data);
        if (res.data.error) {
          setLoading(false);
          console.log("error", res.data.error);
          return setError(res.data.error.toString());
        }
        try {
          await signInWithCustomToken(auth, res.data.loginToken);
          alert.success("Successfully Changed Details");
          setLoading(false);
          router.push("/");
        } catch (err) {
          console.log(err);
          setError(
            "Could Not Log In Automatically, please log out and log in manually to see changes"
          );
        }
      }
    })();
  }, [completed && user]);

  if (error) {
    return (
      <div className={`flex items-center justify-center w-screen h-screen`}>
        <p className={`text-md`}>
          {error},
          <Link href="/">
            <span className={`font-bold text-orange-600 ml-2 cursor-pointer `}>
              Return Home
            </span>
          </Link>
        </p>
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

export default ChangeInfo;
