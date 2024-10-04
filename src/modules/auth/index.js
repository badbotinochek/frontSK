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

localStorage.clear();

const MIN_PRELOADER_DURATION = 1000; // Минимальная продолжительность в миллисекундах (1 секунда)

function hidePreloader() {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    // Устанавливаем текущее время и время, когда прелоадер должен исчезнуть
    const startTime = new Date().getTime();
    const hideTime = startTime + MIN_PRELOADER_DURATION;

    // Функция для скрытия прелоадера
    function removePreloader() {
      preloader.style.opacity = "0"; // Плавное исчезновение
      setTimeout(() => {
        preloader.style.display = "none"; // Полное удаление с экрана
      }, 500); // Время плавного исчезновения
    }

    // Определяем текущее время и вычисляем оставшееся время
    const currentTime = new Date().getTime();
    const delay = Math.max(0, hideTime - currentTime);

    // Устанавливаем таймер на минимальное время или задержку до текущего времени
    setTimeout(removePreloader, delay);
  }
}

// Скрытие прелоадера после полной загрузки страницы
window.addEventListener("load", () => {
  hidePreloader();
});

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
