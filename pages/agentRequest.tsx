import React, { useState } from 'react'
import { Header } from '../components'
import { GrFormDown } from "react-icons/gr"
import {MdOutlineNavigateNext} from "react-icons/md"
import { AiOutlineClose} from "react-icons/ai"

const agentRequest = () => {
  const [formShown, setFormShown] = useState(false);

  const handleToggleShowForm = () => {
    setFormShown(v => !v);
  }
  return (
    <div className={`w-[100vw] overflow-x-hidden min-h-[100vh] bg-graybg`}>
      <div
      style={{
        background: "radial-gradient(circle, rgba(234,88,12,1) 35%, rgba(255,131,0,1) 100%)"
      }} 
     className={`w-full transition-max-h z-10 h-[100vh] duration-1000 overflow-hidden`} 
      >
        <Header withoutSearch>
          <div className={`w-full flex md:flex-row flex-col items-center h-full`}>
              <div className={`sm:flex hidden w-1/2 justify-center`}>
                <img src="/images/pizza-slice.png" alt="Pizza slice image" />
              </div>
              <div className={`relative flex flex-col items-center justify-center h-full w-full md:w-1/2 p-5`}>
                <h2 className={`text-5xl font-gothamBold font-bold text-center tracking-wider text-slate-100 w-[80%] leading-[4.5rem]`}>Share And Earn With Us</h2>
                <p className={`text-md font-gothamMedium tracking-wider text-center text-slate-200 w-[80%] leading-[4.5rem]`}>Share A Link to buy food and earn from it</p>
                <button onClick={handleToggleShowForm} type="button" className={`flex items-center justify-center w-[80%] p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}>
                  <span className={`mx-auto`}>Proceed to Form</span>
                  <span className={`ml-auto`}><GrFormDown className={`text-slate-100 text-xl bg-slate-100 rounded`} /></span>
                </button>
                <div className={`${formShown ? "visible opacity-1 translate-y-[0px]" : "opacity-0 translate-y-[20px] invisible"} transition-all absolute w-[90%] sm:w-[80%] bg-slate-50 rounded min-h-[80%]`}>
                  <div className={`relative w-full h-full`}>
                      <a href="#close" onClick={() => {setFormShown(false)}}>
                          <AiOutlineClose className={`text-xl text-slate-400 absolute right-4 top-2`} />
                      </a>
                      <form className={`w-full pt-10 p-5`}>
                        <div>
                          <label htmlFor="First Name" className={`font-bold text-slate-800`}>First Name*</label>
                          <input type="text" placeholder='E.g John' className={'w-full outline-none p-2 border border-slate-200 rounded font-md font-gotham'} />
                        </div>
                        <div className={`mt-3`}>
                          <label htmlFor="Last Name" className={`font-bold text-slate-800`}>Last Name *</label>
                          <input type="text" placeholder='E.g Appiah' className={'w-full outline-none p-2 border border-slate-200 rounded font-md font-gotham'} />
                        </div>
                        <div className={`mt-3`}>
                          <label htmlFor="PhoneNumber" className={`font-bold text-slate-800`}>Phone Number*</label>
                          <input type="tel" placeholder='E.g 024*********' className={'w-full outline-none p-2 border border-slate-200 rounded font-md font-gotham'} />
                        </div>
                        <button className={`mt-3 flex items-center justify-center w-full p-5 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}>
                          <span className={`mx-auto`}>Submit</span>
                          <span className={`ml-auto`}><MdOutlineNavigateNext className={`text-slate-100 text-xl`} /></span>
                        </button>
                        <p className={`font-md font-gothamMedium text-slate-600 text-center mt-3`}>
                          You will be called to complete the procedure to becoming an agent with us
                        </p>
                      </form>
                  </div>
                </div>
              </div>
          </div>
        </Header>
      </div>
    </div>
  )
}

export default agentRequest