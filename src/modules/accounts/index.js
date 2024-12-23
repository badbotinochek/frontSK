import {
  getAllMyAccounts,
  handleOpenModalCreate,
  closeDialog,
} from "./utils.js";
import { formAccounts } from "./constants.js";
import { createToast } from "../notifications/index.js";

import {
  redirectToAuth,
  checkAndUpdateToken,
  displayUsername,
  handleTooltipMouseEnter,
  handleTooltipMouseLeave,
  handleNavClick,
  hidePreloader,
} from "../other_functions/shared_functions.js";

document.addEventListener("DOMContentLoaded", function (e) {
  // Предварительная загрузка данных
  checkAndUpdateToken();
  redirectToAuth();
  getAllMyAccounts();
  displayUsername();

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
  formAccounts.buttonsOpenModal.addEventListener(
    "click",
    handleOpenModalCreate
  );

  // Обработчик для нажатия на кнопку Escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDialog();
    }
  });

  hidePreloader();
});
