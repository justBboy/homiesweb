export const baseURL = "http://localhost:3000";
export const appGlobalId = "global";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { orderType } from "./types";

export const updateOrderOnDocs = () => {};

export const onUpdateOrder = async (
  snap: functions.Change<functions.firestore.QueryDocumentSnapshot>
) => {
  const order: any = await snap.after.data();
  const categories = getCategoriesFromOrder(order);
  if (order.completed) {
    for (const food of order.items) await addOrderOnFood(food);
    for (const category of categories)
      updateOrderOnCategory(
        category.id,
        category.quantity,
        category.totalSales,
        false
      );

    await addOrderCompletedToGlobals(order.totalPrice);
  } else if (order.failed) {
    for (const food of order.items) await addOrderFailureOnFood(food);
    for (const category of categories)
      updateOrderOnCategory(
        category.id,
        category.quantity,
        category.totalSales,
        true
      );
    await addOrderFailureToGlobals();
  }
};

const addOrderOnFood = async (food: any) => {
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
      .update({
        orders: admin.firestore.FieldValue.increment(1),
        sales: admin.firestore.FieldValue.increment(
          f.data().price * food.quantity
        ),
      });
};

const addOrderFailureOnFood = async (food: any) => {
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
      .update({
        failed: admin.firestore.FieldValue.increment(1),
      });
};

const updateOrderOnCategory = async (
  categoryId: string,
  quantity: number,
  sales: number,
  failed: boolean = false
) => {
  if (failed) {
    await admin
      .firestore()
      .collection("foodCategories")
      .doc(categoryId)
      .update({
        failedOrders: quantity,
      });
  } else {
    await admin
      .firestore()
      .collection("foodCategories")
      .doc(categoryId)
      .update({
        sales: admin.firestore.FieldValue.increment(sales),
      });
  }
};

const addOrderToCategory = async (categoryId: string, quantity: number) => {
  await admin
    .firestore()
    .collection("foodCategories")
    .doc(categoryId)
    .update({
      orders: admin.firestore.FieldValue.increment(quantity),
    });
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
export const onOrderAdded = async (data: orderType) => {
  const categories = getCategoriesFromOrder(data);
  for (const food of data.items) await addOrderToFood(food.id);
  for (const category of categories) {
    await addOrderToCategory(category.id, category.quantity);
  }
  if (data.csale) {
    await addOrderToGlobals(true);
    await addOrderCompletedToGlobals(data.totalPrice);
  } else await addOrderToGlobals();
};

const addOrderToGlobals = async (cSale = false) => {
  const today = new Date();
  await admin
    .firestore()
    .collection("appGlobals")
    .doc("orders")
    .set({
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
      }-${today.getFullYear()}Count`]: admin.firestore.FieldValue.increment(1),
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
    });
};

const addOrderToFood = async (id: string) => {
  await admin
    .firestore()
    .collection("foods")
    .doc(id)
    .update({
      orders: admin.firestore.FieldValue.increment(1),
    });
};

const addOrderFailureToGlobals = async () => {
  const today = new Date();
  await admin
    .firestore()
    .collection("appGlobals")
    .doc("orders")
    .set({
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
    });
};

const addOrderCompletedToGlobals = async (price: number) => {
  const today = new Date();
  await admin
    .firestore()
    .collection("appGlobals")
    .doc("orders")
    .set({
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
      [`orders${today.getMonth() + 1}-${today.getFullYear()}CompletedCount`]:
        admin.firestore.FieldValue.increment(1),
    });
};
