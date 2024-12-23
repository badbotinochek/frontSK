import { createToast } from "../notifications/index.js";
import { debtTemplateElements } from "./templates.js";
import { formDebts } from "./constants.js";
import {
  createLiabilityitApi,
  getAllMyLiabilityApi,
  updateLiabilityitApi,
} from "../../utils/api.js";

// Глобальная переменная для хранения данных долга для сравнения
let currentDebt = null;

export function handleOpenModal(event) {
  const entity = event.target.dataset.entity;
  const mode = event.target.dataset.mode;

  fillDialogWithHTML(entity, mode);
  openDialog();
  addEventListeners(mode);
}

function fillDialogWithHTML(entity, mode) {
  const modal = formDebts.modalElement;
  const modalContent = document.querySelector(".modalContent");

  // Очищаем текущее содержимое
  modalContent.innerHTML = "";

  // Устанавливаем класс модального окна
  modal.className = `modal modal${entity}`;

  // Создаём заголовок
  const title = document.createElement("h2");
  title.id = "modalTitle";
  if (entity === "Debit" || entity === "Credit") {
    if (mode === "create") {
      title.textContent =
        entity === "Debit" ? "Создание долга" : "Создание кредита";
    } else if (mode === "edit") {
      title.textContent =
        entity === "Debit" ? "Редактирование долга" : "Редактирование кредита";
    } else if (mode === "view") {
      title.textContent =
        entity === "Debit" ? "Просмотр долга" : "Просмотр кредита";
    } else {
      title.textContent = "Неизвестный режим";
    }
  } else {
    title.textContent = "Неизвестная сущность";
  }

  // Создаём форму
  const form = document.createElement("form");
  form.id = "modalForm";

  // Формируем содержимое формы в зависимости от сущности
  let formHTML = "";
  if (mode === "edit" || mode === "view") {
    formHTML += debtTemplateElements.id;
  }
  formHTML += debtTemplateElements.amount;
  formHTML += debtTemplateElements.currency;
  formHTML += debtTemplateElements.percentageRate;
  formHTML += debtTemplateElements.dueDate;
  if (mode === "edit") {
    formHTML += debtTemplateElements.closedAt;
  }
  formHTML += debtTemplateElements.debtor;
  formHTML += debtTemplateElements.creditor;
  formHTML += debtTemplateElements.description;

  // Вставляем кнопки для разных режимов
  if (mode === "create") {
    formHTML += debtTemplateElements.buttons.create;
  } else if (mode === "edit") {
    formHTML += debtTemplateElements.buttons.edit;
  } else {
    formHTML += debtTemplateElements.buttons.view;
  }

  // Устанавливаем содержимое формы
  form.innerHTML = formHTML;

  // Добавляем заголовок и форму в модальное окно
  modalContent.appendChild(title);
  modalContent.appendChild(form);

  // Донастраиваем HTML
  const createbutton = document.querySelector(".createButton");
  if (mode === "create" && entity === "Debit") {
    createbutton.id = "buttonCreateDebt";
    if (starCreditor) {
      starCreditor.remove();
    }
    inputCreditor.classList.remove("requiredField");
  } else if (mode === "create" && entity === "Credit") {
    createbutton.id = "buttonCreateCredit";
    inputCreditor.classList.add("requiredField");
    if (!starCreditor) {
      const starLabel = document.createElement("label");
      starLabel.classList.add("star");
      starLabel.textContent = "*";
      starLabel.id = "starCreditor";
      inputCreditor.parentNode.appendChild(starLabel);
    }
  }

  // Донастраиваем HTML
  const editbutton = document.querySelector(".editButton");
  if (mode === "edit" && entity === "Debit") {
    editbutton.id = "buttonEditDebt";
    if (starCreditor) {
      starCreditor.remove();
    }
    inputCreditor.classList.remove("requiredField");
  } else if (mode === "edit" && entity === "Credit") {
    editbutton.id = "buttonEditCredit";
    inputCreditor.classList.add("requiredField");
    if (!starCreditor) {
      const starLabel = document.createElement("label");
      starLabel.classList.add("star");
      starLabel.textContent = "*";
      starLabel.id = "starCreditor";
      inputCreditor.parentNode.appendChild(starLabel);
    }
  }

  // Добавляем класс disabled ко всем элементам для режима veiw
  if (mode === "view") {
    disableModalInputs(modal);
    removePlaceholders(modal);
  }

  // Не знаю почему но в поле "Описание" при создании диалогового окна создается 3 пробела. Код ниже удаляет это
  const textInput = document.getElementById("modalInputDescription");
  const cleanedText = textInput.value.trim();
  textInput.value = cleanedText;
}

