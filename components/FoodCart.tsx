import React, { useState } from 'react'

interface props{
  name: string;
  price: number;
  img: string;
}

const FoodCart: React.FC<props> = ({name, price, img}) => {
  const [number, setNumber] = useState(1);
  return (
    <div className={`w-full rounded shadow h-[80px] mt-5 mb-4 flex`}>
      <div className={`w-1/3`}>
        <img className={"h-full"} src={img} alt={name} />
      </div>
      <div className={`w-2/3 flex flex-col justify-center items-center h-full`}>
        <h3 className={"font-gotham text-center text-md"}>{name}</h3>
        <p className={`font-gothamThin text-md text-slate-600`}>GHs{price}</p>
        <div className={`w-full flex justify-end mt-2`}>
          <input type="number" value={number} onChange={n => {
            const number = parseInt(n.target.value)
            if(number > 0){
              setNumber(number)
            }
            }
              } className='w-[50px] outline-none bg-[#00000033] rounded px-2 hover:bg-[#00000077]' />
        </div>
      </div>
    </div>
  )
}

export default FoodCart 