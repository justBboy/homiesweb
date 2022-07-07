export const appGlobalId = "global";
export const phoneNumberPattern = /^[0]?\d{9}$/;
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { orderType } from "./types";
import fetch from "cross-fetch";
import Expo, { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import expo from "../config/expo";

export const updateOrderOnDocs = () => {};

export const generateRandomNumber = () => {
  return Math.floor(Math.random() * 10);
};

export const getNameInitials = (name: string) => {
  const splt = name.split(" ");
  console.log(splt);
  return splt.length > 1
    ? `${splt[0][0]}${splt[splt.length - 1][0] || splt[0][1]}`
    : `${splt[0][0]}${splt[0][1]}`;
};

export const getDistanceFromUs = async (location: string) => {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${"sunyani fiapre"}&destinations=${encodeURIComponent(
      location
    )}&units=metric&key=${process.env.GOOGLE_API_KEY}`
  );
  const data = await res.json();
  if (data.rows) {
    return {
      distance: (data.rows[0]?.elements[0] as any)?.distance || 0,
      duration: (data.rows[0]?.elements[0] as any)?.duration || 0,
    };
  }
  return null;
};

export const generateOrderId = async (uid: string) => {
  const umatches = await admin
    .firestore()
    .collection("users")
    .where("uid", "==", uid)
    .get();
  if (umatches.empty) throw "User Not Available";
  const user = umatches.docs[0].data();
  const getId = () => {
    let randomInts4 = "";
    for (let i = 0; i < 4; i++) {
      randomInts4 += generateRandomNumber().toString();
    }
    let id = getNameInitials(user.username) + randomInts4;
    return id;
  };
  let id = getId();
  let tRes = await admin
    .firestore()
    .collection("orders")
    .where("id", "==", id)
    .get();
  while (!tRes.empty) {
    id = getId();
    tRes = await admin
      .firestore()
      .collection("orders")
      .where("id", "==", id)
      .get();
  }
  return id;
};

export const customSendPushNotification = async (
  uid: string,
  message: string,
  title: string,
  data: any | undefined = undefined
) => {
  try {
    const tokenRes = await admin
      .firestore()
      .collection("expoTokens")
      .where("uid", "==", uid)
      .get();
    if (!tokenRes.empty) {
      let messages: ExpoPushMessage[] = [];
      const pushTokens: string[] = [];
      let tickets: ExpoPushTicket[] = [];

      for (const tokenItem of tokenRes.docs) {
        const data = tokenItem.data() as any;
        if (Expo.isExpoPushToken(data.token)) {
          pushTokens.push(data.token);
        }
      }

      for (const token of pushTokens) {
        messages.push({
          to: token,
          body: `${message}`,
          title: title,
          sound: "default",
          ...(data && { data }),
        });
      }

      const chunks = expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (err) {
          console.log("error sending push notification => ", err);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const addOrderOnFood = async (food: {
  id: string;
  itemCategory: string;
  price: number;
  quantity: number;
}) => {
  try {
    const today = new Date();

    const matches = await admin
      .firestore()
      .collection("foods")
      .where("id", "==", food.id)
      .get();
    for (const f of matches.docs) {
      f.ref.set(
        {
          orders: admin.firestore.FieldValue.increment(1),
          //month orders
          [`orders${today.getMonth() + 1}-${today.getFullYear()}Count`]:
            admin.firestore.FieldValue.increment(1),
          //year orders all
          [`orders${today.getFullYear()}Count`]:
            admin.firestore.FieldValue.increment(1),
          //today orders all
          [`orders${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}Count`]:
            admin.firestore.FieldValue.increment(1),
          //deletes
          // deleting last Month
          [`orders${today.getMonth() <= 0 ? 12 : today.getMonth()}-${
            today.getFullYear() - 1
          }Count`]: admin.firestore.FieldValue.delete(),
          // deleting last 5 years
          [`orders${today.getFullYear() - 5}Count`]:
            admin.firestore.FieldValue.delete(),
          // deleting 30th months, yesterday
          [`orders${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
            today.getMonth() <= 0 ? 12 : today.getMonth()
          }${today.getFullYear() - 1}Count`]:
            admin.firestore.FieldValue.delete(),
          // deleting 31st months, yesterday
          [`orders${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
            today.getMonth() <= 0 ? 12 : today.getMonth()
          }${today.getFullYear() - 1}Count`]:
            admin.firestore.FieldValue.delete(),
          // deleting february 28 months, yesterday
          [`orders${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
            today.getMonth() <= 0 ? 12 : today.getMonth()
          }${today.getFullYear() - 1}Count`]:
            admin.firestore.FieldValue.delete(),
          // deleting february 29, yesterday
          [`orders${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
            today.getMonth() <= 0 ? 12 : today.getMonth()
          }${today.getFullYear() - 1}Count`]:
            admin.firestore.FieldValue.delete(),
        },
        { merge: true }
      );
      try {
        f.ref.set({}, { merge: true });
      } catch (err) {}
    }
  } catch (err) {
    console.log("on food error ============> ", err);
  }
};

const deleteOrderOnFood = async (food: {
  id: string;
  itemCategory: string;
  price: number;
  quantity: number;
}) => {
  try {
    const today = new Date();
    const matches = await admin
      .firestore()
      .collection("foods")
      .where("id", "==", food.id)
      .get();
    for (const f of matches.docs)
      await admin
        .firestore()
        .collection("foods")
        .doc(f.id)
        .set(
          {
            orders: admin.firestore.FieldValue.increment(-1),
            //month
            [`orders${today.getMonth() + 1}-${today.getFullYear()}Count`]:
              admin.firestore.FieldValue.increment(-1),
            //year
            [`orders${today.getFullYear()}Count`]:
              admin.firestore.FieldValue.increment(-1),
            //today
            [`orders${today.getDate()}-${
              today.getMonth() + 1
            }-${today.getFullYear()}Count`]:
              admin.firestore.FieldValue.increment(-1),
          },
          { merge: true }
        );
  } catch (err) {
    console.log("on food error ============> ", err);
  }
};

const addSaleOnFood = async (food: any) => {
  try {
    const today = new Date();
    const matches = await admin
      .firestore()
      .collection("foods")
      .where("id", "==", food.id)
      .get();
    for (const f of matches.docs)
      await admin
        .firestore()
        .collection("foods")
        .doc(f.id)
        .set(
          {
            sales: admin.firestore.FieldValue.increment(
              food.price * food.quantity
            ),
            //month
            [`sales${today.getMonth() + 1}-${today.getFullYear()}`]:
              admin.firestore.FieldValue.increment(food.price * food.quantity),
            //year
            [`sales${today.getFullYear()}`]:
              admin.firestore.FieldValue.increment(food.price * food.quantity),
            //today
            [`sales${today.getDate()}-${
              today.getMonth() + 1
            }-${today.getFullYear()}`]: admin.firestore.FieldValue.increment(
              food.price * food.quantity
            ),
            //deletes
            // deleting last Month
            [`sales${today.getMonth() <= 0 ? 12 : today.getMonth()}-${
              today.getFullYear() - 1
            }`]: admin.firestore.FieldValue.delete(),
            // deleting last 5 years
            [`sales${today.getFullYear() - 5}`]:
              admin.firestore.FieldValue.delete(),
            // deleting 30th months
            [`sales-${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
              today.getMonth() <= 0 ? 12 : today.getMonth()
            }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
            // deleting 31st months
            [`sales-${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
              today.getMonth() <= 0 ? 12 : today.getMonth()
            }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
            // deleting february 28
            [`sales-${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
              today.getMonth() <= 0 ? 12 : today.getMonth()
            }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
            // deleting february 29
            [`sales-${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
              today.getMonth() <= 0 ? 12 : today.getMonth()
            }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
          },
          { merge: true }
        );
  } catch (err) {
    console.log("on food error ============> ", err);
  }
};

const addOrderFailureOnFood = async (food: {
  id: string;
  itemCategory: string;
  price: number;
  quantity: number;
}) => {
  try {
    const today = new Date();
    const matches = await admin
      .firestore()
      .collection("foods")
      .where("id", "==", food.id)
      .get();
    for (const f of matches.docs)
      await admin
        .firestore()
        .collection("foods")
        .doc(f.id)
        .set(
          {
            failed: admin.firestore.FieldValue.increment(1),
            [`failed${today.getFullYear()}`]:
              admin.firestore.FieldValue.increment(1),
            //month
            [`failed${today.getMonth() + 1}-${today.getFullYear()}`]:
              admin.firestore.FieldValue.increment(1),
            //year
            [`failed${today.getFullYear()}`]:
              admin.firestore.FieldValue.increment(1),
            //today
            [`failed${today.getDate()}-${
              today.getMonth() + 1
            }-${today.getFullYear()}`]: admin.firestore.FieldValue.increment(1),
          },
          { merge: true }
        );
  } catch (err) {
    console.log("order failure error ==========> ", err);
  }
};

const updateOrderFailedOnCategory = async (
  categoryId: string,
  quantity: number,
  sales: number
) => {
  try {
    const today = new Date();
    const matches = await admin
      .firestore()
      .collection("foodCategories")
      .where("id", "==", categoryId)
      .get();
    if (!matches.empty) {
      const doc = matches.docs[0];
      doc.ref.set(
        {
          failedOrders: admin.firestore.FieldValue.increment(quantity),
          [`failed${today.getFullYear()}`]:
            admin.firestore.FieldValue.increment(1),
          [`failed${today.getFullYear()}`]:
            admin.firestore.FieldValue.increment(1),
          //month
          [`failed${today.getMonth() + 1}-${today.getFullYear()}`]:
            admin.firestore.FieldValue.increment(1),
          //year
          [`failed${today.getFullYear()}`]:
            admin.firestore.FieldValue.increment(1),
          //today
          [`failed${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}`]: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.log("update order on category error ==============> ", err);
  }
};

const addSalesToCategory = async (categoryId: string, sales: number) => {
  const today = new Date();
  const matches = await admin
    .firestore()
    .collection("foodCategories")
    .where("id", "==", categoryId)
    .get();
  if (!matches.empty) {
    const doc = matches.docs[0];
    doc.ref.set(
      {
        sales: admin.firestore.FieldValue.increment(sales),
        //month
        [`sales${today.getMonth() + 1}-${today.getFullYear()}`]:
          admin.firestore.FieldValue.increment(sales),
        //year
        [`sales${today.getFullYear()}`]:
          admin.firestore.FieldValue.increment(sales),
        //today
        [`sales${today.getDate()}-${
          today.getMonth() + 1
        }-${today.getFullYear()}`]: admin.firestore.FieldValue.increment(sales),

        //deletes
        // deleting last Month
        [`sales${today.getMonth() <= 0 ? 12 : today.getMonth()}-${
          today.getFullYear() - 1
        }`]: admin.firestore.FieldValue.delete(),
        // deleting last 5 years
        [`sales${today.getFullYear() - 5}`]:
          admin.firestore.FieldValue.delete(),
        // deleting 30th months
        [`sales${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
          today.getMonth() <= 0 ? 12 : today.getMonth()
        }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
        // deleting 31st months
        [`sales${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
          today.getMonth() <= 0 ? 12 : today.getMonth()
        }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
        // deleting february 28
        [`sales${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
          today.getMonth() <= 0 ? 12 : today.getMonth()
        }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
        // deleting february 29
        [`sales${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
          today.getMonth() <= 0 ? 12 : today.getMonth()
        }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
      },
      { merge: true }
    );
  }
};

const deleteOrderOnCategory = async (
  categoryId: string,
  quantity: number,
  sales: number = 0,
  failed: boolean = false
) => {
  try {
    const today = new Date();
    const doc = await admin
      .firestore()
      .collection("foodCategories")
      .doc(categoryId)
      .get();
    if (doc.exists) {
      if (failed) {
        if (doc.exists)
          doc.ref.set(
            {
              failedOrders: admin.firestore.FieldValue.increment(-quantity),
              //month
              [`failedOrders${today.getMonth() + 1}-${today.getFullYear()}`]:
                admin.firestore.FieldValue.increment(-quantity),
              //year
              [`failedOrders${today.getFullYear()}`]:
                admin.firestore.FieldValue.increment(-quantity),
              //today
              [`failedOrders${today.getDate()}-${
                today.getMonth() + 1
              }-${today.getFullYear()}`]: admin.firestore.FieldValue.increment(
                -quantity
              ),
            },
            { merge: true }
          );
      } else {
        if (doc.exists)
          doc.ref.set(
            {
              ...(sales && {
                sales: admin.firestore.FieldValue.increment(sales),
              }),
              //month
              [`sales${today.getMonth() + 1}-${today.getFullYear()}`]:
                admin.firestore.FieldValue.increment(sales),
              //year
              [`sales${today.getFullYear()}`]:
                admin.firestore.FieldValue.increment(sales),
              //today
              [`sales${today.getDate()}-${
                today.getMonth() + 1
              }-${today.getFullYear()}`]:
                admin.firestore.FieldValue.increment(sales),
            },
            { merge: true }
          );
      }
      await admin
        .firestore()
        .collection("foodCategories")
        .doc(categoryId)
        .set(
          {
            orders: admin.firestore.FieldValue.increment(-quantity),
            //month
            [`orders${today.getMonth() + 1}-${today.getFullYear()}`]:
              admin.firestore.FieldValue.increment(-quantity),
            //year
            [`orders${today.getFullYear()}`]:
              admin.firestore.FieldValue.increment(-quantity),
            //today
            [`orders${today.getDate()}-${
              today.getMonth() + 1
            }-${today.getFullYear()}`]: admin.firestore.FieldValue.increment(
              -quantity
            ),
          },
          { merge: true }
        );
    }
  } catch (err) {
    console.log("update order on category error ==============> ", err);
  }
};

const addOrderToCategory = async (categoryId: string, quantity: number) => {
  try {
    const today = new Date();
    const matches = await admin
      .firestore()
      .collection("foodCategories")
      .where("id", "==", categoryId)
      .get();
    if (!matches.empty) {
      const doc = matches.docs[0];
      doc.ref.set(
        {
          orders: admin.firestore.FieldValue.increment(quantity),
          //month
          [`orders${today.getMonth() + 1}-${today.getFullYear()}`]:
            admin.firestore.FieldValue.increment(quantity),
          //year
          [`orders${today.getFullYear()}`]:
            admin.firestore.FieldValue.increment(quantity),
          //today
          [`orders${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}`]:
            admin.firestore.FieldValue.increment(quantity),

          //deletes
          // deleting last Month
          [`orders${today.getMonth() <= 0 ? 12 : today.getMonth()}-${
            today.getFullYear() - 1
          }`]: admin.firestore.FieldValue.delete(),
          // deleting last 5 years
          [`orders${today.getFullYear() - 5}`]:
            admin.firestore.FieldValue.delete(),
          // deleting 30th months
          [`orders${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
            today.getMonth() <= 0 ? 12 : today.getMonth()
          }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
          // deleting 31st months
          [`orders${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
            today.getMonth() <= 0 ? 12 : today.getMonth()
          }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
          // deleting february 28
          [`orders${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
            today.getMonth() <= 0 ? 12 : today.getMonth()
          }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
          // deleting february 29
          [`orders${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}${
            today.getMonth() <= 0 ? 12 : today.getMonth()
          }${today.getFullYear() - 1}`]: admin.firestore.FieldValue.delete(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.log("add to category error ===========> ", err);
  }
};

const getCategoriesFromOrder = (order: orderType) => {
  const categories: { id: string; totalSales: number; quantity: number }[] = [];
  for (const food of order.items) {
    // storing ordered categories
    const cIndx = categories.findIndex((c) => c.id === food.itemCategory);
    if (cIndx !== -1) {
      const d = categories[cIndx];
      categories[cIndx] = {
        ...categories[cIndx],
        totalSales: d.totalSales + food.price,
        quantity: d.quantity + food.quantity,
      };
    } else {
      categories.push({
        id: food.itemCategory,
        totalSales: food.price,
        quantity: food.quantity,
      });
    }
  }
  return categories;
};

const addOrderToGlobals = async (cSale = false) => {
  const today = new Date();
  try {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("orders")
      .set(
        {
          //
          ordersLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          //all orders
          ordersCount: admin.firestore.FieldValue.increment(1),
          //month orders all
          [`orders${today.getMonth() + 1}-${today.getFullYear()}Count`]:
            admin.firestore.FieldValue.increment(1),
          //year orders all
          [`orders-${today.getFullYear()}Count`]:
            admin.firestore.FieldValue.increment(1),
          //today orders all
          [`orders${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}Count`]:
            admin.firestore.FieldValue.increment(1),
          ...(cSale && {
            customSalesCount: admin.firestore.FieldValue.increment(1),
          }),
          //
          ...(cSale && {
            customSalesLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          }),
          // month custom sales
          ...(cSale && {
            [`customSales${today.getMonth() + 1}-${today.getFullYear()}Count`]:
              admin.firestore.FieldValue.increment(1),
          }),
          // year custom sales
          ...(cSale && {
            [`customSales${today.getFullYear()}Count`]:
              admin.firestore.FieldValue.increment(1),
          }),
          // today custom sales
          ...(cSale && {
            [`customSales${today.getDate()}-${
              today.getMonth() + 1
            }-${today.getFullYear()}Count`]:
              admin.firestore.FieldValue.increment(1),
          }),

          //deletes
          // deleting last Month
          [`orders${today.getMonth() <= 0 ? 12 : today.getMonth()}-${
            today.getFullYear() - 1
          }Count`]: admin.firestore.FieldValue.delete(),
          // deleting last 5 years
          [`orders-${today.getFullYear() - 5}Count`]:
            admin.firestore.FieldValue.delete(),
          // deleting 30th months
          [`orders${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}Count`]:
            admin.firestore.FieldValue.delete(),
          // deleting 31st months
          [`orders${today.getDate() - 1 <= 0 ? 31 : today.getDate() - 1}Count`]:
            admin.firestore.FieldValue.delete(),
          // deleting february 28
          [`orders${today.getDate() - 1 <= 0 ? 28 : today.getDate() - 1}Count`]:
            admin.firestore.FieldValue.delete(),
          // deleting february 29
          [`orders${today.getDate() - 1 <= 0 ? 29 : today.getDate() - 1}Count`]:
            admin.firestore.FieldValue.delete(),

          // deleting last Month
          [`customSales${today.getMonth() <= 0 ? 12 : today.getMonth()}-${
            today.getFullYear() - 1
          }Count`]: admin.firestore.FieldValue.delete(),
          // deleting last 5 years
          [`customSales${today.getFullYear() - 5}Count`]:
            admin.firestore.FieldValue.delete(),
          // deleting 30th months
          [`customSales${
            today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1
          }Count`]: admin.firestore.FieldValue.delete(),
          // deleting 31st months
          [`customSales${
            today.getDate() - 1 <= 0 ? 31 : today.getDate() - 1
          }Count`]: admin.firestore.FieldValue.delete(),
          // deleting february 28
          [`customSales${
            today.getDate() - 1 <= 0 ? 28 : today.getDate() - 1
          }Count`]: admin.firestore.FieldValue.delete(),
          // deleting february 29
          [`customSales${
            today.getDate() - 1 <= 0 ? 29 : today.getDate() - 1
          }Count`]: admin.firestore.FieldValue.delete(),
        },
        { merge: true }
      );
  } catch (err) {
    console.log("order to globals ===========> ", err);
  }
};

const deleteOrderToGlobals = async (cSale = false) => {
  const today = new Date();
  try {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("orders")
      .set(
        {
          //
          ordersLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          //all orders
          ordersCount: admin.firestore.FieldValue.increment(-1),
          //month orders all
          [`orders${today.getMonth() + 1}-${today.getFullYear()}Count`]:
            admin.firestore.FieldValue.increment(-1),
          //year orders all
          [`orders-${today.getFullYear()}Count`]:
            admin.firestore.FieldValue.increment(-1),
          //today orders all
          [`orders${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}Count`]:
            admin.firestore.FieldValue.increment(-1),
          ...(cSale && {
            customSalesCount: admin.firestore.FieldValue.increment(-1),
          }),
          //
          ...(cSale && {
            customSalesLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          }),
          // month custom sales
          ...(cSale && {
            [`customSales${today.getMonth() + 1}-${today.getFullYear()}Count`]:
              admin.firestore.FieldValue.increment(-1),
          }),
          // year custom sales
          ...(cSale && {
            [`customSales${today.getFullYear()}Count`]:
              admin.firestore.FieldValue.increment(-1),
          }),
          // today custom sales
          ...(cSale && {
            [`customSales${today.getDate()}-${
              today.getMonth() + 1
            }-${today.getFullYear()}Count`]:
              admin.firestore.FieldValue.increment(-1),
          }),
        },
        { merge: true }
      );
  } catch (err) {
    console.log("order to globals ===========> ", err);
  }
};

const addOrderFailureToGlobals = async () => {
  const today = new Date();
  try {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("orders")
      .set(
        {
          ordersLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          // today failed
          [`orders${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}FailedCount`]:
            admin.firestore.FieldValue.increment(1),
          // month failed
          [`orders${today.getMonth() + 1}-${today.getFullYear()}FailedCount`]:
            admin.firestore.FieldValue.increment(1),
          // year failed
          [`orders${today.getFullYear()}FailedCount`]:
            admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
  } catch (err) {
    console.log("order failure to globals ==========> ", err);
  }
};

const addOrderCompletedToGlobals = async (price: number) => {
  const today = new Date();
  try {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("orders")
      .set(
        {
          ordersLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          //today orders completed
          [`orders${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}CompletedCount`]:
            admin.firestore.FieldValue.increment(1),
          //today sales made
          [`sales${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}Made`]:
            admin.firestore.FieldValue.increment(price),
          //month sales made
          [`sales${today.getMonth() + 1}-${today.getFullYear()}Made`]:
            admin.firestore.FieldValue.increment(price),
          //year sales made
          [`sales${today.getFullYear()}Made`]:
            admin.firestore.FieldValue.increment(price),
          //month orders completed
          [`orders${
            today.getMonth() + 1
          }-${today.getFullYear()}CompletedCount`]:
            admin.firestore.FieldValue.increment(1),

          //deleting
          // deleting last Month
          [`sales${today.getMonth() <= 0 ? 12 : today.getMonth()}-${
            today.getFullYear() - 1
          }Made`]: admin.firestore.FieldValue.delete(),
          [`orders${today.getMonth() <= 0 ? 12 : today.getMonth()}-${
            today.getFullYear() - 1
          }CompletedCount`]: admin.firestore.FieldValue.delete(),
          // deleting last 5 years
          [`sales${today.getFullYear() - 5}Made`]:
            admin.firestore.FieldValue.delete(),
          // deleting 30th months
          [`sales${today.getDate() - 1 <= 0 ? 30 : today.getDate() - 1}Made`]:
            admin.firestore.FieldValue.delete(),
          // deleting 31st months
          [`sales${today.getDate() - 1 <= 0 ? 31 : today.getDate() - 1}Made`]:
            admin.firestore.FieldValue.delete(),
          // deleting february 28
          [`sales${today.getDate() - 1 <= 0 ? 28 : today.getDate() - 1}Made`]:
            admin.firestore.FieldValue.delete(),
          // deleting february 29
          [`sales${today.getDate() - 1 <= 0 ? 29 : today.getDate() - 1}Made`]:
            admin.firestore.FieldValue.delete(),
        },
        { merge: true }
      );
  } catch (err) {
    console.log("order to globals err ============> ", err);
  }
};

export const onOrderDeleted = async (data: orderType) => {
  const categories = getCategoriesFromOrder(data);
  for (const food of data.items) {
    await deleteOrderOnFood(food);
  }
  for (const category of categories)
    await deleteOrderOnCategory(
      category.id,
      category.quantity,
      category.totalSales
    );

  await deleteOrderToGlobals(data.csale);
};

export const onOrderAdded = async (data: orderType) => {
  const categories = getCategoriesFromOrder(data);
  console.log("categories ======> ", categories);
  for (const food of data.items) {
    await addOrderOnFood(food);
    if (data.csale) {
      addSaleOnFood(food);
      addSalesToCategory(food.itemCategory, food.price * food.quantity);
    }
  }
  for (const category of categories) {
    await addOrderToCategory(category.id, category.quantity);
  }
  if (data.csale) {
    await addOrderToGlobals(true);
    await addOrderCompletedToGlobals(data.totalPrice);
  } else await addOrderToGlobals();
};

export const onUpdateOrder = async (
  snap: functions.Change<functions.firestore.QueryDocumentSnapshot>
) => {
  const order = (await snap.after.data()) as orderType;
  const categories = getCategoriesFromOrder(order);
  functions.logger.log(categories);
  if (order.completed) {
    for (const food of order.items) {
      await addSaleOnFood(food);
      //await addOrderOnFood(food);
      await addSalesToCategory(food.itemCategory, food.price);
    }
    // for (const category of categories) {
    //   await updateOrderOnCategory(
    //     category.id,
    //     category.quantity,
    //     category.totalSales,
    //     false
    //   );
    // }

    await addOrderCompletedToGlobals(order.totalPrice);
  } else if (order.failed) {
    for (const food of order.items) await addOrderFailureOnFood(food);
    for (const category of categories)
      await updateOrderFailedOnCategory(
        category.id,
        category.quantity,
        category.totalSales
      );
    await addOrderFailureToGlobals();
  }
};