function disableModalInputs(modalElement) {
  const elements = modalElement.querySelectorAll(
    "input, textarea, select, .modalInput"
  );

  elements.forEach((element) => {
    if (element.tagName !== "BUTTON") {
      element.classList.add("disabled");
    }
  });
}

function removePlaceholders(modal) {
  const inputs = modal.querySelectorAll(
    "input[placeholder], textarea[placeholder]"
  );
  inputs.forEach((input) => {
    input.removeAttribute("placeholder");
  });
}

function openDialog() {
  const modal = document.getElementById("modal");
  modal.style.display = "flex";
}

function addEventListeners(mode) {
  const modal = document.getElementById("modal");

  // Закрытие окна
  const closeButton = document.querySelector(".closeDialogButton");
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // В зависимости от режима добавляем нужный обработчик
  if (mode === "view") {
    const saveButton = document.querySelector(".viewButton");
    saveButton.addEventListener("click", function (event) {
      event.preventDefault();
    });
  } else if (mode === "create") {
    const modal = formDebts.modalElement;

    if (modal.classList.contains("modalDebit")) {
      const createDebetButton = document.getElementById("buttonCreateDebt");
      createDebetButton.addEventListener("click", (e) => {
        if (createDebetButton.classList.contains("disable")) {
          e.preventDefault();
          return;
        }
        createNewLiability("Debit");
      });
    } else {
      const createCreditButton = document.getElementById("buttonCreateCredit");
      createCreditButton.addEventListener("click", (e) => {
        if (createCreditButton.classList.contains("disable")) {
          e.preventDefault();
          return;
        }
        createNewLiability("Credit");
      });
    }
  }
}

async function createNewLiability(type) {
  const modal = document.querySelector(".modal");
  const button = document.querySelector(".createButton");
  const access_token = localStorage.getItem("access_token");
  let amount, currency, percentageRate, dueDate, debtor, creditor, description;

  button.classList.add("disable");

  try {
    amount = parseFloat(modal.querySelector("#inputAmount").value);
    currency = modal.querySelector("#inputCurrency").value.trim();
    percentageRate = parseFloat(
      modal.querySelector("#inputPercentageRate").value
    );
    dueDate = modal.querySelector("#inputDueDate").value;
    debtor = modal.querySelector("#inputDebtor").value.trim();
    creditor = modal.querySelector("#inputCreditor").value.trim();
    description = modal.querySelector("#modalInputDescription").value.trim();

    const timeTransaction = "12:00";
    const dateUTCString = convertTimeToUtc(dueDate, timeTransaction);

    if (isNaN(amount) || amount <= 0) {
      const errorMessage = `Сумма должна быть больше 0`;
      createToast("error", errorMessage);
      return;
    }

    if (isNaN(percentageRate)) {
      const errorMessage = `Введите корректную процентную ставку`;
      createToast("error", errorMessage);
      return;
    }

    let response = await createLiabilityitApi(
      type,
      amount,
      currency,
      percentageRate,
      dateUTCString,
      debtor,
      creditor,
      description,
      access_token
    );

    if (response) {
      if (response.type === "Debit") {
        createToast(
          "success",
          `Долг с ID равным ${response.id} успешно добавлен`
        );
      } else if (response.type === "Credit") {
        createToast(
          "success",
          `Кредит с ID равным ${response.id} успешно добавлен`
        );
      }
    }
    closeDialog();
  } catch (error) {
    console.error("Ошибка при создании долга:", error);
    createToast(
      "error",
      error.message || "Произошла ошибка при создании долга"
    );
  } finally {
    setTimeout(() => {
      button.classList.remove("disable");
    }, 10000);
  }
}

