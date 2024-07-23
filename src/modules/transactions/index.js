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
  getAllCategory,
  toggleDropdownCat,
  checkEvent,
  checkCreateTranForm,
  createNewTransaction,
  checkForChanges,
  deleteSErrorBorder,
  deleteEErrorBorder,
  checkAndUpdateToken,
  handleClickTraShow,
} from "./utils.js";
import { formTransactions } from "./constants.js";

document.addEventListener("DOMContentLoaded", function (e) {
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

  formTransactions.showCancelTra.addEventListener("click", handleClickTraShow);

  formTransactions.start_date.addEventListener("click", deleteSErrorBorder);
  formTransactions.end_date.addEventListener("click", deleteEErrorBorder);

  formTransactions.end_date.addEventListener("change", function () {
    formTransactions.button.classList.remove("disable");
  });

  formTransactions.start_date.addEventListener("change", function () {
    formTransactions.button.classList.remove("disable");
  });

  // Обработчики для потверждения удаления транзакции
  formTransactions.aprove_delete.addEventListener("click", deleteTransactions);

  // Обработчик для получения транзакций
  formTransactions.button.addEventListener("click", getTransactions);

  // Обработчик для получения всех мероприятий

  setTimeout(getAllCategory, 500);

  getEvent();

  // Обработчик для сайдбара
  sidebar();

  //Функциональность для заполнения периода по умолчанию
  getDate();

  //  обработчик события при фокусировке на элементе
  formTransactions.descriptionTextarea.addEventListener(
    "focus",
    changeStyleBorder
  );

  //  обработчик события при потере фокуса элементом
  formTransactions.descriptionTextarea.addEventListener("blur", customTextArea);

  //  обработчик события нажатия на кнопку "выход"
  formTransactions.exit.addEventListener("click", exit);

  formTransactions.dropdown.addEventListener("click", toggleDropdown);
  formTransactions.dropdownCat.addEventListener("click", toggleDropdownCat);

  document.addEventListener("click", closeDropdown);

  formTransactions.sumTransactionInput.addEventListener("input", onSumInput);
  formTransactions.sumTransactionInput.addEventListener(
    "keydown",
    onPhoneKeyDown
  );

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
  radioButtons.forEach((button) => {
    button.addEventListener("change", checkCreateTranForm);
  });

  formTransactions.createTra.addEventListener("click", createNewTransaction);

  formTransactions.row.addEventListener("click", checkCreateTranForm);

  var table = document.querySelector(".custom-table tbody");
  if (table) {
    table.addEventListener("click", function (event) {
      var target = event.target;
      if (target.tagName === "TD") {
        var selectedRow = target.parentNode;
        // Удаляем класс selected-row у всех строк таблицы
        var allRows = table.querySelectorAll("tr");
        allRows.forEach(function (row) {
          row.classList.remove("selected-row");
        });
        // Добавляем класс selected-row только к выбранной строке
        selectedRow.classList.add("selected-row");
        // Получаем номер транзакции
        var transactionNumber = selectedRow.cells[0].innerText;
        console.log("Выбрана транзакция с номером:", transactionNumber);
      }
    });
  }

  const dialog = document.getElementById("modalTransaction");

  dialog.addEventListener("change", checkForChanges);

  checkAndUpdateToken();
});
