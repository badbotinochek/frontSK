import {
  handleOpenModal,
  checkRequiredFields,
  handleSumInput,
  keepOnlyNumbers,
  closeDialog,
  getAllMyLiability,
} from "./utils.js";

import {
  redirectToAuth,
  checkAndUpdateToken,
  handleTooltipMouseEnter,
  handleTooltipMouseLeave,
  displayUsername,
  hidePreloader,
  handleNavClick,
} from "../other_functions/shared_functions.js";

import { formDebts } from "./constants.js";

document.addEventListener("DOMContentLoaded", function (e) {
  checkAndUpdateToken();
  redirectToAuth();
  displayUsername();
  getAllMyLiability();
  hidePreloader();

  // Обработчики для отображению тултипов
  document.addEventListener("mouseenter", handleTooltipMouseEnter, true);
  document.addEventListener("mouseleave", handleTooltipMouseLeave, true);

  // Обработчики для переходов по страницам на sidebar
  document
    .querySelectorAll(".menu-links .nav-link, .nav-link[data-tooltip='Выход']")
    .forEach((link) => {
      link.addEventListener("click", handleNavClick);
    });

  formDebts.buttonsOpenModal.forEach((button) => {
    button.addEventListener("click", handleOpenModal);
  });

  document.addEventListener("keydown", function (event) {
    // Если была нажата клавиша Escape (код 27)
    if (event.key === "Escape") {
      closeDialog(); // Закрыть модальное окно
    }
  });

  // Обработка валидации поля ввода суммы
  document.body.addEventListener("input", (event) => {
    const target = event.target;
    if (target.id === "inputAmount") {
      handleSumInput(target.id, event);
    }
  });

  document.body.addEventListener("input", (event) => {
    const target = event.target;
    if (target.id === "inputPercentageRate") {
      keepOnlyNumbers(target.id);
    }
  });

  // Обработка для проверки заполненности обязательных полей
  document.body.addEventListener("input", (event) => {
    const target = event.target;

    // Проверяем, что целевой элемент является обязательным полем
    if (target.classList.contains("requiredField")) {
      checkRequiredFields("modalForm"); // Проверяем обязательные поля в форме
    }
  });
});
