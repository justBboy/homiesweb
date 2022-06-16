import React, { ReactElement, useRef } from 'react'
import useOutsideDetector from '../features/hooks/useClickOutsideDetector';

interface props{
    children: ReactElement;
    show?: boolean;
    onOutsideClicked?: Function
}

const RightModal: React.FC<props> = ({children, show, onOutsideClicked}) => {
    const containerRef = useRef(null);
    const outsideClicked = useOutsideDetector(containerRef);

    const handleIsClickedOutside = () => {
        if(outsideClicked && onOutsideClicked){
            onOutsideClicked()
        }
    }

  return (
      <div onClick={handleIsClickedOutside} className={`relative z-50 transition-all duration-500 overflow-hidden ${show ? "visible" : "invisible"}`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
    
  <div className={`fixed inset-0 bg-black transition-opacity duration-500 ${show ? "bg-opacity-75 " : "bg-opacity-0"}`}></div>

  <div className={`fixed z-10 inset-0 overflow-hidden`}>
    <div className={`flex items-start justify-end overflow-hidden min-h-full text-center sm:p-0`}>
      <div className={`relative bg-white min-h-[100vh] overflow-hidden transition-transform duration-300 ${show ? "translate-x-[0%]" : "translate-x-[110%]"} w-[40w] lg:w-[30vw] text-left overflow-x-hidden overflow-y-auto shadow-xl transform`}>
        <div ref={containerRef} className={`bg-white h-[100vh] overflow-y-auto px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
          {children}
        </div>
      </div>
    </div>
  </div>
</div>
  )
}

export default RightModal