import Link from 'next/link'
import React from 'react'
import { MdEdit } from 'react-icons/md'
import { Header } from '../components'

const account = () => {
  return (
    <div className={`w-screen min-h-screen bg-graybg`}>
        <Header withoutSearch />
        <div className={`flex flex-col items-center p-2 sm:p-5 mx-auto sm:w-[60%] w-[90%]`}>
                <div className={`w-full`}>
                    <h2 className={`text-xl font-gothamMedium font-md`}>Account Details: </h2>
                <div className={`flex shadow-sm w-full justify-between items-center py-5 px-3 hover:bg-slate-200 mt-3`}>
                    <h3 className={`font-md font-gotham`}>Your Email: </h3>
                    <div className='flex items-center'>
                        <h4 className={`font-gotham text-slate-800 `}>email@email.com</h4>
                        <Link href="/">
                            <a>
                                <MdEdit className={`text-slate-600 text-xl ml-4`} />
                            </a>
                        </Link>
                    </div>
                </div>
                <div className={`flex shadow-sm w-full justify-between items-center py-5 px-3 hover:bg-slate-200`}>
                    <h3 className={`font-md font-gotham`}>Your Phone Number: </h3>
                    <div className='flex items-center'>
                        <h4 className={`font-gotham text-slate-800 `}>020*********</h4>
                        <Link href="/">
                            <a>
                                <MdEdit className={`text-slate-600 text-xl ml-4`} />
                            </a>
                        </Link>
                    </div>
                </div>
                <div className={`flex shadow-sm w-full justify-between items-center py-5 px-3 hover:bg-slate-200`}>
                    <h3 className={`font-md font-gotham`}>Change Password: </h3>
                    <div className='flex items-center'>
                        <h4 className={`font-gotham text-slate-800`}>*********</h4>
                        <Link href="/">
                            <a>
                                <MdEdit className={`text-slate-600 text-xl ml-4`} />
                            </a>
                        </Link>
                    </div>
                </div>
                </div>

            </div>
    </div>
  )
}

export default account