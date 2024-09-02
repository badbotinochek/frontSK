import { formPasswordRecovery } from "./constants.js";

import {
  redirectAuth,
  checkFormPasswordREcovery,
  recoveryPassword,
  removeEmailErrorStyle,
} from "./utils.js";

window.onload = function () {
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
