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

import {
  hidePreloader,
  handleTooltipMouseEnter,
  handleTooltipMouseLeave,
} from "../other_functions/shared_functions.js";

localStorage.clear();

window.onload = function () {
  // Обработчики для отображению тултипов
  document.addEventListener(
    "mouseenter",
    (event) => handleTooltipMouseEnter(event, true),
    true
  );
  document.addEventListener("mouseleave", handleTooltipMouseLeave, true);

  formAuth.email.addEventListener("input", checkForm);
  formAuth.email.addEventListener("focus", removeErrorStyle);
  formAuth.password.addEventListener("input", checkForm);
  formAuth.rememberMeCheckbox.addEventListener("change", addRememberMe);
  formAuth.button.addEventListener("click", (e) => {
    if (formAuth.button.classList.contains("disabled")) {
      e.preventDefault();
      return;
    }
    loginUser();
  });
  // formAuth.registrationButton.addEventListener("click", redirectToRegistration);

  formAuth.eyecon.addEventListener("click", hidepassword);
  formAuth.labelForgetPassword.addEventListener(
    "click",
    redirectToRecoveryPassword
  );

  redirectAutorize();

  hidePreloader();
};
