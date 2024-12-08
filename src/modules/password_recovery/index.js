import { formPasswordRecovery } from "./constants.js";

import {
  redirectAuth,
  checkFormPasswordREcovery,
  recoveryPassword,
  removeEmailErrorStyle,
} from "./utils.js";
import {
  handleTooltipMouseEnter,
  handleTooltipMouseLeave,
} from "../other_functions/shared_functions.js";

window.onload = function () {
  // Обработчики для отображению тултипов
  document.addEventListener("mouseenter", handleTooltipMouseEnter, true);
  document.addEventListener("mouseleave", handleTooltipMouseLeave, true);

  formPasswordRecovery.redirectAuthButton.addEventListener(
    "click",
    redirectAuth
  );

  formPasswordRecovery.email.addEventListener(
    "input",
    checkFormPasswordREcovery
  );

  formPasswordRecovery.recoveryPasswordButton.addEventListener(
    "click",
    recoveryPassword
  );

  formPasswordRecovery.email.addEventListener("focus", removeEmailErrorStyle);
};
