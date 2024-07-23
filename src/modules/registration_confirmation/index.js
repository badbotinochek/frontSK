import { formRegistrationConfirmation } from "./constants.js";
import { redirectToReg, redirectToAuth } from "./utils.js";

window.onload = function () {
  formRegistrationConfirmation.redirectToAuthButton.addEventListener(
    "click",
    redirectToAuth
  );

  formRegistrationConfirmation.redirectToRegistrationButton.addEventListener(
    "click",
    redirectToReg
  );

  const userEmail = localStorage.getItem("user_email");
  formRegistrationConfirmation.userEmailElement.textContent = userEmail;
};
