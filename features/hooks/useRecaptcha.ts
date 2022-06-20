import { RecaptchaVerifier } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../libs/Firebase";

const useRecaptcha = (recaptchaClass: string) => {
  const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier>();
  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(recaptchaClass, {}, auth);
    setRecaptcha(recaptchaVerifier);
  }, []);
  return recaptcha;
};

export default useRecaptcha;
