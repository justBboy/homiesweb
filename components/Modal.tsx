import React, { ReactElement, useRef } from "react";
import useOutsideDetector from "../features/hooks/useClickOutsideDetector";
import useMountTransition from "../features/hooks/useMountTransition";

interface props {
  children: ReactElement;
  show?: boolean;
  onOutsideClicked?: Function;
}
const Modal: React.FC<props> = ({ show, children, onOutsideClicked }) => {
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
          tabIndex={-1}
          onClick={handleIsClickedOutside}
          aria-hidden="true"
          className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full"
        >
          <div
            className={`relative w-full h-full md:h-auto animate__animated ${
              show ? "animate__fadeIn" : "animate__fadeOut"
            } `}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