function convertTimeToUtc(localDate, localTime) {
  const transactionDateTime = `${localDate}T${localTime}:00`;

  const transactionDateLocal = new Date(transactionDateTime);

  const transactionDateUTC = new Date(
    transactionDateLocal.getTime() -
      transactionDateLocal.getTimezoneOffset() * 60000
  );
  const transactionDateUTCString = transactionDateUTC.toISOString();

  return transactionDateUTCString;
}

export function closeDialog() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

export function handleSumInput(inputId, event) {
  const input = document.getElementById(inputId);
  let inputSumValue = input.value;

  // Убираем всё, кроме цифр и точки
  inputSumValue = inputSumValue.replace(/[^\d.]/g, "");
  let formattedInputValue = "";

  // Сохраняем текущую позицию курсора
  const cursorPosition = input.selectionStart;

  // Проверка на то, если значение равно "0." и пользователь нажимает Backspace
  if (inputSumValue === "0." && event.inputType === "deleteContentBackward") {
    input.value = "";
    return;
  }

  // Если введен пустой ввод, очищаем значение
  if (!inputSumValue) {
    input.value = "";
    return;
  }

  // Считаем количество точек
  const dotCount = (inputSumValue.match(/\./g) || []).length;

  // Если точек больше одной, убираем последнюю
  if (dotCount > 1) {
    inputSumValue = inputSumValue.slice(0, -1);
  }

  // Если есть точка и более двух цифр после неё, обрезаем лишние
  if (inputSumValue.includes(".")) {
    let [wholePart, decimalPart] = inputSumValue.split(".");
    if (decimalPart.length > 2) {
      decimalPart = decimalPart.slice(0, 2);
    }
    inputSumValue = `${wholePart}.${decimalPart}`;
  }

  // Если введен 0 в начале и нет точки, добавляем "0."
  if (dotCount === 0 && inputSumValue === "0") {
    formattedInputValue = "0.";
  } else {
    formattedInputValue = inputSumValue;
  }

  // Устанавливаем отформатированное значение
  input.value = formattedInputValue;

  // Восстанавливаем курсор после точки
  if (formattedInputValue === "0.") {
    input.setSelectionRange(2, 2); // Устанавливаем курсор после точки
  } else {
    input.setSelectionRange(cursorPosition, cursorPosition); // Восстанавливаем курсор
  }
}

export function keepOnlyNumbers(inputId) {
  const input = document.getElementById(inputId);
  let inputSumValue = input.value;

  inputSumValue = inputSumValue.replace(/\D/g, "");
  input.value = inputSumValue;
}

export function checkRequiredFields(formId) {
  const form = document.getElementById(formId);
  const requiredFields = form.querySelectorAll(".requiredField");

  const createButton = form.querySelector(".createButton");

  if (createButton) {
    let allFieldsFilled = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        allFieldsFilled = false;
      }
    });

    if (allFieldsFilled) {
      createButton.classList.remove("disable");
      createButton.disabled = false;
      createButton.removeAttribute("data-tooltip");
    } else {
      createButton.classList.add("disable");
      createButton.disabled = true;
      createButton.setAttribute(
        "data-tooltip",
        "Заполните обязательные параметры"
      );
    }
  }
}

