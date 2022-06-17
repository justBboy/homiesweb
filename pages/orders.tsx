import React, { useState } from "react";
import { Header } from "../components";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";
import PrevOrderItem from "../components/PrevOrderItem";

const orders = () => {
  const [selectedOrder, setSelectedOrder] = useState("");

  const handleSelectOrder = (id: string) => {
    if (selectedOrder === id) setSelectedOrder("");
    else setSelectedOrder(id);
  };
  return (
    <div className={`min-h-screen w-screen`}>
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
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="search"
                className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 outline-slate-200 rounded-lg border border-slate-300"
                placeholder="Search Order..."
                required
              />
              <button
                type="button"
                className="text-white absolute right-2.5 bottom-2.5 bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 "
              >
                Search
              </button>
            </div>
          </form>
        </div>
        <div className={`flex justify-evenly w-full items-center p-5`}>
          <div className={`w-1/3 `}>
            <h6 className="font-gothamMedium font-bold text-center">
              Order Id
            </h6>
          </div>
          <div className={`w-1/3`}>
            <h6 className="font-gothamMedium font-bold text-center">
              Items Count
            </h6>
          </div>
          <div className={`w-1/3`}>
            <h6 className="font-gothamMedium font-bold text-center">Price</h6>
          </div>
        </div>
        <div
          onClick={() => {
            handleSelectOrder("1");
          }}
          className={`relative transition-all duration-1000 w-full bg-slate-200 p-5 hover:bg-slate-300 cursor-pointer mb-5 overflow-hidden`}
        >
          <div className={`w-full flex justify-evenly items-center`}>
            <div className={`w-1/3 `}>
              <h6 className="font-md text-center">Order Id</h6>
            </div>
            <div className={`w-1/3`}>
              <h6 className="font-md text-center">Items Count</h6>
            </div>
            <div className={`w-1/3`}>
              <h6 className="font-md text-center">Price</h6>
            </div>
          </div>
          <PrevOrderItem isMounted={selectedOrder === "1"} />
          {selectedOrder ? (
            <BsFillCaretUpFill className={`absolute right-5 top-[28px]`} />
          ) : (
            <BsFillCaretDownFill className="absolute right-5 top-[28px]" />
          )}
        </div>
      </div>
    </div>
  );
};

export default orders;
