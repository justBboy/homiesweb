import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
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
    includes?: string[];
  } | null;
}
const FoodShow: React.FC<props> = ({ selectedFood }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCarts);
  const detailsContainerRef = useRef<HTMLDivElement>(null);
  const [detailsContainerHeight, setDetailsContainerHeight] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const item = cart.findIndex((c) => {
      return c.id === selectedFood?.id;
    });
    if (item !== -1) setInCart(true);
    else setInCart(false);
  }, [cart, selectedFood]);
  /*
  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    window.addEventListener("resize", changeDimensions);
    return () => {
      window.removeEventListener("resize", changeDimensions);
    };
  }, []);

  useEffect(() => {
    handleChangeDetailRightHeight();
  }, [dimensions]);

  const changeDimensions = () => {
    console.log("changing dimensions");
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  const handleChangeDetailRightHeight = () => {
    console.log("hello");
    setDetailsContainerHeight(detailsContainerRef.current?.clientHeight || 0);
  };
  */
  if (!selectedFood) return null;

  const addItemToCart = () => {
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

  return (
    <div
      className={`relative mx-auto md:max-w-[768px] xl:max-w-[1024px] 2xl:max-w-[1324px] h-full flex justify-center items-center`}
    >
      <div
        ref={detailsContainerRef}
        className={`flex flex-col sm:flex-row justify-center items-center relative w-full overflow-y-auto max-h-full`}
      >
        <div className="mx-2 w-[220px] min-h-[190px] h-[190px] md:w-[320px] md:h-[220px] sm:w-[230px] w-[80%] sm:h-[240px] h-[80%] flex justify-center items-center relative">
          <Image
            layout="fill"
            className="rounded "
            loader={({ src }) => {
              return src;
            }}
            src={selectedFood.img}
            alt={selectedFood.name}
          />
        </div>
        <div className="mx-2 relative sm:text-left z-0 flex flex-col items-center sm:items-start pl-3 h-full sm:pt-1 pt-2 max-h-[220px]">
          <button
            type="button"
            onClick={addItemToCart}
            disabled={!selectedFood.available || inCart}
            className={`z-10 ${
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
          <div className={`overflow-y-auto`}>
            <h2 className={`font-gothamBlack text-2xl`}>{selectedFood.name}</h2>
            {selectedFood.includes && selectedFood.includes[0] && (
              <p className={`font-gothamItalic italic text-md mt-2`}>
                This Food Includes
              </p>
            )}
            <ul className="grid grid-cols-2 md:grid-cols-3 grid-rows-2 place-items-center w-full">
              {selectedFood.includes &&
                selectedFood.includes[0] &&
                selectedFood.includes?.map((item, indx) => (
                  <div key={indx} className={`w-full`}>
                    <li className="flex">
                      <GoPrimitiveDot color="black" className="text-md" />
                      <span className={`text-center`}>{item} </span>
                    </li>
                  </div>
                ))}
            </ul>
          </div>

          <p className={`font-gotham text-3xl text-orange-600 pt-5`}>
            ₵{selectedFood.price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FoodShow;
