export const baseURL = "http://localhost:3000";
export const appGlobalId = "global";
export const phoneNumberPattern = /^[0]?\d{9}$/;
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { orderType } from "./types";

export const updateOrderOnDocs = () => {};

const addOrderOnFood = async (food: {
  id: string;
  itemCategory: string;
  price: number;
  quantity: number;
}) => {
  try {
    const matches = await admin
      .firestore()
      .collection("foods")
      .where("id", "==", food.id)
      .get();
    for (const f of matches.docs)
      f.ref.set(
        {
          orders: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
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
          },
          { merge: true }
        );
  } catch (err) {
    console.log("on food error ============> ", err);
  }
};

const addSaleOnFood = async (food: any) => {
  try {
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
          },
          { merge: true }
        );
  } catch (err) {
    console.log("order failure error ==========> ", err);
  }
};

const updateOrderOnCategory = async (
  categoryId: string,
  quantity: number,
  sales: number,
  failed: boolean = false
) => {
  try {
    if (failed) {
      const doc = await admin
        .firestore()
        .collection("foodCategories")
        .doc(categoryId)
        .get();
      if (doc.exists)
        doc.ref.set(
          {
            failedOrders: admin.firestore.FieldValue.increment(quantity),
          },
          { merge: true }
        );
    } else {
      const doc = await admin
        .firestore()
        .collection("foodCategories")
        .doc(categoryId)
        .get();
      if (doc.exists)
        doc.ref.set(
          {
            sales: admin.firestore.FieldValue.increment(sales),
          },
          { merge: true }
        );
    }
  } catch (err) {
    console.log("update order on category error ==============> ", err);
  }
};

const addSalesToCategory = async (categoryId: string, sales: number) => {
  const doc = await admin
    .firestore()
    .collection("foodCategories")
    .doc(categoryId)
    .get();
  if (doc.exists)
    doc.ref.set(
      {
        sales: admin.firestore.FieldValue.increment(sales),
      },
      { merge: true }
    );
};

const deleteOrderOnCategory = async (
  categoryId: string,
  quantity: number,
  sales: number = 0,
  failed: boolean = false
) => {
  try {
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
    const doc = await admin
      .firestore()
      .collection("foodCategories")
      .doc(categoryId)
      .get();
    if (doc.exists)
      doc.ref.set(
        {
          orders: admin.firestore.FieldValue.increment(quantity),
        },
        { merge: true }
      );
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
  for (const food of data.items) {
    await addOrderOnFood(food);
    if (data.csale) {
      addSaleOnFood(food);
      console.log(food);
      addSalesToCategory(food.itemCategory, food.price);
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
  if (order.completed) {
    for (const food of order.items) {
      await addSaleOnFood(food);
      await addOrderOnFood(food);
    }
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
