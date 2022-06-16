import React, { ReactElement, useRef } from "react";
import useOutsideDetector from "../features/hooks/useClickOutsideDetector";
import useMountTransition from "../features/hooks/useMountTransition";

interface props {
  children: ReactElement;
  show?: boolean;
  onOutsideClicked?: Function;
}
const CenterModal: React.FC<props> = ({ children, show, onOutsideClicked }) => {
  const hasTransitionedIn = useMountTransition(Boolean(show), 500);
  const containerRef = useRef(null);
  const outsideClicked = useOutsideDetector(containerRef);

  const handleIsClickedOutside = () => {
    if (outsideClicked && onOutsideClicked) {
      onOutsideClicked();
    }
  };
  return (
    <>
      {(hasTransitionedIn || show) && (
        <div
          onClick={handleIsClickedOutside}
          className="relative z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
              <div
                className={`relative  ${
                  show ? "animate__bounceIn" : "animate__bounceOut"
                } bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full`}
              >
                <div
                  ref={containerRef}
                  className={`bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CenterModal;
