import { formRegistration } from "./constants.js";
import {
  redirectToAuth,
  checkRegistrationForm,
  userRegistration,
  removeErrorStyle,
  removeErrorStyleMobile,
  removeErrorPasswordRepeat,
  removeErrorPassword,
  onPhoneInput,
  onPhoneKeyDown,
} from "./utils.js";

window.onload = function () {
  // изменить на цикл
  formRegistration.userName.addEventListener("input", checkRegistrationForm);
  formRegistration.mobile.addEventListener("input", checkRegistrationForm);
  formRegistration.mobile.addEventListener("focus", removeErrorStyleMobile);
  formRegistration.email.addEventListener("input", checkRegistrationForm);
  formRegistration.email.addEventListener("focus", removeErrorStyle);
  formRegistration.password.addEventListener("input", checkRegistrationForm);
  formRegistration.passwordRepeat.addEventListener(
    "input",
    checkRegistrationForm
  );
  formRegistration.passwordRepeat.addEventListener(
    "focus",
    removeErrorPasswordRepeat
  );

  formRegistration.password.addEventListener("focus", removeErrorPassword);

  formRegistration.registrationButton.addEventListener(
    "click",
    userRegistration
  );
  formRegistration.redirectToAuthButton.addEventListener(
    "click",
    redirectToAuth
  );

  formRegistration.mobile.addEventListener("input", onPhoneInput);
  formRegistration.mobile.addEventListener("keydown", onPhoneKeyDown);
};
