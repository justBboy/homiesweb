import { onAuthStateChanged, Unsubscribe, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../libs/Firebase";
import { userType } from "../auth/authSlice";

const useFirebaseAuth = () => {
  const [completed, setCompleted] = useState(false);
  const [user, setUser] = useState<userType | null>(null);

  const onStateChanged = async (user: User | null) => {
    if (user) {
      try {
        const idTokenResult = await user.getIdTokenResult();
        const u: userType = {
          uid: user.uid,
          email: user.email,
          phone: user.phoneNumber,
          username: user.displayName,
          agent: Boolean(idTokenResult.claims.agent),
          admin: Boolean(idTokenResult.claims.admin),
          superadmin: Boolean(idTokenResult.claims.superadmin),
        };
        setUser(u);
        setCompleted(true);
      } catch (err) {
        console.log("user state changed err ============> ", err);
      }
    } else {
      setUser(user);
      setCompleted(true);
    }
  };
  useEffect(() => {
    let unsubscribe: Unsubscribe;
    (async () => {
      unsubscribe = await onAuthStateChanged(auth, onStateChanged);
    })();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { user, completed };
};

export default useFirebaseAuth;
