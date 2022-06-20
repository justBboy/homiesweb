import React, { ReactElement, useEffect, useRef } from "react";
import useOutsideDetector from "../features/hooks/useClickOutsideDetector";

interface props {
  children: ReactElement;
  show?: boolean;
  onOutsideClicked?: Function;
}

const BottomModal: React.FC<props> = ({ children, show, onOutsideClicked }) => {
  const containerRef = useRef(null);
  const outsideClicked = useOutsideDetector(containerRef);

  const handleIsClickedOutside = () => {
    if (outsideClicked && onOutsideClicked) {
      onOutsideClicked();
    }
  };

  return (
    <div
      onClick={handleIsClickedOutside}
      className={`relative z-10 transition overflow-hidden ${
        show ? "visible" : "invisible"
      }`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`fixed inset-0 bg-black transition-opacity overflow-hidden duration-500 ${
          show ? "bg-opacity-75 " : "bg-opacity-0"
        }`}
      ></div>

      <div className={`fixed z-10 inset-0 overflow-hidden`}>
        <div
          className={`flex items-end justify-center overflow-hidden min-h-full text-center sm:p-0`}
        >
          <div
            className={`relative bg-white rounded-lg overflow-hidden min-w-[100vw] text-left shadow-xl transform sm:w-full`}
          >
            <div
              ref={containerRef}
              className={`bg-white sm:overflow-y-hidden overflow-y-auto ${
                show ? "h-[50vh]" : "h-0"
              } transition-height duration-300 px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomModal;
