import {
  checkForm,
  fillEventDirectory,
  handleOpenMainModal,
  manageLogicTransactions,
  fillCurrentDate,
  getCategory,
  deleteErrorBorder,
  getCountRowsTable,
  getAllCategory,
  closeDialog,
  getActiveAccounts,
  clearTransactionPage,
} from "./utils.js";

import { formTransactions } from "./constants.js";
import {
  redirectToAuth,
  checkAndUpdateToken,
  displayUsername,
  handleTooltipMouseEnter,
  handleTooltipMouseLeave,
  toggleDropdown,
  handleNavClick,
  hidePreloader,
} from "../other_functions/shared_functions.js";

document.addEventListener("DOMContentLoaded", function (e) {
  // Предварительная загрузка данных
  checkAndUpdateToken();
  redirectToAuth();
  clearTransactionPage();
  fillEventDirectory();
  displayUsername();
  getActiveAccounts();
  getAllCategory();
  fillCurrentDate();
  getCategory();

  // Обработчики для отображению тултипов
  document.addEventListener("mouseenter", handleTooltipMouseEnter, true);
  document.addEventListener("mouseleave", handleTooltipMouseLeave, true);

  // Обработчики для переходов по страницам на sidebar
  document
    .querySelectorAll(".menu-links .nav-link, .nav-link[data-tooltip='Выход']")
    .forEach((link) => {
      link.addEventListener("click", handleNavClick);
    });

  // Обработчики для работы navbar
  formTransactions.eventDropdown.addEventListener("click", toggleDropdown);
  formTransactions.startDateEvent.addEventListener("change", checkForm);
  formTransactions.endDateEvent.addEventListener("change", checkForm);
  formTransactions.startDateEvent.addEventListener("click", deleteErrorBorder);
  formTransactions.endDateEvent.addEventListener("click", deleteErrorBorder);
  document.querySelectorAll(".buttonOpenModal").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (button.classList.contains("disable")) {
        e.preventDefault();
        return;
      }
      const entity = event.target.dataset.type;

      localStorage.removeItem("transactionCategoryId");
      localStorage.removeItem("sourceTargetId");
      localStorage.removeItem("sourceAccountId");

      handleOpenMainModal(entity, "create");
    });
  });

  formTransactions.getTransactionButton.addEventListener("click", (e) => {
    if (formTransactions.getTransactionButton.classList.contains("disable")) {
      e.preventDefault();
      return;
    }
    manageLogicTransactions();
  });

  // Обработчик для нажатия на кнопку Escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDialog();
    }
  });

  formTransactions.labelMoreTransaction.addEventListener("click", () => {
    const offset = getCountRowsTable();
    manageLogicTransactions(offset, true);
  });

  hidePreloader();
});