export function checkRequiredFieldsEditForm() {
  const formId = "modalForm";
  const form = document.getElementById(formId);
  const requiredFields = form.querySelectorAll(".requiredField");
  const editButton = form.querySelector("#buttonEditDebt"); // Используем buttonEditDebt

  if (editButton) {
    let allFieldsFilled = true;

    requiredFields.forEach((field) => {
      // Проверяем, заполнено ли обязательное поле
      if (!field.value.trim()) {
        allFieldsFilled = false;
      }
    });

    if (allFieldsFilled) {
      // Если все обязательные поля заполнены, проверяем, были ли изменения
      compareAndDisableButton(); // Проверяем изменения и обновляем кнопку
    } else {
      // Если обязательные поля не заполнены, деактивируем кнопку
      editButton.classList.add("disable");
      editButton.disabled = true;
      editButton.setAttribute(
        "data-tooltip",
        "Заполните обязательные параметры"
      );
    }
  }
}

export async function getAllMyLiability() {
  try {
    const access_token = localStorage.getItem("access_token");
    const responseData = await getAllMyLiabilityApi(access_token);

    if (!responseData) {
      throw new Error("API response is empty or undefined.");
    }

    // Передаем данные в функцию, которая заполняет таблицу
    populateTableWithLiabilities(responseData);

    // Добавляем обработчики событий для иконок редактирования
    addShowDebtListeners(responseData);
    addEditDebtListeners(responseData);
  } catch (error) {
    console.error("Произошла ошибка:", error);
    alert("Произошла ошибка при обращении к серверу.");
  }
}

