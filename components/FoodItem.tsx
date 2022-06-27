import Image from "next/image";
import React from "react";
import { FoodType } from "../features/types";

interface props {
  id: string;
  name: string;
  available: boolean;
  price: number;
  img: string;
  setSelectedFood: (food: {
    id: string;
    name: string;
    available: boolean;
    price: number;
    img: string;
  }) => void;
}

const FoodItem: React.FC<props> = ({
  id,
  name,
  price,
  available,
  img,
  setSelectedFood,
}) => {
  const handleSelectFood = () => {
    const food: {
      id: string;
      name: string;
      available: boolean;
      price: number;
      img: string;
    } = {
      id,
      name,
      available,
      price,
      img,
    };
    setSelectedFood(food);
  };
  return (
    <div
      onClick={handleSelectFood}
      className="flex flex-col sm:max-w-[400px] max-w-[280px] aspect-[] w-full cursor-pointer mb-5 mx-auto"
    >
      <div className="w-full aspect-[4/3] p-1 md:p-2 relative">
        <Image
          alt="gallery"
          layout="fill"
          className="block object-cover object-center w-full h-full rounded-lg"
          src={img}
        />
      </div>
      <div className="flex items-center justify-between w-full">
        <span className="text-slate-600 text-xs sm:text-sm ml-3">{name}</span>
        <span className="text-slate-800 text-[9px] md:text-sm mr-3">
          ₵{price}
        </span>
      </div>
    </div>
  );
};

export default FoodItem;
