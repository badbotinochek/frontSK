import { formPasswordRecovery } from "./constants.js";
import { EmailValidator } from "../other_functions/validations.js";
import { recoveryPasswordApi } from "../../utils/api.js";
import { createToast } from "../notifications/index.js";

export function redirectAuth() {
  window.location.href = "../auth/index.html";
}

export function checkFormPasswordREcovery() {
  const email = formPasswordRecovery.email.value;
  if (email) {
    formPasswordRecovery.recoveryPasswordButton.classList.remove("disable");
  } else {
    formPasswordRecovery.recoveryPasswordButton.classList.add("disable");
  }
}

export async function recoveryPassword() {
  let buttonClicked = false;
  if (formPasswordRecovery.email.classList.contains("email-error")) {
    formPasswordRecovery.email.classList.remove("email-error");
  }

  if (buttonClicked) {
    return;
  }
  formPasswordRecovery.recoveryPasswordButton.classList.add("disable");
  buttonClicked = true;
  formPasswordRecovery.recoveryPasswordButton.disabled = true;
  const email = formPasswordRecovery.email.value;

  if (!EmailValidator.validate(email)) {
    formPasswordRecovery.email.classList.add("email-error");
    formPasswordRecovery.recoveryPasswordButton.classList.add("disable");
    formPasswordRecovery.errorTextEmail.classList.add("view");
    formPasswordRecovery.recoveryPasswordButton.disabled = false;
    buttonClicked = false;
    return;
  }

  try {
    const response = await recoveryPasswordApi(email);
    setTimeout(() => {
      formPasswordRecovery.recoveryPasswordButton.disabled = false;
      buttonClicked = false;
      formPasswordRecovery.recoveryPasswordButton.classList.remove("disable");
    }, 1000);
    console.log(response.message);
    if (response.message === "Ok") {
      // Редирект на другую страницу
      localStorage.setItem("user_recovery_email", email);
      window.location.href = "../registration_confirmation/index.html";
    } else {
      // Обработка других случаев

      console.log("Другой код состояния:", response.status);
    }
  } catch (error) {
    const errorMessage = "Аккаунт с таким адресом почты не найден";
    createToast("error", errorMessage);
    formPasswordRecovery.recoveryPasswordButton.classList.remove("disable");
  }
  setTimeout(() => {
    formPasswordRecovery.recoveryPasswordButton.disabled = false;
    formPasswordRecovery.recoveryPasswordButton.classList.remove("disable");
    buttonClicked = false;
  }, 100);
}

export function removeEmailErrorStyle() {
  formPasswordRecovery.errorTextEmail.classList.remove("view");
}
