import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import useMountTransition from "../features/hooks/useMountTransition";
import { orderType } from "../features/orders/OrdersSlice";

interface props {
  orderId: string;
  createdAt: number;
  isMounted?: boolean;
  order: orderType;
  items: { foodName: string; quantity: number; foodPrice: number }[];
}

const PrevOrderItem: React.FC<props> = ({
  isMounted,
  items,
  order,
  orderId,
  createdAt,
}) => {
  const hasTransitionedIn = useMountTransition(Boolean(isMounted), 180);
  const [slideAnimComplete, setSlideAnimComplete] = useState(false);

  useEffect(() => {
    let timeout: any;
    if (hasTransitionedIn) {
      timeout = setTimeout(() => {
        setSlideAnimComplete(true);
      }, 1000);
    } else {
      setSlideAnimComplete(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [hasTransitionedIn]);

  return (
    <>
      {(hasTransitionedIn || isMounted) && (
        <div
          className={`w-full transition-all  ${
            slideAnimComplete ? "overflow-y-auto" : "overflow-hidden"
          } duration-500 ${
            isMounted
              ? "animate-[slide-down_0.2s_ease-in]"
              : "animate-[slide-up_0.2s_ease-out]"
          }`}
        >
          <div className={`flex flex-col items-center p-2 sm:p-5 w-full`}>
            <div className={`w-full py-5 px-3 bg-white min-h-[200px]`}>
              <div className="flex justify-between border-b border-slate-200 py-3">
                <h2 className={`font-bold`}>Customer Name:</h2>
                <p className={`text-md text-right`}>{order.customerName}</p>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-3">
                <h2 className={`font-bold`}>Phone Number:</h2>
                <p className={`text-md text-right`}>{order.customerPhone}</p>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-3">
                <h2 className={`font-bold`}>Delivery Location:</h2>
                <p className={`text-md text-right`}>
                  {order.location?.locationStreet}
                </p>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-3">
                <h2 className={`font-bold`}>Distance From Us:</h2>
                <p className={`text-md text-right`}>
                  {order.distanceFromUs?.distance?.text}
                </p>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-3">
                <h2 className={`font-bold`}>Avg. Ride Duration:</h2>
                <p className={`text-md text-right`}>
                  {order?.distanceFromUs?.duration?.text}
                </p>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-3">
                <h2 className={`font-bold`}>Status:</h2>
                <p className={`text-md text-right`}>
                  {order?.completed
                    ? "Completed"
                    : order?.failed
                    ? "Failed"
                    : order?.ongoing
                    ? "Rider On Way"
                    : "Pending Notice"}
                </p>
              </div>
            </div>
            <div className={`w-full`}>
              <h2 className="font-bold text-center">Foods Bought</h2>
              {items.map((i, indx) => (
                <div
                  key={indx}
                  className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}
                >
                  <h4 className={`font-gotham text-slate-800 `}>
                    {i.foodName}
                  </h4>
                  <h5 className={`font-gothamMedium text-slate-700`}>
                    ₵{i.foodPrice}
                    {i.quantity > 1 && (
                      <span className={`font-sm text-light font-gothamLight`}>
                        -{i.quantity}x
                      </span>
                    )}
                  </h5>
                </div>
              ))}
            </div>

            <div className={`flex py-2 w-full`}>
              <span className={`font-gothamLight text-xs whitespace-nowrap`}>
                {moment.unix(createdAt).format("llll")}
              </span>
            </div>
            <div className={`w-full flex mt-4`}>
              <span
                className={`font-gothamLight text-xs text-center sm:text-right whitespace-nowrap`}
              >
                {orderId}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrevOrderItem;
