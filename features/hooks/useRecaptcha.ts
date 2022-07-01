import { RecaptchaVerifier } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../libs/Firebase";

const useRecaptcha = (recaptchaClass: string) => {
  const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier>();
  const createRecaptcha = (recaptchaClass: string) => {
    const recaptchaVerifier = new RecaptchaVerifier(
      recaptchaClass,
      {
        size: "invisible",
        callback: (response: any) => {
          console.log(response);
          //
        },
      },
      auth
    );
    return recaptchaVerifier;
  };
  useEffect(() => {
    const recaptchaVerifier = createRecaptcha(recaptchaClass);
    setRecaptcha(recaptchaVerifier);
  }, []);
  return { recaptcha, createRecaptcha };
};

export default useRecaptcha;
