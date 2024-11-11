import {
  checkForm,
  handleClick,
  handleClickTra,
  createTransaction,
  deleteTransactions,
  getTransactions,
  getEvent,
  sidebar,
  getDate,
  changeStyleBorder,
  customTextArea,
  exit,
  toggleDropdown,
  closeDropdown,
  onSumInput,
  onPhoneKeyDown,
  getCategory,
  toggleDropdownCat,
  checkEvent,
  checkCreateTranForm,
  createNewTransaction,
  checkForChanges,
  deleteSErrorBorder,
  deleteEErrorBorder,
  checkAndUpdateToken,
  handleClickTraShow,
  redirectToAuth,
  getCountRowsTable,
  updateTransaction,
  getAllCategory,
  closeDropdownTransaction,
  openQrScanner,
  hidePreloader,
  renderCategoryTree,
  getActiveAccounts,
  toggleDropdownAcc,
} from "./utils.js";

import { formTransactions } from "./constants.js";

// // Скрытие прелоадера после полной загрузки страницы
// window.addEventListener("load", () => {

// });

document.addEventListener("DOMContentLoaded", function (e) {
  checkAndUpdateToken();
  getActiveAccounts();
  getAllCategory();
  redirectToAuth();

  const userId = localStorage.getItem("user_id");
  const userIdElement = document.getElementById("user_id");
  userIdElement.textContent = userId;
  userIdElement.title = `ID пользователя: ${userId}`;
  const userName = localStorage.getItem("user_name");
  formTransactions.userIdElement.textContent = userName;

  // Проверяем, что все поля, которые нужны для получения транзакций заполнены
  checkForm();
  checkEvent();
  formTransactions.start_date.addEventListener("input", checkForm);
  formTransactions.end_date.addEventListener("input", checkForm);
  // Проблема: работает только после перезагрузки страницы - не работает!
  formTransactions.input_event.addEventListener("input", checkForm);
  formTransactions.input_event.addEventListener("input", checkEvent);

  // Обработчики для закрытия модального окна
  formTransactions.cancel.addEventListener("click", handleClick);
  formTransactions.cancelTra.addEventListener("click", handleClickTra);
  // Обработчики для открытия модального окна
  // formTransactions.create_transaction.addEventListener("click", getCategory);

  formTransactions.create_transaction.addEventListener(
    "click",
    createTransaction
  );

  formTransactions.editTransactionButton.addEventListener(
    "click",
    updateTransaction
  );

  formTransactions.showCancelTra.addEventListener("click", handleClickTraShow);

  formTransactions.start_date.addEventListener("click", deleteSErrorBorder);
  formTransactions.end_date.addEventListener("click", deleteEErrorBorder);

  formTransactions.end_date.addEventListener("change", function () {
    formTransactions.getTransactionButton.classList.remove("disable");
  });

  formTransactions.start_date.addEventListener("change", function () {
    formTransactions.getTransactionButton.classList.remove("disable");
  });

  // Обработчики для потверждения удаления транзакции
  formTransactions.aprove_delete.addEventListener("click", deleteTransactions);

  formTransactions.getTransactionButton.addEventListener("click", () =>
    getTransactions()
  );

  formTransactions.labelMoreTransaction.addEventListener("click", () => {
    const offset = getCountRowsTable();
    getTransactions(offset, true);
  });

  getEvent();

  // Обработчик для сайдбара
  sidebar();

  //Функциональность для заполнения периода по умолчанию
  getDate();

  //  обработчик события при фокусировке на элементе

  //  обработчик события при потере фокуса элементом
  formTransactions.descriptionTextarea.addEventListener("blur", customTextArea);

  //  обработчик события нажатия на кнопку "выход"
  formTransactions.exit.addEventListener("click", exit);

  formTransactions.dropdown.addEventListener("click", toggleDropdown);
  formTransactions.dropdownCat.addEventListener("click", toggleDropdownCat);

  formTransactions.dropdownAcc.addEventListener("click", toggleDropdownAcc);

  document.addEventListener("click", closeDropdown);

  document.addEventListener("click", closeDropdownTransaction);

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
  formTransactions.accountBox.addEventListener("input", checkCreateTranForm);

  const radioButtons = document.querySelectorAll(
    "input[name='typeTransaction']"
  );
  radioButtons.forEach((getTransactionButton) => {
    getTransactionButton.addEventListener("change", checkCreateTranForm);
  });

  formTransactions.createTra.addEventListener("click", createNewTransaction);

  formTransactions.row.addEventListener("click", checkCreateTranForm);

  // var table = document.querySelector(".custom-table tbody");
  // if (table) {
  //   table.addEventListener("click", function (event) {
  //     console.log(table);

  //     var target = event.target;
  //     if (target.tagName === "TD") {
  //       var selectedRow = target.parentNode;
  //       // Удаляем класс selected-row у всех строк таблицы
  //       var allRows = table.querySelectorAll("tr");
  //       allRows.forEach(function (row) {
  //         row.classList.remove("selected-row");
  //       });
  //       // Добавляем класс selected-row только к выбранной строке
  //       selectedRow.classList.add("selected-row");
  //       // Получаем номер транзакции
  //       var transactionNumber = selectedRow.cells[0].innerText;
  //       console.log("Выбрана транзакция с номером:", transactionNumber);
  //     }
  //   });
  // }

  formTransactions.modalElementTr.addEventListener("change", checkForChanges);

  checkAndUpdateToken();

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

  formTransactions.buttonScanQr.addEventListener("click", openQrScanner);

  document.addEventListener("click", function (event) {
    const target = event.target.closest("#close-icon"); // Проверяем, кликнули ли по иконке закрытия
    if (target) {
      formTransactions.modalReceiptDetails.close(); // Закрываем диалог
    }
  });

  hidePreloader();

  radioButtons.forEach((radioButton) => {
    radioButton.addEventListener("change", () => {
      const selectedType = document.querySelector(
        "input[name='typeTransaction']:checked"
      ).value;
      renderCategoryTree(selectedType); // Обновляем дерево категорий при изменении радиокнопки
    });
  });
});
