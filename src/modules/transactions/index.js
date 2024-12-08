import {
  checkForm,
  handleClick,
  fillEventDirectory,
  createTransaction,
  deleteTransactions,
  getTransactions,
  fillCurrentDate,
  changeStyleBorder,
  customTextArea,
  onSumInput,
  onPhoneKeyDown,
  getCategory,
  toggleDropdownCat,
  checkCreateTranForm,
  createNewTransaction,
  checkForChanges,
  deleteSErrorBorder,
  deleteEErrorBorder,
  getCountRowsTable,
  updateTransaction,
  getAllCategory,
  closeDropdownTransaction,
  // renderCategoryTree,
  getActiveAccounts,
  toggleDropdownAcc,
  openDialog,
  clearTransactionPage,
  toggleModalDropdown,
} from "./utils.js";

import { formTransactions } from "./constants.js";
import {
  redirectToAuth,
  checkAndUpdateToken,
  displayUsername,
  handleTooltipMouseEnter,
  handleTooltipMouseLeave,
  toggleDropdown,
  toggleDropdown1,
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

  document.querySelectorAll(".buttonOpenModal").forEach((button) => {
    button.addEventListener("click", (event) => {
      const type = event.target.dataset.type;
      const mode = event.target.dataset.mode;

      openDialog(type, mode, mode !== "create");
    });
  });
  formTransactions.getTransactionButton.addEventListener("click", () =>
    getTransactions()
  );

  // Обработчики для диалоговых окон
  // document.addEventListener("click", (event) => {
  //   if (event.target.matches(".button-class")) {
  //     // Действия при нажатии на кнопку
  //     console.log("Кнопка нажата");
  //   }

  //   if (event.target.matches(".modalDropdown input")) {
  //     // Открытие выпадающего списка
  //     console.log("Открытие выпадающего списка");
  //   }
  // });

  // document.getElementById("modalForm").addEventListener("click", (event) => {
  //   const target = event.target;

  //   // Ищем ближайший элемент с классом modalDropdown
  //   const dropdownTrigger = target.closest(".modalDropdown");

  //   if (dropdownTrigger) {
  //     const dropdownId = dropdownTrigger.id;
  //     if (dropdownId == "modalDropdownAccount") {
  //       // Находим вложенный элемент с классом modalOption
  //       const optionElement = dropdownTrigger.querySelector(".modalOption");
  //       const optionId = optionElement ? optionElement.id : null;
  //       const inputElement =
  //         dropdownTrigger.querySelector("#modalInputAccount");
  //       const inputId = inputElement ? inputElement.id : null;
  //       const typeDropdown = "dropdownAccount";
  //       toggleModalDropdown(
  //         dropdownId,
  //         optionId,
  //         inputId,
  //         dropdownTrigger,
  //         typeDropdown
  //       );
  //     } else if (dropdownId == "modalDropdownCategory") {
  //       // Находим вложенный элемент с классом modalOption
  //       const optionElement = dropdownTrigger.querySelector(".modalOption");
  //       const optionId = optionElement ? optionElement.id : null;
  //       const inputElement = dropdownTrigger.querySelector(
  //         "#modalDropdownCategory"
  //       );
  //       const inputId = inputElement ? inputElement.id : null;
  //       const typeDropdown = "dropdownCategory";

  //       toggleModalDropdown(
  //         dropdownId,
  //         optionId,
  //         inputId,
  //         dropdownTrigger,
  //         typeDropdown
  //       );
  //     }

  //     // Передаем ID dropdown, option и input
  //   }
  // });

  document.getElementById("modalForm").addEventListener("click", (event) => {
    const target = event.target;
    const dropdownTrigger = target.closest(".modalDropdown");

    if (dropdownTrigger) {
      const dropdownId = dropdownTrigger.id;
      toggleModalDropdown(dropdownId);
    }
  });

  formTransactions.cancel.addEventListener("click", handleClick);

  // if (target.closest("#modalDropdownAccount")) {
  //   const dropdownElement = document.getElementById("modalDropdownAccount");
  //   toggleDropdown1(dropdownElement);
  //   event.stopPropagation();
  //   // Ваш код здесь
  // }

  // if (target.closest("#modalDropdownCategory")) {
  //   const dropdownElement = document.getElementById("modalDropdownCategory");
  //   toggleDropdown1(dropdownElement);
  //   event.stopPropagation();
  // }

  // formTransactions.dropdownCat.addEventListener("click", toggleDropdownCat);
  // document.addEventListener("click", (event) => {
  //   if (event.target.closest("#modalDropdownAccount")) {
  //     toggleDropdownAcc(event);
  //   }
  // });
  // // document.addEventListener("click", (event) => {
  // //   if (event.target.closest("#modalAccountBox")) {
  // //     toggleDropdownAcc(event);
  // //   }
  // // });

  // document.addEventListener("click", closeDropdown);
  // document.addEventListener("click", closeDropdownTransaction);
  formTransactions.sumTransaction.addEventListener("input", onSumInput);
  formTransactions.sumTransaction.addEventListener("keydown", onPhoneKeyDown);
  formTransactions.dateTransaction.addEventListener(
    "input",
    checkCreateTranForm
  );
  formTransactions.timeTransaction.addEventListener(
    "input",
    checkCreateTranForm
  );
  formTransactions.sumTransaction.addEventListener(
    "input",
    checkCreateTranForm
  );
  formTransactions.catTransaction.addEventListener(
    "input",
    checkCreateTranForm
  );

  const radioButtons = document.querySelectorAll(
    "input[name='typeTransaction']"
  );
  radioButtons.forEach((getTransactionButton) => {
    getTransactionButton.addEventListener("change", checkCreateTranForm);
  });
  formTransactions.createTra.addEventListener("click", createNewTransaction);
  formTransactions.row.addEventListener("click", checkCreateTranForm);
  const treeContainer = document.querySelector(".dropdown1 .option1");
  const inputElement = document.querySelector(".categoryBox");

  treeContainer.addEventListener("mouseover", (event) => {
    let target = event.target;

    // Поиск родительского <li>
    while (target && target.tagName !== "LI") {
      target = target.parentNode;
    }

    if (target) {
      target.classList.add("highlight");
    }
  });
  treeContainer.addEventListener("mouseout", (event) => {
    let target = event.target;

    // Поиск родительского <li>
    while (target && target.tagName !== "LI") {
      target = target.parentNode;
    }

    if (target) {
      target.classList.remove("highlight");
    }
  });
  treeContainer.addEventListener("click", (event) => {
    let target = event.target;

    // Поиск родительского <li>
    while (target && target.tagName !== "LI") {
      target = target.parentNode;
    }

    if (target) {
      inputElement.value = target.textContent.trim();
    }
  });

  document.addEventListener("click", function (event) {
    const target = event.target.closest("#close-icon"); // Проверяем, кликнули ли по иконке закрытия
    if (target) {
      formTransactions.modalReceiptDetails.close(); // Закрываем диалог
    }
  });

  // radioButtons.forEach((radioButton) => {
  //   radioButton.addEventListener("change", () => {
  //     const selectedType = document.querySelector(
  //       "input[name='typeTransaction']:checked"
  //     ).value;
  //     renderCategoryTree(selectedType);
  //   });
  // });

  // Обработчики работы с таблицей
  formTransactions.editTransactionButton.addEventListener(
    "click",
    updateTransaction
  );

  formTransactions.aprove_delete.addEventListener("click", deleteTransactions);
  formTransactions.labelMoreTransaction.addEventListener("click", () => {
    const offset = getCountRowsTable();
    getTransactions(offset, true);
  });

  // хз че такое

  formTransactions.startDateEvent.addEventListener("click", deleteSErrorBorder);
  formTransactions.endDateEvent.addEventListener("click", deleteEErrorBorder);
  // formTransactions.endDateEvent.addEventListener("change", function () {
  //   formTransactions.getTransactionButton.classList.remove("disable");
  // });
  // formTransactions.startDateEvent.addEventListener("change", function () {
  //   formTransactions.getTransactionButton.classList.remove("disable");
  // });
  formTransactions.descriptionTextarea.addEventListener("blur", customTextArea);

  hidePreloader();
});
