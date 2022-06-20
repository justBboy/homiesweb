import Link from 'next/link'
import React from 'react'
import {FaMoneyCheck} from "react-icons/fa"

const checkout = () => {
  return (
    <div className={`bg-graybg w-screen min-h-screen flex items-center justify-center`}>
        <div className={`mx-auto min-w-[90%] sm:min-w-[70%] min-h-screen pt-2`}>
            <div className={``}>
                <Link href="/">
                    <img src="/images/logo-no-bg.png" className={`w-[180px] sm:w-[240px] cursor-pointer`} alt="Homiez Foods logo" />
                </Link>
            </div>
            <div className={`flex flex-col items-center p-2 sm:p-5`}>
                <div className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}>
                    <h4 className={`font-gotham text-slate-800 `}>Banku and okro stew</h4>
                    <h5 className={`font-gothamMedium text-slate-700`}>Ghs20</h5>
                </div>
                <div className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}>
                    <h4 className={`font-gotham text-slate-800 `}>Pizza, King Size</h4>
                    <h5 className={`font-gothamMedium text-slate-700`}>Ghs24</h5>
                </div>
                <div className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}>
                    <h4 className={`font-gotham text-slate-800 `}>Jollof Rice and Chicken</h4>
                    <h5 className={`font-gothamMedium text-slate-700`}>Ghs40</h5>
                </div>
                <div className={`flex shadow-sm w-full justify-between items-center py-5 px-3`}>
                    <h4 className={`font-gotham text-slate-800 `}>Fruit Mix</h4>
                    <h5 className={`font-gothamMedium text-slate-700`}>Ghs15</h5>
                </div>
            </div>
            <button className='flex items-center justify-center shadow uppercase h-12 mt-3 text-white w-full rounded bg-blue-600 hover:bg-blue-700'>
                <FaMoneyCheck className={`text-slate-600 text-xl`} color="#eee" />
                <span className={`font-bold ml-3`}>Pay Now </span>
            </button>
        </div>
    </div>
  )
}

export default checkout