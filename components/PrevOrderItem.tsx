import React, { useEffect, useRef, useState } from "react";
import useMountTransition from "../features/hooks/useMountTransition";

interface props {
  orderId: string;
  isMounted?: boolean;
  items: { foodName: string; quantity: number; foodPrice: number }[];
}

const PrevOrderItem: React.FC<props> = ({ isMounted, items, orderId }) => {
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
            {items.map((i, indx) => (
              <div
                key={indx}
                className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}
              >
                <h4 className={`font-gotham text-slate-800 `}>{i.foodName}</h4>
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
