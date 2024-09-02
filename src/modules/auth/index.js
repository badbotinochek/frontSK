import { redirectAutorize } from "../../utils/api.js";

import { formAuth } from "./constants.js";
import {
  checkForm,
  addRememberMe,
  removeErrorStyle,
  loginUser,
  redirectToRegistration,
  hidepassword,
  redirectToRecoveryPassword,
} from "./utils.js";

window.onload = function () {
  formAuth.email.addEventListener("input", checkForm);
  formAuth.email.addEventListener("focus", removeErrorStyle);
  formAuth.password.addEventListener("input", checkForm);
  formAuth.rememberMeCheckbox.addEventListener("change", addRememberMe);
  formAuth.button.addEventListener("click", loginUser);
  formAuth.registrationButton.addEventListener("click", redirectToRegistration);

  formAuth.eyecon.addEventListener("click", hidepassword);
  formAuth.labelForgetPassword.addEventListener(
    "click",
    redirectToRecoveryPassword
  );

  redirectAutorize();
};
