import { formAuth } from "./constants.js";
import { EmailValidator } from "../other_functions/validations.js";
import { createToast } from "../notifications/index.js";
import { authenticateUser, refreshAccessToken } from "../../utils/api.js";
import { toast } from "../../shared/Toast/toast.js";

export function checkForm() {
  const email = formAuth.email.value;
  const password = formAuth.password.value;
  if (email && password) {
    formAuth.button.classList.remove("disable");
  } else {
    formAuth.button.classList.add("disable");
  }
}

export function addRememberMe() {
  if (this.checked) {
    localStorage.setItem("rememberMe", "true");
  } else {
    localStorage.removeItem("rememberMe");
  }
}

export function removeErrorStyle() {
  formAuth.error.classList.remove("view");
}

export async function loginUser() {
  let buttonClicked = false;
  if (formAuth.email.classList.contains("email-error")) {
    formAuth.email.classList.remove("email-error");
  }
  if (formAuth.password.classList.contains("password-error")) {
    formAuth.password.classList.remove("password-error");
  }

  if (buttonClicked) {
    return;
  }
  formAuth.button.classList.add("disable");
  buttonClicked = true;
  formAuth.button.disabled = true;
  const email = formAuth.email.value;
  const password = formAuth.password.value;

  if (!EmailValidator.validate(email)) {
    formAuth.email.classList.add("email-error");
    formAuth.button.classList.add("disable");
    formAuth.error.classList.add("view");
    formAuth.button.disabled = false;
    buttonClicked = false;
    return;
  }

  try {
    const loginData = await authenticateUser(email, password);
    setTimeout(() => {
      formAuth.button.disabled = false;
      buttonClicked = false;
      formAuth.button.classList.remove("disable");
    }, 1000);

    if (loginData.refresh_token) {
      localStorage.setItem("user_id", loginData.user_id);
      await refreshAccessToken(loginData.refresh_token);
    }
  } catch (error) {
    if (error.message === "Ошибка аутентификации") {
      formAuth.button.classList.remove("disable");
      const errorMessage = "Неверный логин или пароль.";
      formAuth.email.classList.add("email-error");
      formAuth.password.classList.add("password-error");
      createToast("error", errorMessage);
    }
    setTimeout(() => {
      formAuth.button.disabled = false;
      formAuth.button.classList.remove("disable");
      buttonClicked = false;
    }, 100);
  }
}

export function redirectToRegistration() {
  window.location.href = "../pages/registration/index.html";
}
