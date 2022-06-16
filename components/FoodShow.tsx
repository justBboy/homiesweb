import React from 'react'
import { FoodType } from '../features/types'
import { GoPrimitiveDot } from "react-icons/go"

interface props{
    selectedFood: FoodType | null
}
const FoodShow: React.FC<props> = ({selectedFood}) => {
    if(!selectedFood) return null;
  return (
    <div className={`relative mx-auto md:max-w-[768px] xl:max-w-[1024px] 2xl:max-w-[1324px] flex flex-col sm:flex-row justify-center h-full`}>
        <button type="button" className='absolute top-0 right-0 z-10 cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'><span>Add To Menu</span>  </button>
        <div className='h-full w-full sm:w-[50%] mt-60 sm:mt-0 flex  justify-center items-center'>
            <img className='rounded w-[220px] h-[190px] md:w-[320px] md:h-[220px] sm:w-[300px] w-[80%] sm:h-[300px] h-[80%]' src={selectedFood.img} alt={selectedFood.name} />
        </div>
        <div className='relative w-full text-center sm:text-left sm:w-[50%] z-0'>
            <h2 className={`font-gothamBlack text-2xl mt-10`}>{selectedFood.name}</h2>
            <p className={`font-gothamItalic italic text-md`}>Ingredients</p>
            <ul className="flex items-center sm:justify-start justify-center">
                <li className="flex items-center"><GoPrimitiveDot color="black" className='text-md' /><span>Ginger </span></li>
                <li className="flex items-center mx-2"><GoPrimitiveDot color="black" className='text-md' /><span>Oil</span></li>
                <li className="flex items-center mx-2"><GoPrimitiveDot color="black" className="text-md" /><span>Salt</span></li>
                <li className="flex items-center mx-2"><GoPrimitiveDot color="black" className="text-md" /><span>Fried Fish</span></li>
            </ul>
            <p className={`text-right font-gotham text-3xl text-orange-600 pt-5`}>Ghs24</p>
        </div>
    </div>
  )
}

export default FoodShow