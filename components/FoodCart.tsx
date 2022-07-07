import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import {
  removeFromCart,
  setCartItemQuantity,
} from "../features/cart/cartSlice";
import { useAppDispatch } from "../features/hooks";

interface props {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
}

const FoodCart: React.FC<props> = ({ name, price, img, quantity, id }) => {
  const dispatch = useAppDispatch();
  const [number, setNumber] = useState(quantity);

  useEffect(() => {
    if (number > 0) dispatch(setCartItemQuantity({ id, quantity: number }));
  }, [number]);
  return (
    <div className={`w-full rounded shadow h-[80px] mt-5 mb-4 flex relative`}>
      <button
        onClick={() => {
          dispatch(removeFromCart(id));
        }}
        className={`absolute right-1 top-0`}
      >
        <MdDelete className={`text-xl text-slate-600 hover:text-slate-700`} />
      </button>
      <div className={`w-1/3`}>
        <img className={"h-full"} src={img} alt={name} />
      </div>
      <div
        className={`w-2/3 flex flex-col justify-center items-center h-full pr-6`}
      >
        <h3
          className={
            "max-f-cart font-gotham text-center md:text-[0.9vw] sm:text-[1.1vw] text-[2vw]"
          }
        >
          {name}
        </h3>
        <p className={`font-gothamThin text-md text-slate-600 self-end`}>
          ₵{price}
        </p>
        <div className={`w-full flex justify-end`}>
          <input
            type="number"
            value={number}
            onChange={(n) => {
              const number = parseInt(n.target.value);
              if (number > 0) {
                setNumber(number);
              }
            }}
            className="w-[50px] outline-none bg-[#00000033] rounded px-2 hover:bg-[#00000077]"
          />
        </div>
      </div>
    </div>
  );
};

export default FoodCart;
