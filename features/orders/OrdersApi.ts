import { getIdToken } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { auth, db } from "../../libs/Firebase";
import axios from "../../libs/axios";

const numInPage = 12;
export const getOrdersApi = async (
  page: number,
  userId: string,
  lastDoc: Document | null,
  lastUpdate: number
) => {
  try {
    if (!lastDoc || page <= 1) {
      const q = query(
        collection(db, "orders"),
        where("createdBy", "==", userId),
        orderBy("createdAt", "desc"),
        limit(numInPage)
      );
      const matched = await getDocs(q);
      const lastDoc = matched.docs[matched.docs.length - 1];
      return {
        data: matched.docs.map((d) => d.data()),
        lastDoc,
        lastUpdate,
        page,
      };
    } else {
      const q = query(
        collection(db, "orders"),
        where("createdBy", "==", userId),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(numInPage)
      );
      const matched = await getDocs(q);
      return {
        data: matched.docs.map((d) => d.data()),
        page,
        lastUpdate,
        lastDoc: matched.docs[matched.docs.length - 1],
      };
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const placeOrderManualApi = async (
  foods: { id: string; quantity: number }[]
) => {
  try {
    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      const res = await axios.post("/users/orderAndPayManually", {
        token,
        foods,
      });
      if (res.data.error) throw res.data.error;
      return res.data;
    } else {
      throw "Log In First";
    }
  } catch (err) {
    console.log("order err ===========> ", err);
    throw err;
  }
};
