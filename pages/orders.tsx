import React, { useEffect, useState } from "react";
import { Header } from "../components";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";
import PrevOrderItem from "../components/PrevOrderItem";
import { useAppDispatch, useAppSelector } from "../features/hooks";
import {
  getOrders,
  orderType,
  selectOrders,
} from "../features/orders/OrdersSlice";
import axios from "../libs/axios";
import useFirebaseAuth from "../features/hooks/useFirebaseAuth";
import Loader from "../components/Loader";
import { useRouter } from "next/router";
import { useAlert } from "react-alert";
import { auth } from "../libs/Firebase";
import { getIdToken, User } from "firebase/auth";
import { AiOutlineLoading } from "react-icons/ai";

const Orders = () => {
  const alert = useAlert();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const orders = useAppSelector(selectOrders(1));
  const [lastUpdateComplete, setLastUpdateComplete] = useState(false);
  const [ordersLastUpdate, setOrdersLastUpdate] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState("");
  const { user, completed } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [searchOrders, setSearchOrders] = useState<orderType[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSelectOrder = (id: string) => {
    if (selectedOrder === id) setSelectedOrder("");
    else setSelectedOrder(id);
  };
  useEffect(() => {
    (async () => {
      if (lastUpdateComplete) {
        setLoading(true);
        await dispatch(
          getOrders({
            lastUpdate: ordersLastUpdate,
            page: page,
          })
        );
        setLoading(false);
      }
    })();
  }, [page, lastUpdateComplete, dispatch, ordersLastUpdate]);

  useEffect(() => {
    (async () => {
      setLastUpdateComplete(false);
      const res = await axios.get("/users/orderGlobals");
      const globals: any = res.data;
      setOrdersLastUpdate(globals?.ordersLastUpdate);
      setLastUpdateComplete(true);
    })();
  }, []);

  useEffect(() => {
    if (completed && !user) {
      alert.error("Log In Before Checking Orders");
      router.push("/login?next=/orders");
    }
  }, [completed, user]);

  const handleSearch = () => {
    if (search) {
      if (auth.currentUser) {
        (async () => {
          setSearchLoading(true);
          const token = await getIdToken(auth.currentUser as User);
          const searchRes = await axios.get(
            `/users/searchOrder?s=${search}&page=${page}&token=${token}`
          );
          setSearchLoading(false);
          if (searchRes.data.error) return setError(searchRes.data.error);
          setSearchOrders(searchRes.data);
        })();
      }
    } else {
      setSearchOrders([]);
    }
  };

  if (completed && user && !loading) {
    return (
      <div
        className={`min-h-screen w-screen animate__animated animate__fadeIn`}
      >
        <Header withoutSearch />
        <div className={`sm:w-[80%] w-[95%] mt-5 mx-auto`}>
          <div
            className={`flex flex-col sm:flex-row items-center w-full mx-auto mb-5`}
          >
            <div className="w-[100%] sm:w-[40%] mb-2 sm:mb-0 mr-2">
              <input
                type="date"
                className={`p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 outline-slate-200 rounded-lg border border-slate-300`}
                placeholder="Choose Date"
              />
            </div>
            <form className={`sm:w-[60%] w-[100%]`}>
              <label
                htmlFor="searchOrder"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300"
              >
                Search
              </label>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
                <input
                  type="search"
                  className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 outline-slate-200 rounded-lg border border-slate-300"
                  placeholder="Search Order..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  required
                />
                <button
                  disabled={searchLoading}
                  onClick={handleSearch}
                  type="button"
                  className="text-white absolute right-2.5 bottom-2.5 bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 "
                >
                  {searchLoading ? (
                    <AiOutlineLoading className={`animate-spin`} />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className={`flex justify-evenly w-full items-center p-5`}>
            <div className={`w-1/3 `}>
              <h6 className="font-gotham font-bold text-center">Order Id</h6>
            </div>
            <div className={`w-1/3`}>
              <h6 className="font-gotham font-bold text-center">Price</h6>
            </div>
            <div className={`w-1/3`}>
              <h6 className="font-gotham font-bold text-center">Items Count</h6>
            </div>
          </div>
          {searchOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => {
                handleSelectOrder(order.id);
              }}
              className={`relative transition-all duration-1000 w-full bg-slate-200 p-5 hover:bg-slate-300 cursor-pointer mb-5 overflow-hidden`}
            >
              <div
                style={{
                  background: order.completed
                    ? "green"
                    : order.failed
                    ? "red"
                    : "orange",
                }}
                className={`w-2 h-full absolute left-1 top-0`}
              ></div>
              <div className={`w-full flex justify-evenly items-center`}>
                <div className={`w-1/3 `}>
                  <h6 className="font-md text-center">
                    {order.id.substring(0, 8)}...
                  </h6>
                </div>
                <div className={`w-1/3`}>
                  <h6 className="font-md text-center">
                    ₵
                    {order.hasRefCode
                      ? order.totalPrice + 1 + 0.2
                      : order.totalPrice + 0.2}
                  </h6>
                </div>
                <div className={`w-1/3`}>
                  <h6 className="font-md text-center">{order.items.length}</h6>
                </div>
              </div>
              <PrevOrderItem
                orderId={order.id}
                items={order.items.map((item) => ({
                  foodName: item.foodName,
                  foodPrice: item.price,
                  quantity: item.quantity,
                }))}
                isMounted={selectedOrder === order.id}
              />
              {selectedOrder ? (
                <BsFillCaretUpFill className={`absolute right-5 top-[28px]`} />
              ) : (
                <BsFillCaretDownFill className="absolute right-5 top-[28px]" />
              )}
            </div>
          ))}
          {!search &&
            orders.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  handleSelectOrder(order.id);
                }}
                className={`relative transition-all duration-1000 w-full bg-slate-200 p-5 hover:bg-slate-300 cursor-pointer mb-5 overflow-hidden`}
              >
                <div
                  style={{
                    background: order.completed
                      ? "green"
                      : order.failed
                      ? "red"
                      : "orange",
                  }}
                  className={`w-2 h-full absolute left-1 top-0`}
                ></div>
                <div className={`w-full flex justify-evenly items-center`}>
                  <div className={`w-1/3 `}>
                    <h6 className="font-md text-center">
                      {order.id.substring(0, 8)}...
                    </h6>
                  </div>
                  <div className={`w-1/3`}>
                    <h6 className="font-md text-center">
                      ₵
                      {order.hasRefCode
                        ? order.totalPrice + 1 + 0.2
                        : order.totalPrice + 0.2}
                    </h6>
                  </div>
                  <div className={`w-1/3`}>
                    <h6 className="font-md text-center">
                      {order.items.length}
                    </h6>
                  </div>
                </div>
                <PrevOrderItem
                  orderId={order.id}
                  items={order.items.map((item) => ({
                    foodName: item.foodName,
                    foodPrice: item.price,
                    quantity: item.quantity,
                  }))}
                  isMounted={selectedOrder === order.id}
                />
                {selectedOrder ? (
                  <BsFillCaretUpFill
                    className={`absolute right-5 top-[28px]`}
                  />
                ) : (
                  <BsFillCaretDownFill className="absolute right-5 top-[28px]" />
                )}
              </div>
            ))}
        </div>
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

export default Orders;
