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
} from "./utils.js";

import { formTransactions } from "./constants.js";

document.addEventListener("DOMContentLoaded", function (e) {
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

  let html5QrCode;
  let scanning = false;

  document
    .getElementById("button_scan_qr")
    .addEventListener("click", function () {
      if (scanning) return;

      // Запрашиваем доступ к камере
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          const scannerForm = document.getElementById("scanner-form");
          scannerForm.style.display = "block"; // Показываем форму
          startScanner(); // Запускаем сканирование
        })
        .catch((err) => {
          console.error("Ошибка доступа к камере: ", err);
          alert(
            "Не удалось получить доступ к камере. Пожалуйста, проверьте разрешения."
          );
        });
    });

  document.getElementById("stop-button").addEventListener("click", function () {
    stopScanner();
  });

  function startScanner() {
    const reader = document.getElementById("reader");
    const result = document.getElementById("result");
    const startButton = document.getElementById("button_scan_qr");
    const stopButton = document.getElementById("stop-button");

    html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cameras && cameras.length) {
          var cameraId = cameras[0].id;
          reader.style.display = "block";
          html5QrCode
            .start(
              { deviceId: { exact: cameraId } },
              {
                fps: 10, // Количество кадров в секунду
                qrbox: { width: 250, height: 250 }, // Размер области сканирования
              },
              (qrCodeMessage) => {
                result.innerHTML = `QR Code detected: ${qrCodeMessage}`;
                stopScanner(); // Остановить сканер после успешного сканирования
              },
              (errorMessage) => {
                console.warn(`Ошибка: ${errorMessage}`);
              }
            )
            .catch((err) => {
              console.error("Ошибка при запуске сканера: ", err);
            });

          scanning = true;
          startButton.disabled = true;
          stopButton.disabled = false;
        }
      })
      .catch((err) => {
        console.error("Ошибка при получении камеры: ", err);
      });
  }

  function stopScanner() {
    if (scanning && html5QrCode) {
      html5QrCode
        .stop()
        .then(() => {
          document.getElementById("scanner-form").style.display = "none"; // Скрываем форму
          scanning = false;
          document.getElementById("start-button").disabled = false;
          document.getElementById("stop-button").disabled = true;
        })
        .catch((err) => {
          console.error("Ошибка при остановке сканера: ", err);
        });
    }
  }
});
