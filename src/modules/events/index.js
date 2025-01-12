import {
  getMyEvents,
  getMyInvitation,
  getForeignInvitation,
  handleOpenMainModal,
  closeDialog,
} from "./utils.js";

import { formEvent } from "./constants.js";

import {
  redirectToAuth,
  checkAndUpdateToken,
  displayUsername,
  handleTooltipMouseEnter,
  handleTooltipMouseLeave,
  handleNavClick,
  hidePreloader,
} from "../other_functions/shared_functions.js";

document.addEventListener("DOMContentLoaded", function () {
  // Предварительная загрузка данных
  checkAndUpdateToken();
  redirectToAuth();
  displayUsername();
  getMyEvents();
  getMyInvitation();
  getForeignInvitation();

  // Обработчики для отображению тултипов
  document.addEventListener("mouseenter", handleTooltipMouseEnter, true);
  document.addEventListener("mouseleave", handleTooltipMouseLeave, true);

  // Обработчики для переходов по страницам на sidebar
  document
    .querySelectorAll(".menu-links .nav-link, .nav-link[data-tooltip='Выход']")
    .forEach((link) => {
      link.addEventListener("click", handleNavClick);
    });

  // Обработчик для нажатия на кнопку открыть модальное окно
  formEvent.buttonsOpenModal.addEventListener("click", () => handleOpenMainModal('event', 'create'));


  // Обработчик для нажатия на кнопку Escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDialog();
    }
  });

  hidePreloader();
});
