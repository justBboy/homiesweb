import * as algoliasearch from "algoliasearch";
//import * as functions from "firebase-functions";

const client = algoliasearch.default(
  `${process.env.ALGOLIA_APPLICATION_ID}`,
  `${process.env.ALGOLIA_ADMIN_ID}`
);

export const ordersIndex = client.initIndex("orders");
export const foodsIndex = client.initIndex("foods");
export const customersIndex = client.initIndex("customers");
export const agentsIndex = client.initIndex("agents");

export default client;
