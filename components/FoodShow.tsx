import Image from "next/image";
import React, { useEffect, useState } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import { addToCart, selectCarts } from "../features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../features/hooks";

interface props {
  selectedFood: {
    id: string;
    name: string;
    available: boolean;
    price: number;
    img: string;
  } | null;
}
const FoodShow: React.FC<props> = ({ selectedFood }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCarts);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const item = cart.findIndex((c) => c.id === selectedFood?.id);
    if (item !== -1) setInCart(true);
    else setInCart(false);
  }, [cart]);

  if (!selectedFood) return null;

  const addItemToCart = () => {
    console.log("selected food =========> ", selectedFood);
    dispatch(
      addToCart({
        id: selectedFood.id,
        imgURL: selectedFood.img,
        name: selectedFood.name,
        price: selectedFood.price,
        quantity: 1,
      })
    );
  };

  console.log("in cart ===========> ", inCart);

  return (
    <div
      className={`relative mx-auto md:max-w-[768px] xl:max-w-[1024px] 2xl:max-w-[1324px] flex flex-col sm:flex-row justify-center h-full`}
    >
      <button
        type="button"
        onClick={addItemToCart}
        disabled={!selectedFood.available || inCart}
        className={`absolute top-0 right-0 z-10 ${
          !selectedFood.available || inCart
            ? "opacity-60 cursor-not-allowed"
            : "opacity-100 hover:bg-blue-700"
        } cursor-pointer bg-blue-500 text-white font-bold py-2 px-4 rounded`}
      >
        <span>
          {selectedFood.available && !inCart
            ? "Add To Menu"
            : !inCart
            ? "Unavailable"
            : "Added to cart"}
        </span>{" "}
      </button>
      <div className="m-auto w-[220px] h-[190px] md:w-[320px] md:h-[220px] sm:w-[300px] w-[80%] sm:h-[300px] h-[80%] flex justify-center items-center relative">
        <Image
          layout="fill"
          className="rounded "
          src={selectedFood.img}
          alt={selectedFood.name}
        />
      </div>
      <div className="relative w-full text-center sm:text-left sm:w-[50%] z-0">
        <h2 className={`font-gothamBlack text-2xl mt-10`}>
          {selectedFood.name}
        </h2>
        <p className={`font-gothamItalic italic text-md`}>Ingredients</p>
        <ul className="flex items-center sm:justify-start justify-center">
          <li className="flex items-center">
            <GoPrimitiveDot color="black" className="text-md" />
            <span>Ginger </span>
          </li>
          <li className="flex items-center mx-2">
            <GoPrimitiveDot color="black" className="text-md" />
            <span>Oil</span>
          </li>
          <li className="flex items-center mx-2">
            <GoPrimitiveDot color="black" className="text-md" />
            <span>Salt</span>
          </li>
          <li className="flex items-center mx-2">
            <GoPrimitiveDot color="black" className="text-md" />
            <span>Fried Fish</span>
          </li>
        </ul>
        <p className={`text-right font-gotham text-3xl text-orange-600 pt-5`}>
          Ghs24
        </p>
      </div>
    </div>
  );
};

export default FoodShow;
