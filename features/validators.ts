import { loginForm, loginFormErrors } from "../pages/login";
import { registerForm, registerFormError } from "../pages/register";

export const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export const phoneNumberPattern = /^[0]?\d{9}$/;

export const validateEmail = (email: string) => {
  let error = "";
  if (!email || !emailPattern.test(email))
    error = "Email pattern incorrect, *@*.* should be the right pattern";
  return error;
};

export const validatePhone = (phone: string) => {
  let error = "";
  if (!phone || !phoneNumberPattern.test(phone) || phone.length !== 10)
    error = "Phone Number pattern incorrect";
  return error;
};

export const validateRegisterForm = (form: registerForm) => {
  const errors: Partial<registerFormError> = {};
  if (!form.email || !emailPattern.test(form.email))
    errors["email"] =
      "Email pattern incorrect, *@*.* should be the right pattern";
  if (!form.phone || !phoneNumberPattern.test(form.phone))
    errors["phone"] = "Phone Number pattern incorrect";
  return errors;
};

export const validateLoginForm = (form: loginForm) => {
  const errors: Partial<loginFormErrors> = {};
  if (!form.phone || !phoneNumberPattern.test(form.phone))
    errors["phone"] = "Phone Number pattern incorrect";
  return errors;
};
