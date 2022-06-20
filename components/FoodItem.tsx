import React from 'react'
import { FoodType } from '../features/types';

interface props{
    name: string;
    price: number;
    img: string;
    setSelectedFood: (food: FoodType) => void;
}

const FoodItem: React.FC<props> = ({name, price, img, setSelectedFood}) => {
    const handleSelectFood = () => {
        const food: FoodType = {
            name,
            price,
            img
        }
        setSelectedFood(food)
    } 
  return (
    <div onClick={handleSelectFood} className="flex flex-wrap w-1/3 cursor-pointer mb-5">
            <div className="w-full p-1 md:p-2">
            <img alt="gallery" className="block object-cover object-center w-full h-full rounded-lg"
                src={img} />
            </div>
            <div className="flex items-center justify-between w-full">
                <span className="text-slate-600 text-xs sm:text-sm ml-3">{name}</span>
                <span className='text-slate-800 text-[9px] md:text-sm mr-3'>GHs{price}</span>
            </div>
        </div>
        )
}

export default FoodItem