function populateTableWithLiabilities(responseData) {
  const tbody = document.querySelector(".custom-table tbody");
  tbody.innerHTML = ""; // Очищаем таблицу перед добавлением новых строк

  responseData.forEach((liability) => {
    let dateCreate = "";
    let dueDate = "";
    let creditor = liability.creditor || "";
    let state = liability.closed_at ? "Архивный" : "Активный";
    let liabilityType = liability.type === "Debit" ? "Долг" : "Кредит";

    dueDate = formatDateForTable(liability.due_date);
    dateCreate = convertUtcToLocal(liability.created_at);

    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td>${liability.id}</td>
      <td>${liabilityType}</td>
      <td>${dateCreate}</td>
      <td>${liability.amount}</td>
      <td>${liability.currency}</td>
      <td>${dueDate}</td>
      <td>${liability.debtor}</td>
      <td>${creditor}</td>
      <td>${state}</td>
      <td>
       <img src="../../src/modules/events/asserts/show-regular-60.png" class="iconShow" data-debt-id="${liability.id}">
       <img src="../../src/modules/transactions/asserts/pencil-solid-60.png" alt="Иконка" class="iconEdit" data-debt-id="${liability.id}">
      </td>`;

    tbody.appendChild(newRow);
  });
}

function addShowDebtListeners(responseData) {
  const iconsEdit = document.querySelectorAll(".iconShow");
  iconsEdit.forEach(function (icon) {
    icon.addEventListener("click", function (event) {
      const debtId = icon.getAttribute("data-debt-id");
      const debt = responseData.find((item) => item.id.toString() === debtId);
      const type = debt.type;
      fillDialogWithHTML(type, "view");
      fillDialogFields(debt);
      addEventListeners("view");
      const modal = document.getElementById("modal");
      modal.style.display = "flex";
    });
  });
}

function addEditDebtListeners(responseData) {
  const iconsEdit = document.querySelectorAll(".iconEdit");
  iconsEdit.forEach(function (icon) {
    icon.addEventListener("click", function (event) {
      const debtId = icon.getAttribute("data-debt-id");
      const debt = responseData.find((item) => item.id.toString() === debtId);
      const type = debt.type;
      console.log(responseData);

      fillDialogWithHTML(type, "edit");
      fillDialogFields(debt);
      saveDebtData(debt);
      addEventListenersForInputs();

      const modal = document.getElementById("modal");
      modal.style.display = "flex";
    });
  });
}

// Функция для сохранения данных долга в глобальную переменную
function saveDebtData(debt) {
  currentDebt = { ...debt }; // Сохраняем копию объекта долга
}

// Функция для получения текущих данных из формы
function getDebtData() {
  const inputAmount =
    parseInt(document.getElementById("inputAmount").value, 10) || 0; // Если пустое значение, возвращаем 0
  const inputCurrency =
    document.getElementById("inputCurrency").value.trim() || ""; // Если пустое, возвращаем пустую строку
  const inputPercentageRate =
    parseInt(document.getElementById("inputPercentageRate").value, 10) || 0;
  const inputDueDate = document.getElementById("inputDueDate").value || "";
  const inputDebtor = document.getElementById("inputDebtor").value.trim() || "";
  const inputCreditor =
    document.getElementById("inputCreditor").value.trim() || "";
  const inputDescription =
    document.getElementById("modalInputDescription").value.trim() || "";

  return {
    inputAmount,
    inputCurrency,
    inputPercentageRate,
    inputDueDate,
    inputDebtor,
    inputCreditor,
    inputDescription,
  };
}

// Функция для сравнения данных формы с данными долга и деактивации кнопки
function compareAndDisableButton() {
  if (!currentDebt) return; // Если данные долга не загружены, выходим

  const {
    inputAmount,
    inputCurrency,
    inputPercentageRate,
    inputDueDate,
    inputDebtor,
    inputCreditor,
    inputDescription,
  } = getDebtData();

  const debtDueDate = currentDebt.due_date
    ? currentDebt.due_date.split("T")[0]
    : "";
  const debtDescription = currentDebt.description || "";
  const debtCreditor = currentDebt.creditor || "";

  const isModified =
    inputAmount !==
      (currentDebt.amount ? parseInt(currentDebt.amount, 10) : 0) ||
    inputCurrency !== (currentDebt.currency || "") ||
    inputPercentageRate !==
      (currentDebt.percentage_rate
        ? parseInt(currentDebt.percentage_rate, 10)
        : 0) ||
    inputDueDate !== debtDueDate ||
    inputDebtor !== (currentDebt.debtor || "") ||
    inputCreditor !== debtCreditor ||
    inputDescription !== debtDescription;

  const saveButton = document.querySelector(".editButton");

  if (isModified) {
    saveButton.classList.remove("disable"); // Убираем класс disable
    saveButton.removeAttribute("disabled"); // Снимаем атрибут disabled
    saveButton.removeAttribute("data-tooltip");
  } else {
    saveButton.classList.add("disable"); // Добавляем класс disable
    saveButton.setAttribute("disabled", true); // Устанавливаем атрибут disabled
    saveButton.setAttribute("data-tooltip", "Заполните обязательные параметры");
  }
}

// Добавляем обработчик для всех инпутов, чтобы отслеживать изменения
function addEventListenersForInputs() {
  const inputs = document.querySelectorAll(
    "#modalForm input, #modalForm textarea"
  );

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      compareAndDisableButton();
      checkRequiredFieldsEditForm(); // Проверяем изменения и обновляем кнопку
    });
  });

  const closeButton = document.querySelector(".closeDialogButton");
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  if (modal.classList.contains("modalDebit")) {
    const createEditButton = document.getElementById("buttonEditDebt");
    createEditButton.addEventListener("click", (e) => {
      if (createEditButton.classList.contains("disable")) {
        e.preventDefault();
        return;
      }
      updateLiability("Debit");
    });
  } else {
    const createEditButton = document.getElementById("buttonEditCredit");
    createEditButton.addEventListener("click", (e) => {
      if (createEditButton.classList.contains("disable")) {
        e.preventDefault();
        return;
      }
      updateLiability("Credit");
    });
  }
}

async function updateLiability(type) {
  const modal = document.querySelector(".modal");
  const button = document.querySelector(".editButton");
  const access_token = localStorage.getItem("access_token");
  let idDebt,
    amount,
    currency,
    percentageRate,
    dueDate,
    debtor,
    creditor,
    description,
    closedAt;

  button.classList.add("disable");

  try {
    idDebt = parseInt(modal.querySelector("#inputId").value.trim(), 10);
    amount = parseFloat(modal.querySelector("#inputAmount").value);
    currency = modal.querySelector("#inputCurrency").value.trim();
    percentageRate = parseInt(
      modal.querySelector("#inputPercentageRate").value.trim(),
      10
    );
    dueDate = modal.querySelector("#inputDueDate").value;
    debtor = modal.querySelector("#inputDebtor").value.trim();
    creditor = modal.querySelector("#inputCreditor").value.trim();
    description = modal.querySelector("#modalInputDescription").value.trim();
    closedAt = modal.querySelector("#inputClosedAt").value;

    const timeTransaction = "12:00";
    const dueDateUTCString = convertTimeToUtc(dueDate, timeTransaction);
    let closedAtUTCString = "";

    if (closedAt) {
      closedAtUTCString = convertTimeToUtc(closedAt, timeTransaction);
    }

    if (isNaN(amount) || amount <= 0) {
      const errorMessage = `Сумма должна быть больше 0`;
      createToast("error", errorMessage);
      return;
    }

    if (isNaN(percentageRate)) {
      const errorMessage = `Введите корректную процентную ставку`;
      createToast("error", errorMessage);
      return;
    }

    let response = await updateLiabilityitApi(
      idDebt,
      type,
      amount,
      currency,
      percentageRate,
      dueDateUTCString,
      debtor,
      creditor,
      description,
      closedAtUTCString,
      access_token
    );

    if (response) {
      if (response.type === "Debit") {
        createToast(
          "success",
          `Долг с ID равным ${response.id} успешно изменен`
        );
      } else if (response.type === "Credit") {
        createToast(
          "success",
          `Кредит с ID равным ${response.id} успешно изменен`
        );
      }
    }
    setTimeout(() => {
      getAllMyLiability();
    }, 500);

    closeDialog();
  } catch (error) {
    console.error("Ошибка при создании долга:", error);
    createToast(
      "error",
      error.message || "Произошла ошибка при создании долга"
    );
  } finally {
    setTimeout(() => {
      button.classList.remove("disable");
    }, 10000);
  }
}

function fillDialogFields(debt) {
  if (!debt || typeof debt !== "object") {
    console.error("Передан некорректный объект для заполнения диалога.");
    return;
  }

  const inputId = document.getElementById("inputId");
  if (inputId) {
    inputId.value = debt.id || "";
  }

  const inputAmount = document.getElementById("inputAmount");
  if (inputAmount) {
    inputAmount.value = debt.amount || "";
  }

  const inputCurrency = document.getElementById("inputCurrency");
  if (inputCurrency) {
    inputCurrency.value = debt.currency || "";
  }

  const inputPercentageRate = document.getElementById("inputPercentageRate");
  if (inputPercentageRate) {
    inputPercentageRate.value = debt.percentage_rate || "";
  }

  const inputDueDate = document.getElementById("inputDueDate");
  if (inputDueDate) {
    inputDueDate.value = debt.due_date ? debt.due_date.split("T")[0] : "";
  }

  const inputDebtor = document.getElementById("inputDebtor");
  if (inputDebtor) {
    inputDebtor.value = debt.debtor || "";
  }

  const inputCreditor = document.getElementById("inputCreditor");
  if (inputCreditor) {
    inputCreditor.value = debt.creditor || "";
  }

  const inputDescription = document.getElementById("modalInputDescription");
  if (inputDescription) {
    inputDescription.value = debt.description || "";
  }
}

function formatDateForTable(dateString) {
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-");

  return `${day}.${month}.${year}`;
}

function convertUtcToLocal(utcDateString) {
  const utcDate = new Date(utcDateString);
  const localDate = new Date(
    utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
  );
  const day = localDate.getDate();
  const month = localDate.getMonth() + 1;
  const year = localDate.getFullYear();
  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();

  const formattedTime = `${String(day).padStart(2, "0")}.${String(
    month
  ).padStart(2, "0")}.${year} ${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;

  return formattedTime;
}
