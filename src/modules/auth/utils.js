import { formAuth } from "./constants.js";
import { EmailValidator } from "../other_functions/validations.js";
import { createToast } from "../notifications/index.js";
import { authenticateUser, refreshAccessToken } from "../../utils/api.js";

export function checkForm() {
  const email = formAuth.email.value;
  const password = formAuth.password.value;
  if (email && password) {
    formAuth.button.classList.remove("disabled");
    formAuth.button.disabled = false;
    formAuth.button.removeAttribute("data-tooltip");
  } else {
    formAuth.button.classList.add("disabled");
    formAuth.button.disabled = true;
    formAuth.button.setAttribute(
      "data-tooltip",
      "Введите адрес электронной почты и пароль"
    );
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
  const email = formAuth.email.value;
  const password = formAuth.password.value;

  if (formAuth.button.disabled) {
    return;
  }

  formAuth.button.disabled = true;
  formAuth.button.classList.add("disabled");

  if (formAuth.email.classList.contains("email-error")) {
    formAuth.email.classList.remove("email-error");
  }
  if (formAuth.password.classList.contains("password-error")) {
    formAuth.password.classList.remove("password-error");
  }

  if (!EmailValidator.validate(email)) {
    formAuth.email.classList.add("email-error");
    formAuth.error.classList.add("view");
    return;
  }

  try {
    const loginData = await authenticateUser(email, password);
    setTimeout(() => {}, 1000);

    if (loginData.refresh_token) {
      localStorage.setItem("user_id", loginData.user.id);
      localStorage.setItem("user_name", loginData.user.name);
      await refreshAccessToken(loginData.refresh_token);
    }
  } catch (error) {
    if (error.message === "Ошибка аутентификации") {
      const errorMessage = "Неверный логин или пароль.";
      formAuth.email.classList.add("email-error");
      formAuth.password.classList.add("password-error");
      createToast("error", errorMessage);
    }
    setTimeout(() => {
      formAuth.button.disabled = false;
      formAuth.button.classList.remove("disabled");
    }, 100);
  }
}

export function hidepassword() {
  if (formAuth.password.type === "password") {
    formAuth.password.type = "text";
    formAuth.eyecon.classList.add("fa-eye");
    formAuth.eyecon.classList.remove("fa-eye-slash");
  } else {
    formAuth.password.type = "password";
    formAuth.eyecon.classList.remove("fa-eye");
    formAuth.eyecon.classList.add("fa-eye-slash");
  }
}

export function redirectToRegistration() {
  window.location.href = "../../pages/registration/index.html";
}

export function redirectToRecoveryPassword() {
  window.location.href = "../../pages/password_recovery/index.html";
}
