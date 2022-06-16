import React, { useEffect, useState } from "react";

function useOutsideDetector(ref: any) {
  const [outsideClicked, setOutsideClicked] = useState(false);
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOutsideClicked(true);
        return;
      }
      setOutsideClicked(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
  return outsideClicked;
}

export default useOutsideDetector;
