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
  hidepassword1,
  hidepassword2,
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

  formRegistration.eyecon1.addEventListener("click", hidepassword1);
  formRegistration.eyecon2.addEventListener("click", hidepassword2);

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
  hidePreloader();
};
