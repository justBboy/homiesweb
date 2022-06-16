import React, { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import CenterModal from "./CenterModal";

interface props {
  onConfirm: () => void;
  confirmText?: string;
  show?: boolean;
  setShow?: (val: boolean) => void;
  loading?: boolean;
}
const ConfirmModal: React.FC<props> = ({
  onConfirm,
  setShow,
  show,
  confirmText,
  loading,
}) => {
  const handleClickOutside = () => {
    if (setShow) setShow(false);
  };
  return (
    <CenterModal show={show} onOutsideClicked={handleClickOutside}>
      <div className="w-full flex flex-col items-center">
        <p>{confirmText ? confirmText : "Are you sure"}</p>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            onClick={handleClickOutside}
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              if (setShow) setShow(false);
            }}
            disabled={loading}
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {loading ? <AiOutlineLoading className={`animate-spin`} /> : "OK"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
};

export default ConfirmModal;
