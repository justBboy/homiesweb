import Image from "next/image";
import Link from "next/link";
import React from "react";
import { orderType } from "../features/orders/OrdersSlice";

interface props {
  order: orderType;
}
const OrderItem: React.FC<props> = ({ order }) => {
  return (
    <div className={`w-full h-full overflow-scroll`}>
      <div
        className={`w-full flex flex-col sm:flex-row justify-between px-1 sm:px-5`}
      >
        <div className={`sm:flex-[0.4] flex items-center justify-center`}>
          <div className={`sm:w-[180px] w-[220px] aspect-[3.378/1] relative`}>
            <Image
              layout="fill"
              src="/v1656606687/logo-no-bg_luwdcs.png"
              className={`cursor-pointer`}
              alt="Homiez Foods logo"
            />
          </div>
          <hr className={`sm:hidden`} />
        </div>
        <div
          className={`sm:w-[50%] w-full sm:flex-[0.6] sm:border-l flex sm:flex-col justify-center items-center  sm:mt-0 mt-5`}
        >
          <h2
            className={`sm:text-md text-xs text-center whitespace-nowrap captitalize font-bold`}
          >
            Order Id
            <span className={`sm:hidden mx-2`}>-</span>
          </h2>
          <h6
            className={`font-gothamLight text-xs sm:text-sm whitespace-nowrap`}
          >
            {order.id}
          </h6>
        </div>
      </div>
      <div className={`flex flex-col w-full sm:px-5 px-1 mt-5`}>
        {order.items.map((item) => {
          return (
            <div
              key={item.id}
              className={`w-full flex rounded-md bg-slate-50 h-20 my-2`}
            >
              <div
                className={`flex-[0.7] flex flex-col items-center justify-center pl-2`}
              >
                <h2 className={`md:text-xl text-sm`}>{item.foodName}</h2>
              </div>
              <div className={`flex-[0.3] flex items-center items-center pl-2`}>
                <h2 className={`md:text-xl text-md font-bold`}>
                  ₵{item.price}
                </h2>
              </div>
            </div>
          );
        })}
        <div className={`w-full mt-2`}>
          <h1 className={`font-bold text-right`}>
            Total Price - ₵
            {order.hasRefCode
              ? order.totalPrice + 1 + 0.2
              : order.totalPrice + 0.2}
          </h1>
        </div>
        <div className={`w-full mt-2`}>
          <h1 className={`text-center text-pink-600 tracking-widest text-xl`}>
            Food On Its Way
          </h1>
          <Link href="/orders">
            <button
              className={`mt-3 flex items-center justify-center w-full p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}
            >
              Go To Orders
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
