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
} from "./utils.js";

import { formTransactions } from "./constants.js";

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

document.addEventListener("DOMContentLoaded", function (e) {
  checkAndUpdateToken();

  getAllCategory();
  redirectToAuth();

  const userId = localStorage.getItem("user_id");
  formTransactions.userIdElement.textContent = userId;

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
  formTransactions.create_transaction.addEventListener("click", getCategory);

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
});
