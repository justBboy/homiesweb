import React from "react";
import { Header } from "../components";
import { IoCopyOutline } from "react-icons/io5";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaMoneyBillWave,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";

const agentConsole = () => {
  return (
    <div className={`w-screen min-h-scren`}>
      <Header withoutSearch />
      <div
        className={`w-full px-4 lg:max-w-[1024px] md:max-w-[768px] sm:max-w-[412px]] mx-auto h-full mt-8 lg:mb-5 mb-[280px]`}
      >
        <div className="w-full flex justify-between items-center">
          <h2 className={`font-bold text-sm sm:text-xl`}>Current: 28.03</h2>
          <button
            type="button"
            className={`flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md shadow-md`}
          >
            <FaMoneyBillWave className={`text-xl mr-2`} color="#eee" />
            <span>Withdraw</span>
          </button>
        </div>
        <div className={`w-full`}>
          <h6 className={`font-thin text-sm mt-3`}>Withdrawn: 104.23</h6>
        </div>
        <hr className={`mt-2 mb-4`} />
        <div className={`w-full`}>
          <div className="w-full">
            <h2 className={`font-thin text-md text-right`}>
              Withdrawal History
            </h2>
          </div>
          <div className="flex flex-col">
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead className="border-b border-t">
                      <tr className={`bg-slate-200`}>
                        <th
                          scope="col"
                          className="text-sm font-bold text-gray-900 px-6 py-4 text-left"
                        >
                          Date And Time
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-bold text-gray-900 px-6 py-4 text-left"
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          26th July 2022, 9:30pm
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                          88.92
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`fixed bottom-3 left-0 flex flex-wrap justify-center items-center w-full px-1 sm:px-4 lg:max-w-[1024px] md:max-w-[768px] sm:max-w-[412px]] left-[50%] translate-x-[-50%]`}
      >
        <div className={`w-full px-5 sm:px-0 sm:w-auto`}>
          <a className="border rounded p-4 font-md font-gotham text-xs sm:text-sm text-slate-800 flex items-center justify-center cursor-pointer hover:text-black mb-2">
            <IoCopyOutline />
            <span className="ml-3">Copy Link</span>
          </a>
        </div>
        <a className="border rounded p-4 font-md font-gotham text-2xl sm:text-sm text-slate-800 flex items-center cursor-pointer hover:text-black ml-2 mb-2">
          <FaFacebook color="#4267B2" />
          <span className="ml-3 hidden sm:block">Share On Facebook</span>
        </a>
        <a className="border rounded p-4 font-md font-gotham text-2xl sm:text-sm text-slate-800 flex items-center cursor-pointer hover:text-black ml-2 mb-2">
          <FaTwitter color="#1DA1F2" />
          <span className="ml-3 hidden sm:block">Share On Twitter</span>
        </a>
        <a className="border rounded p-4 font-md font-gotham text-2xl sm:text-sm text-slate-800 flex items-center cursor-pointer hover:text-black ml-2 mb-2">
          <FaInstagram color="#405DE6" />
          <span className="ml-3 hidden sm:block">Share On Instagram</span>
        </a>
        <a className="border rounded p-4 font-md font-gotham text-2xl sm:text-sm text-slate-800 flex items-center cursor-pointer hover:text-black ml-2 mb-2">
          <FaWhatsapp color="#25D366" />
          <span className="ml-3 hidden sm:block">Share On Whatsapp</span>
        </a>
      </div>
    </div>
  );
};

export default agentConsole;
