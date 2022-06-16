import React, { useEffect, useRef, useState } from "react";
import useMountTransition from "../features/hooks/useMountTransition";

interface props {
  isMounted?: boolean;
}

const PrevOrderItem: React.FC<props> = ({ isMounted }) => {
  const hasTransitionedIn = useMountTransition(Boolean(isMounted), 1000);
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

  console.log(slideAnimComplete);

  return (
    <>
      {(hasTransitionedIn || isMounted) && (
        <div
          className={`w-full transition-all ${
            slideAnimComplete ? "overflow-y-auto" : "overflow-hidden"
          } duration-500`}
        >
          <div className={`flex flex-col items-center p-2 sm:p-5 w-full`}>
            <div
              className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}
            >
              <h4 className={`font-gotham text-slate-800 `}>
                Banku and okro stew
              </h4>
              <h5 className={`font-gothamMedium text-slate-700`}>Ghs20</h5>
            </div>
            <div
              className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}
            >
              <h4 className={`font-gotham text-slate-800 `}>
                Pizza, King Size
              </h4>
              <h5 className={`font-gothamMedium text-slate-700`}>Ghs24</h5>
            </div>
            <div
              className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}
            >
              <h4 className={`font-gotham text-slate-800 `}>
                Jollof Rice and Chicken
              </h4>
              <h5 className={`font-gothamMedium text-slate-700`}>Ghs40</h5>
            </div>
            <div
              className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}
            >
              <h4 className={`font-gotham text-slate-800 `}>Fruit Mix</h4>
              <h5 className={`font-gothamMedium text-slate-700`}>Ghs15</h5>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrevOrderItem;
