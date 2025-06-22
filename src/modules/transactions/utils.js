import { formTransactions } from "./constants.js";
import {
  getAllMyEventsApi,
  deleteTransaction,
  getTransacionsForEvent,
  getCategoryTransactionApi,
  createTransactionApi,
  updateTransactionApi,
  getReceiptApi,
  getAllMyAccountsApi,
} from "../../utils/api.js";
import { createToast } from "../notifications/index.js";
import { checkDate } from "../other_functions/validations.js";
import { templateElements } from "./templates.js";


let cachedActiveAccounts = 0;
let cachedCategories = [];
let testCategories = 0;
const idToNameMap = {};
let countTr = 0;
let countTransac = 0;
let originalTransactionValues = {};
let currentOpenDropdown = null;

// Очищаем localStorage при перезагрузке страницы
export function clearTransactionPage() {
  formTransactions.inputEvent.value = "";
  localStorage.removeItem("event");
  localStorage.removeItem("eventRole");
}

// Сохраняем категории для дальнейшего использования
export async function getCategory() {
  try {
    const categories = await getCategoryTransactionApi();
    cachedCategories = categories;
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

// Функции для работы поле выбора мероприятий
async function getEvent() {
  const token = localStorage.getItem("access_token");

  try {
    const events = await getAllMyEventsApi(token);

    if (events && events.status === 403) {
      window.location.href = "../../pages/auth/index.html";
      return [];
    }

    if (!events) {
      return [];
    }

    const user_id = parseInt(localStorage.getItem("user_id"), 10);
    const userEvents = [];

    events.forEach((event) => {
      const user = event.participants.find(
        (participant) => participant.user_id === user_id
      );

      if (user) {
        userEvents.push({
          event_name: event.name,
          event_id: event.id,
          user_role: user.role,
        });
      }
    });

    return userEvents;
  } catch (error) {
    console.error("Ошибка при получении событий:", error);
    return [];
  }
}


// Функции для работы поле выбора мероприятий
export async function fillEventDirectory() {
  let events = await getEvent();
  populateEventOptions(events);

  const list = formTransactions.eventOption;
  const input = formTransactions.inputEvent;
  const emptyMessageElement = list.querySelector(".emptyMessage");
  if (emptyMessageElement) {
    // Если элемент с классом emptyMessage найден, прекращаем выполнение цикла
    console.warn("Empty message detected. Event listeners not added.");
    return;
  }
  for (let i = 0; i < list.children.length; i++) {
    list?.children[i].addEventListener("click", (e) => {
      const selectedId = list.children[i].getAttribute("data-id");
      const selectedIdEvent = list.children[i].getAttribute("data-role");
      const selectedValue = list.children[i].innerHTML;
      input.value = selectedValue;
      localStorage.setItem("event", selectedId);
      localStorage.setItem("eventRole", selectedIdEvent);

      checkForm();
    });
  }
}

// Заполнение справочника
function populateEventOptions(events) {
  eventOptions.innerHTML = "";
  if (events.length === 0) {
    eventOptions.classList.add("empty");
    eventOptions.innerHTML = `
    <div class="emptyMessage">
      <span>Мероприятий нет. <a href="https://sweetcash.org/pages/events/index.html" class="createLink">Создай</a></span>
    </div>
    `;
  } else {
    events.forEach((event) => {
      var lista = eventOptions;
      var listItem = document.createElement("li");
      listItem.textContent = event.event_name;
      listItem.setAttribute("data-id", event.event_id);
      listItem.setAttribute("data-role", event.user_role);
      lista.appendChild(listItem);
    });
  }
}

// Функции для кеширования данных
export async function getActiveAccounts() {
  try {
    const access_token = localStorage.getItem("access_token");
    const activeAccounts = await getAllMyAccountsApi(access_token, false);
    cachedActiveAccounts = activeAccounts;
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export async function getAllCategory() {
  try {
    const allCategories = await getCategoryTransactionApi();
    allCategories.forEach((item) => {
      idToNameMap[item.id] = item.name;
      if (item.sub_categories && item.sub_categories.length > 0) {
        item.sub_categories.forEach((subCategory) => {
          idToNameMap[subCategory.id] = subCategory.name;
        });
      }
    });
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

// Функции для заполнения периода мероприятий по умолчанию
export function fillCurrentDate() {
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const formattedFirstDay = formatDate(firstDayOfMonth);
  formTransactions.startDateEvent.value = formattedFirstDay;
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const formattedLastDay = formatDate(lastDayOfMonth);
  formTransactions.endDateEvent.value = formattedLastDay;
}

// Функции для проверки заполненности полей на страницы для активации кнопок
export function checkForm() {
  const start_date = formTransactions.startDateEvent
    ? formTransactions.startDateEvent.value
    : "";
  const end_date = formTransactions.endDateEvent
    ? formTransactions.endDateEvent.value
    : "";
  const input_event = formTransactions.inputEvent
    ? formTransactions.inputEvent.value
    : "";

  if (start_date && end_date && input_event) {
    formTransactions.buttonOpenModalExpense.classList.remove("disable");
    formTransactions.buttonOpenModalIncome.classList.remove("disable");
    formTransactions.buttonOpenModalTransaction.classList.remove("disable");
    formTransactions.getTransactionButton.classList.remove("disable");
    formTransactions.buttonOpenModalExpense.removeAttribute("data-tooltip");
    formTransactions.buttonOpenModalIncome.removeAttribute("data-tooltip");
    formTransactions.buttonOpenModalTransaction.removeAttribute("data-tooltip");
    formTransactions.getTransactionButton.removeAttribute("data-tooltip");
  } else {
    formTransactions.getTransactionButton.classList.add("disable");
    formTransactions.getTransactionButton.setAttribute(
      "data-tooltip",
      "Введите адрес электронной почты и пароль"
    );
  }
  if (input_event) {
    formTransactions.buttonOpenModalExpense.classList.remove("disable");
    formTransactions.buttonOpenModalIncome.classList.remove("disable");
    formTransactions.buttonOpenModalTransaction.classList.remove("disable");
    formTransactions.buttonOpenModalExpense.removeAttribute("data-tooltip");
    formTransactions.buttonOpenModalIncome.removeAttribute("data-tooltip");
    formTransactions.buttonOpenModalTransaction.removeAttribute("data-tooltip");
  } else {
    formTransactions.buttonOpenModalExpense.classList.add("disable");
    formTransactions.buttonOpenModalIncome.classList.add("disable");
    formTransactions.buttonOpenModalTransaction.classList.add("disable");
    formTransactions.buttonOpenModalExpense.setAttribute(
      "data-tooltip",
      "Введите адрес электронной почты и пароль"
    );
    formTransactions.buttonOpenModalIncome.setAttribute(
      "data-tooltip",
      "Введите адрес электронной почты и пароль"
    );
    formTransactions.buttonOpenModalTransaction.setAttribute(
      "data-tooltip",
      "Введите адрес электронной почты и пароль"
    );
  }
}

// универсальная функция закрытия всех окон на странице
export function handleCancelTransaction() {
  const modalForm = document.querySelector(".modal");
  modalForm.close();
}

export function getCountTransactions() {
  var screenHeight = window.innerHeight;
  var countTransaction = (screenHeight - 157) / 49 - 1;
  let intNumber = Math.floor(countTransaction);
  return intNumber;
}

export async function getTransactionsForPaginations(pagination) {
  const start_date = new Date(formTransactions.startDateEvent.value);
  const end_date = new Date(formTransactions.endDateEvent.value);
  const formattedStartDate =
    start_date.toISOString().slice(0, 10) + "T00:00:00Z";
  const formattedEndDate = end_date.toISOString().slice(0, 10) + "T23:59:59Z";
  const event_id = localStorage.getItem("event");
  var limit = 15;
  var offset = 0;
  if (pagination) {
    offset = getCountRowsTable();
  } else {
    offset = getCountTransactions();
  }

  const access_token = localStorage.getItem("access_token");

  try {
    const responseData = await getTransacionsForEvent(
      formattedStartDate,
      formattedEndDate,
      event_id,
      limit,
      offset,
      access_token
    );

    if (responseData.length > 0) {
      formTransactions.labelMoreTransaction.classList.remove("disable");
    } else {
      formTransactions.labelMoreTransaction.classList.add("disable");
    }
  } catch (error) {}
}

export function getCountRowsTable() {
  const tbody = document.querySelector("tbody");
  const rows = tbody.querySelectorAll("tr");
  const rowCount = rows.length;

  return rowCount;
}

export function deleteErrorBorder(event) {
  const target = event.target;
  if (target.classList.contains("error")) {
    target.classList.remove("error");
  }
}

// Вспомогательная функция для форматирования даты
function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

// Вспомогательная функция для получения аккаунта
function getAccount(transaction, type) {
  let accountData;
  if (type === "Income") {
    accountData = transaction.target_account;
  } else if (type === "Expense") {
    accountData = transaction.source_account;
  } else if (type === "Transfer") {
    accountData = transaction.target_account;
  }
  return accountData?.name || accountData?.id || "?";
}

async function fetchTransactionsData(offset = 0) {
  const start_date = new Date(formTransactions.startDateEvent.value);
  const end_date = new Date(formTransactions.endDateEvent.value);
  const formattedStartDate =
    start_date.toISOString().slice(0, 10) + "T00:00:00Z";
  const formattedEndDate = end_date.toISOString().slice(0, 10) + "T23:59:59Z";
  const event_id = localStorage.getItem("event");
  const limit = getCountTransactions();
  const access_token = localStorage.getItem("access_token");

  if (checkDate(formattedStartDate, formattedEndDate)) {
  } else {
    const errorMessage = `Дата окончания мероприятия не может быть меньше даты начала мероприятия`;
    createToast("error", errorMessage);
    formTransactions.getTransactionButton.classList.add("disable");
    formTransactions.startDateEvent.classList.add("error");
    formTransactions.endDateEvent.classList.add("error");
    return;
  }
  formTransactions.startDateEvent.classList.remove("error");
  formTransactions.endDateEvent.classList.remove("error");

  try {
    const responseData = await getTransacionsForEvent(
      formattedStartDate,
      formattedEndDate,
      event_id,
      limit,
      offset,
      access_token
    );
    return responseData;
  } catch (error) {
    alert(error);
    return null;
  }
}

function calculateTotalRow(totalRow, countTr) {
  let countTrValue = 0;
  let rowHTML = "";

  if (totalRow) {
    let countTrCell = totalRow.cells[4];
    countTrValue = parseFloat(
      countTrCell.textContent.trim().replace(" руб", "")
    );
    totalRow.remove();
  }

  let countTrTotal = countTrValue + countTr;

  if (countTrTotal > 0) {
    rowHTML = `
      <td data-name="Total"> Итого  </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td style="padding-left: 35px; color: green"> +${countTrTotal} руб </td>
      <td> </td>
      <td> </td>`;
  } else if (countTrTotal < 0) {
    rowHTML = `
      <td data-name="Total"> Итого  </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td style="padding-left: 35px; color: red">${countTrTotal} руб </td>
      <td> </td>
      <td> </td>`;
  } else {
    rowHTML = `
      <td data-name="Total"> Итого  </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td style="padding-left: 35px; color: black">${countTrTotal} руб </td>
      <td> </td>
      <td> </td>`;
  }

  return rowHTML;
}

export async function manageLogicTransactions(offset = 0, append = false) {
  if (formTransactions.getTransactionButton.classList.contains("disable")) {
    return;
  }

  try {
    const responseData = await fetchTransactionsData(offset);

    if (!responseData) {
      console.warn("No response data received.");
      return;
    }

    populateTableWithTransactions(responseData, offset, append);
    // Добавляем обработчики событий
    addListenersForIconsEdit(responseData);
    addListenersForIconsShow(responseData);
    addListenersForIconsDelete(responseData);
    addListenersForIconsReceipt(responseData)
  } catch (error) {
    formTransactions.getTransactionButton.classList.remove("disable");
  } finally {
    formTransactions.getTransactionButton.classList.remove("disable");
  }
}
// Функция для навешивания обработчиков на иконку Редактирование счета
function addListenersForIconsEdit(responseData) {
  const iconsEdit = document.querySelectorAll(".iconEdit");
  iconsEdit.forEach(function (icon) {
    icon.addEventListener("click", function () {
      const transactionId = parseInt(
        icon.getAttribute("data-transaction-id"),
        10
      );
      const transaction = responseData.find(
        (transaction) => transaction.id === transactionId
      );
      const typeTransactions = transaction.type;
      localStorage.setItem("transactionId", transactionId);
      handleOpenMainModal(typeTransactions, "edit", transaction);
    });
  });
}

// Функция для навешивания обработчиков на иконку Просмотра счета
function addListenersForIconsShow(responseData) {
  const iconsShow = document.querySelectorAll(".iconShow");
  iconsShow.forEach(function (icon) {
    icon.addEventListener("click", function () {
      const transactionId = parseInt(
        icon.getAttribute("data-transaction-id"),
        10
      );
      const transaction = responseData.find(
        (transaction) => transaction.id === transactionId
      );
      const typeTransactions = transaction.type;

      handleOpenMainModal(typeTransactions, "view", transaction);
    });
  });
}

function addListenersForIconsDelete(responseData) {
  const iconsDelete = document.querySelectorAll(".iconDelete");
  iconsDelete.forEach(function (icon) {
    icon.addEventListener("click", function () {
      const transactionId = parseInt(
        icon.getAttribute("data-transaction-id"),
        10
      );
      const transaction = responseData.find(
        (transaction) => transaction.id === transactionId
      );
      const typeTransactions = transaction.type;
      localStorage.setItem("transactionId", transactionId);
      handleOpenMainModal(typeTransactions, "delete");
    });
  });
}

function addListenersForIconsReceipt(responseData) {
  const iconsReceipt = document.querySelectorAll(".receipt");

  iconsReceipt.forEach(function (icon) {
    icon.addEventListener("click", async function () {
      const receiptId = parseInt(icon.getAttribute("data-id"), 10);

      try {
        const receipt = await getReceipt(receiptId);
        console.log(receipt); // Проверка полученных данных

        if (receipt) {
          addReceiptToHTML(receipt); // Автоматически отображаем чек
          document.getElementById("receipt-details").showModal();
        } else {
          console.error("Чек не найден");
        }
      } catch (error) {
        console.error("Ошибка при получении чека:", error);
      }
    });
  });
}

// Общая функция для управления диалогового окна "Просмотра/создания/редактирования счета"
export function handleOpenMainModal(entity, mode, data) {
  // Добавляем в диалог HTML
  fillMainDialogWithHTML(entity, mode);

  // Если measure передан, заполняем форму данными
  if (data) {
    fillEventDialogFields(entity, data);
  }

  // Добавляем класс disabled ко всем элементам для режима veiw и убираем placeholders
  if (mode === "view") {
    disableModalInputs();
  }

  // Устанавливаем на диалоговое окно обработчики
  addEventListeners(mode);

  // Отображаем диалоговое окно
  openDialog();
}

// Единая функция, которая вставляет в диалоговое окно HTML
function fillMainDialogWithHTML(entity, mode) {
  const modal = formTransactions.modalElement;

  // Очищаем текущее содержимое
  modal.innerHTML = "";

  // Присваиваем ID модального окна уникальное значение
  if (mode == "delete") {
    modal.id = `modalDelete${entity}`;
  } else {
    modal.id = `modal${entity}`;
  }

  // Создаём заголовок
  const title = document.createElement("h2");
  title.id = "modalTitle";

  if (mode === "create") {
    title.textContent = `Создание ${getTransactionType(entity)}`;
  } else if (mode === "edit") {
    title.textContent = `Редактирование ${getTransactionType(entity)}`;
  } else if (mode === "view") {
    title.textContent = `Просмотр ${getTransactionType(entity)}`;
  } else if (mode === "delete") {
    title.textContent = `Удаление ${getTransactionType(entity)}`;
  } else {
    title.textContent = "Неизвестный режим";
  }

  // Создаём форму
  const form = document.createElement("form");
  form.id = "modalForm";

  // Формируем содержимое формы в зависимости от сущности и мода
  let formHTML = "";

  if (entity === "Expense") {
    if (mode === "create") {
      formHTML += templateElements.date;
      formHTML += templateElements.amountExpense;
      formHTML += templateElements.sourceAccount;
      formHTML += templateElements.category;
      formHTML += templateElements.description;
      formHTML += templateElements.buttons.create(entity);
    } else if (mode === "edit") {
      formHTML += templateElements.id;
      formHTML += templateElements.date;
      formHTML += templateElements.amountExpense;
      formHTML += templateElements.sourceAccount;
      formHTML += templateElements.category;
      formHTML += templateElements.description;
      formHTML += templateElements.buttons.edit(entity);
    } else if (mode === "view") {
      formHTML += templateElements.id;
      formHTML += templateElements.date;
      formHTML += templateElements.amountExpense;
      formHTML += templateElements.sourceAccount;
      formHTML += templateElements.category;
      formHTML += templateElements.description;
      formHTML += templateElements.buttons.view();
    } else if (mode === "delete") {
      formHTML += templateElements.text;
      formHTML += templateElements.buttons.delete();
    }
  } else if (entity === "Income") {
    if (mode === "create") {
      formHTML += templateElements.date;
      formHTML += templateElements.amountIncome;
      formHTML += templateElements.targetaccount;
      formHTML += templateElements.category;
      formHTML += templateElements.description;
      formHTML += templateElements.buttons.create(entity);
    } else if (mode === "edit") {
      formHTML += templateElements.id;
      formHTML += templateElements.date;
      formHTML += templateElements.amountIncome;
      formHTML += templateElements.targetaccount;
      formHTML += templateElements.category;
      formHTML += templateElements.description;
      formHTML += templateElements.buttons.edit(entity);
    } else if (mode === "view") {
      formHTML += templateElements.id;
      formHTML += templateElements.date;
      formHTML += templateElements.amountIncome;
      formHTML += templateElements.targetaccount;
      formHTML += templateElements.category;
      formHTML += templateElements.description;
      formHTML += templateElements.buttons.view();
    } else if (mode === "delete") {
      formHTML += templateElements.text;
      formHTML += templateElements.buttons.delete();
    }
  } else if (entity === "Transfer") {
    if (mode === "create") {
      formHTML += templateElements.date;
      formHTML += templateElements.amountTransfer;
      formHTML += templateElements.transferFee;
      formHTML += templateElements.sourceAccount;
      formHTML += templateElements.targetaccount;
      formHTML += templateElements.description;
      formHTML += templateElements.buttons.create(entity);
    } else if (mode === "edit") {
      formHTML += templateElements.id;
      formHTML += templateElements.date;
      formHTML += templateElements.amountTransfer;
      formHTML += templateElements.transferFee;
      formHTML += templateElements.sourceAccount;
      formHTML += templateElements.targetaccount;
      formHTML += templateElements.description;
      formHTML += templateElements.buttons.edit(entity);
    } else if (mode === "view") {
      formHTML += templateElements.id;
      formHTML += templateElements.date;
      formHTML += templateElements.amountTransfer;
      formHTML += templateElements.transferFee;
      formHTML += templateElements.sourceAccount;
      formHTML += templateElements.targetaccount;
      formHTML += templateElements.description;
      formHTML += templateElements.buttons.view();
    } else if (mode === "delete") {
      formHTML += templateElements.text;
      formHTML += templateElements.buttons.delete();
    }
  }

  // Устанавливаем содержимое формы
  form.innerHTML = formHTML;

  // Добавляем заголовок и форму в модальное окно
  modal.appendChild(title);
  modal.appendChild(form);

  // Не знаю почему но в поле "Описание" при создании диалогового окна создается 3 пробела. Код ниже удаляет это
  if (mode !== "delete") {
    const textInput = document.getElementById("modalInputDescription");
    const cleanedText = textInput.value.trim();
    textInput.value = cleanedText;
  }
}
// Функция для получения типа транзакции
function getTransactionType(type) {
  const types = {
    Expense: "расхода",
    Income: "дохода",
    Transfer: "перевода",
  };

  return types[type] || "неизвестно";
}

// Функция для разделения даты и времени
function splitDateTime(transactionDate) {
  const dateTime = new Date(transactionDate);
  const date = dateTime.toLocaleDateString("en-CA");
  const time = dateTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
}

// Функция для получения имени категории
function getCategoryNameById(categoryId, categories) {
  categoryId = parseInt(categoryId);
  for (let category of categories) {
    if (category.id === categoryId) {
      return category.name;
    }
    if (category.sub_categories && category.sub_categories.length > 0) {
      const foundCategory = getCategoryNameById(
        categoryId,
        category.sub_categories
      );
      if (foundCategory) {
        return foundCategory;
      }
    }
  }

  // Если категория не найдена, возвращаем null
  return null;
}

function fillEventDialogFields(entity, data) {
  originalTransactionValues = {};
  if (entity == "Expense" || entity == "Income" || entity == "Transfer") {
    console.log(data)
    
    // Уникальный идентификатор
    const inputId = document.getElementById("inputId");
    if (inputId) {
      inputId.value = data.id || "";
      originalTransactionValues["id"] = inputId.value; // Добавляем в объект
    }
    const { date, time } = splitDateTime(data.transaction_date);
    // Дата транзакции
    const dateTransaction = document.getElementById("dateTransaction");
    if (dateTransaction) {
      dateTransaction.value = date || "";
      originalTransactionValues["transactionDate"] = dateTransaction.value; // Добавляем в объект
    }
    // Время транзакции
    const timeTransaction = document.getElementById("timeTransaction");
    if (timeTransaction) {
      timeTransaction.value = time || "";
      originalTransactionValues["transactionTime"] = timeTransaction.value; // Добавляем в объект
    }
    // Описание
    const description = document.getElementById("modalInputDescription");
    if (description) {
      description.value = data.description || "";
      originalTransactionValues["description"] = description.value; // Добавляем в объект
    }
    // Если entity = "Expense"
    if (entity == "Expense") {
      const categoryName = getCategoryNameById(
        data.category_id,
        cachedCategories
      );
      // Категория
      const inputCategory = document.getElementById("modalInputCategoryId");
      if (inputCategory) {
        const categoryId = data.category_id || ""; // Берем ID категории из данных
        inputCategory.value = categoryName || ""; // Устанавливаем отображаемое имя
        inputCategory.dataset.categoryId = categoryId; // Добавляем ID в data-атрибут
        originalTransactionValues["category"] = categoryId; // Добавляем ID в объект
      }
      // Сумма
      const inputAmount = document.getElementById("inputAmountExpense");
      if (inputAmount) {
        inputAmount.value = data.amount || "";
        originalTransactionValues["amount"] = inputAmount.value; // Добавляем в объект
      }
      // Счет списания
      const inputSourceAccountId = document.getElementById(
        "modalInputSourceAccountId"
      );
      if (inputSourceAccountId) {
        if (data.source_account) { // Проверяем, существует ли source_account
            const sourceAccountId = data.source_account.id || ""; // Берем ID счета из данных
            inputSourceAccountId.value = data.source_account.name || ""; // Устанавливаем отображаемое имя
            inputSourceAccountId.dataset.sourceAccountId = sourceAccountId; // Добавляем ID в data-атрибут
            originalTransactionValues["sourceAccount"] = sourceAccountId; // Добавляем ID в объект
        } else {
            inputSourceAccountId.value = "Неизвестно"; // Если source_account отсутствует
        }
    }
    
    } else if (entity == "Income") {
      const categoryName = getCategoryNameById(
        data.category_id,
        cachedCategories
      );
      // Категория
      const inputCategory = document.getElementById("modalInputCategoryId");
      if (inputCategory) {
        const categoryId = data.category_id || ""; // Берем ID категории из данных
        inputCategory.value = categoryName || ""; // Устанавливаем отображаемое имя
        inputCategory.dataset.categoryId = categoryId; // Добавляем ID в data-атрибут
        originalTransactionValues["category"] = categoryId; // Добавляем ID в объект
      }
      // Сумма зачисления
      const inputAmount = document.getElementById("inputAmountIncome");
      if (inputAmount) {
        inputAmount.value = data.amount || "";
        originalTransactionValues["amount"] = inputAmount.value; // Добавляем в объект
      }
      // Счет зачисления
      const inputTargetAccountId = document.getElementById(
        "modalInputTargetAccountId"
      );
      if (inputTargetAccountId) {
        const targetAccountId = data.target_account.id || ""; // Берем ID счета из данных
        inputTargetAccountId.value = data.target_account.name || ""; // Устанавливаем отображаемое имя
        inputTargetAccountId.dataset.targetAccountId = targetAccountId; // Добавляем ID в data-атрибут
        originalTransactionValues["targetAccount"] = targetAccountId; // Добавляем ID в объект
      }
    } else if (entity == "Transfer") {
      // Сумма перевода
      const inputAmount = document.getElementById("inputAmountTransfer");
      if (inputAmount) {
        inputAmount.value = data.amount || "";
        originalTransactionValues["amount"] = inputAmount.value; // Добавляем в объект
      }
      // Счет списания
      const inputSourceAccountId = document.getElementById(
        "modalInputSourceAccountId"
      );
      if (inputSourceAccountId) {
        if (data.source_account) { // Проверяем, существует ли source_account
            const sourceAccountId = data.source_account.id || ""; // Берем ID счета из данных
            inputSourceAccountId.value = data.source_account.name || ""; // Устанавливаем отображаемое имя
            inputSourceAccountId.dataset.sourceAccountId = sourceAccountId; // Добавляем ID в data-атрибут
            originalTransactionValues["sourceAccount"] = sourceAccountId; // Добавляем ID в объект
        } else {
            inputSourceAccountId.value = "Неизвестно"; // Если source_account отсутствует
        }
    }
      // Счет зачисления
      const inputTargetAccountId = document.getElementById(
        "modalInputTargetAccountId"
      );
      if (inputTargetAccountId) {
        if (data.target_account) { // Проверяем, существует ли target_account
            const targetAccountId = data.target_account.id || ""; // Берем ID счета из данных
            inputTargetAccountId.value = data.target_account.name || ""; // Устанавливаем отображаемое имя
            inputTargetAccountId.dataset.targetAccountId = targetAccountId; // Добавляем ID в data-атрибут
            originalTransactionValues["targetAccount"] = targetAccountId; // Добавляем ID в объект
        } else {
            inputTargetAccountId.value = "Неизвестно"; // Если target_account отсутствует
        }
    }
    
    }
  }
}

// Добавляем класс disabled ко всем элементам для режима veiw
function disableModalInputs() {
  const modal = formTransactions.modalElement;
  const elements = modal.querySelectorAll(
    "input, textarea, modalInputStatus , button"
  );

  elements.forEach((element) => {
    if (element.classList.contains("closeDialogButton")) {
      return;
    } else {
      element.classList.add("disabled");
    }
  });
}

// Основная функция для добавления обработчиков событий для диалоговых окон
function addEventListeners(mode) {
  const modal = formTransactions.modalElement;
  const closeButton = document.querySelector(".closeDialogButton");
  const form = document.getElementById("modalForm");

  // Обработчик кликов по форме
  document.getElementById("modalForm").addEventListener("click", (event) => {
    // В зависимости от режима выполняем соответствующие действия
    if (mode === "create") {
      handleCreateMode(event, modal);
    } else if (mode === "edit") {
      handleEditMode(event, modal);
    } else if (mode === "view") {
      handleViewMode(event, modal);
    } else if (mode === "delete") {
      handleDeleteMode(event, modal);
    }
  });

  // Универсальные обработчики для всех диалоговых окон
  form.addEventListener("focusin", handleFocusIn);
  form.addEventListener("focusout", handleFocusOut);
  closeButton.addEventListener("click", closeDialog);

  // Обработка валидации поля ввода суммы
  form.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches(".modalInput")) {
      handleSumInput(target.id, event);
    }
  });
}

// Обработчик для режима создания транзакции
function handleCreateMode(event) {
  const modal = formTransactions.modalElement;
  const form = document.getElementById("modalForm");
  const target = event.target;
  const dropdownTrigger = target.closest(".modalDropdown");

  // Обработчик для создания события
  // Универсальный обработчик для проверки заполненности обязательных полей
  form.addEventListener("input", (event) => {
    const target = event.target;
    if (target.classList.contains("requiredField")) {
      checkRequiredFields(form.id);
    }
  });
  if (dropdownTrigger) {
    // Проверяем конкретный ID выпадающего списка
    if (dropdownTrigger.id === "modalDropdownSourceAccount") {
      toggleModalDropdown(dropdownTrigger.id);
      checkRequiredFields("modalForm");
    } else if (dropdownTrigger.id === "modalDropdownTargetAccount") {
      toggleModalDropdown(dropdownTrigger.id);
      checkRequiredFields("modalForm");
    } else if (dropdownTrigger.id === "modalDropdownCategory") {
      toggleModalDropdown(dropdownTrigger.id);
      checkRequiredFields("modalForm");
    }
  }
  // Обработка кнопки "Создать расход"
  if (target.id === "buttonCreateExpense") {
    if (target.classList.contains("disable")) {
      return;
    }
    createNewTransaction("Expense");
  }

  // Обработка кнопки "Создать доход"
  if (target.id === "buttonCreateIncome") {
    if (target.classList.contains("disable")) {
      return;
    }

    createNewTransaction("Income");
  }

  // Обработка кнопки "Создать перевод"
  if (target.id === "buttonCreateTransfer") {
    if (target.classList.contains("disable")) {
      return;
    }

    createNewTransaction("Transfer");
  }
}

// Обработчик для режима изменения транзакции
function handleEditMode(event) {
  const modal = formTransactions.modalElement;
  const target = event.target;
  const dropdownTrigger = target.closest(".modalDropdown");
  const form = document.getElementById("modalForm");

  // Подключаем обработчики для отслеживания изменений
  addInputListeners(originalTransactionValues);

  // Обработчик для создания события

  if (dropdownTrigger) {
    // Проверяем конкретный ID выпадающего списка
    if (dropdownTrigger.id === "modalDropdownSourceAccount") {
      toggleModalDropdown(dropdownTrigger.id);
      // checkRequiredFields("modalForm");
    } else if (dropdownTrigger.id === "modalDropdownTargetAccount") {
      toggleModalDropdown(dropdownTrigger.id);
      // checkRequiredFields("modalForm");
    } else if (dropdownTrigger.id === "modalDropdownCategory") {
      toggleModalDropdown(dropdownTrigger.id);
      // checkRequiredFields("modalForm");
    }
  }
  // Обработка кнопки "Создать расход"
  if (target.id === "buttonEditExpense") {
    if (target.classList.contains("disable")) {
      return;
    }
    updateTransaction("Expense");
  }

  // Обработка кнопки "Создать доход"
  if (target.id === "buttonEditIncome") {
    if (target.classList.contains("disable")) {
      return;
    }
    updateTransaction("Income");
  }

  // Обработка кнопки "Создать перевод"
  if (target.id === "buttonEditTransfer") {
    if (target.classList.contains("disable")) {
      return;
    }
    updateTransaction("Transfer");
  }
}

let isProcessing = false;

// Добавляем обработчики для всех полей ввода
function addInputListeners(originalTransactionValues) {
  const form = document.getElementById("modalForm");
  const editButton = form.querySelector(".editButton");

  if (!form) return;

  // Навешиваем обработчик на все input, textarea и элементы выпадающих списков
  form.querySelectorAll("input, textarea").forEach((element) => {
    element.addEventListener("input", () => {
      if (isProcessing) return; // Если обработка уже идет, пропускаем повторный вызов

      isProcessing = true; // Устанавливаем флаг, что обработка началась

      // Проверяем изменения
      const changesDetected = hasChanges(originalTransactionValues);
      const allRequiredFieldsFilled = checkRequiredChangeFields(form.id);

      // Если изменения есть и обязательные поля заполнены, активируем кнопку
      if (changesDetected && allRequiredFieldsFilled) {
        editButton.classList.remove("disable");
        editButton.removeAttribute("data-tooltip");
      } else {
        editButton.classList.add("disable");
        editButton.setAttribute(
          "data-tooltip",
          "Заполните обязательные параметры"
        );
      }

      isProcessing = false; // Сбрасываем флаг после обработки
    });
  });

  // Добавляем обработчики для выпадающих списков (например, "Счет зачисления", "Категория")
  form.querySelectorAll(".modalDropdown").forEach((dropdown) => {
    dropdown.addEventListener("click", (event) => {
      if (event.target.closest(".modalOption")) {
        const changesDetected = hasChanges(originalTransactionValues);
        const allRequiredFieldsFilled = checkRequiredChangeFields(form.id);

        // Если изменения есть и обязательные поля заполнены, активируем кнопку
        if (changesDetected && allRequiredFieldsFilled) {
          editButton.classList.remove("disable");
          editButton.removeAttribute("data-tooltip");
        } else {
          editButton.classList.add("disable");
          editButton.setAttribute(
            "data-tooltip",
            "Заполните обязательные параметры"
          );
        }
      }
    });
  });
}

// Проверка заполненности всех обязательных полей в диалоговом окне
export function checkRequiredChangeFields(formId) {
  const form = document.getElementById(formId);
  const requiredFields = form.querySelectorAll(".requiredField");

  let allFieldsFilled = true;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      allFieldsFilled = false;
    }
  });

  return allFieldsFilled; // Возвращаем состояние, заполены ли все обязательные поля
}

// Функция для проверки изменений
function hasChanges(originalTransactionValues) {
  const modal = document.querySelector(".modal[open='true']"); // Определяем текущую открытую форму
  if (!modal) {
    console.error("Не найдена открытая форма для сравнения значений.");
    return false;
  }

  const currentValues = {};
  const formId = modal.id;

  // Собираем текущие значения из соответствующей формы
  currentValues["id"] = modal.querySelector("#inputId")?.value || "";
  currentValues["transactionDate"] =
    modal.querySelector("#dateTransaction")?.value || "";
  currentValues["transactionTime"] =
    modal.querySelector("#timeTransaction")?.value || "";
  currentValues["description"] =
    modal.querySelector("#modalInputDescription")?.value || "";

  // Проверяем форму по её типу (id контейнера)
  if (formId === "modalIncome") {
    currentValues["category"] =
      modal.querySelector("#modalInputCategoryId")?.value || "";
    currentValues["amount"] =
      modal.querySelector("#inputAmountIncome")?.value || "";
    currentValues["targetAccount"] =
      modal.querySelector("#modalInputTargetAccountId")?.value || "";
  } else if (formId === "modalExpense") {
    currentValues["category"] =
      modal.querySelector("#modalInputCategoryId")?.value || "";
    currentValues["amount"] =
      modal.querySelector("#inputAmountExpense")?.value || "";
    currentValues["sourceAccount"] =
      modal.querySelector("#modalInputSourceAccountId")?.value || "";
  } else if (formId === "modalTransfer") {
    currentValues["amount"] =
      modal.querySelector("#inputAmountTransfer")?.value || "";
    currentValues["sourceAccount"] =
      modal.querySelector("#modalInputSourceAccountId")?.value || "";
    currentValues["targetAccount"] =
      modal.querySelector("#modalInputTargetAccountId")?.value || "";
  } else {
    console.error(`Неизвестный тип формы: ${formId}`);
    return false;
  }

  // Сравниваем оригинальные и текущие значения
  for (const key in originalTransactionValues) {
    if (originalTransactionValues[key] !== currentValues[key]) {
      return true;
    }
  }

  // Если не найдено изменений
  return false;
}

function handleFocusIn(event) {
  const target = event.target;
  if (target.matches(".modalDescription")) {
    target.classList.add("focused");
  }
}

function handleFocusOut(event) {
  const target = event.target;
  if (target.matches(".modalDescription")) {
    target.classList.remove("focused");
  }
}

// Обработчик для режима просмотра события
function handleViewMode(event) {
  const modal = formTransactions.modalElement;
  const createEventButton = modal.querySelector(".createButton");

  // Убираем старый обработчик и добавляем новый для кнопки создания
  createEventButton.removeEventListener("click", handleCreateEvent);
  createEventButton.addEventListener("click", handleCreateEvent(event));
}
// Обработчик для создания события
function handleCreateEvent(event) {
  const modal = formTransactions.modalElement;
  const createEventButton = modal.querySelector(".createButton");

  // Проверка, если кнопка заблокирована
  if (createEventButton.classList.contains("disable")) {
    event.preventDefault();
    return;
  }
}

// Обработчик для режима удаления события
function handleDeleteMode(event) {
  const modal = formTransactions.modalElement;
  const createEventButton = modal.querySelector(".createButton");

  // Убираем старый обработчик и добавляем новый для кнопки удаления
  createEventButton.removeEventListener("click", handleDeleteEvent);
  createEventButton.addEventListener("click", (e) => handleDeleteEvent(e));
}

// Обработчик для удаления транзакции
function handleDeleteEvent(event) {
  console.log("Обработчик вызван"); // Логирование для отладки
  event.preventDefault(); // Останавливаем стандартное поведение
  const modal = formTransactions.modalElement;
  const createEventButton = modal.querySelector(".createButton");

  if (
    createEventButton.classList.contains("disable") ||
    createEventButton.disabled
  ) {
    console.log("Кнопка заблокирована, ничего не делаем");
    return;
  }

  console.log("Удаляем транзакцию");
  createEventButton.classList.add("disable");
  createEventButton.setAttribute("disabled", "true");

  deleteTransactions(); // Удаляем транзакцию

  closeDialog(); // Закрываем диалог
}
// Функция для открытия диалогового окна
function openDialog() {
  const modal = formTransactions.modalElement;
  modal.setAttribute("open", "true");
}

// Функция для закрытия диалоговых окон
export function closeDialog() {
  const modal = formTransactions.modalElement;
  modal.removeAttribute("open");
}

// функция удаления транзакции
export async function deleteTransactions() {
  const access_token = localStorage.getItem("access_token");
  const transactionId = localStorage.getItem("transactionId");
  try {
    const response = await deleteTransaction(transactionId, access_token);

    const successMessage = `Транзакция успешно удалена`;
    createToast("success", successMessage);
    manageLogicTransactions();
  } catch (error) {}
}

function populateTableWithTransactions(
  responseData,
  append = false
) {
  const userId = parseInt(localStorage.getItem("user_id"), 10);
  const eventRole = localStorage.getItem("eventRole");
  countTr = 0;
  let countTrValue = 0;
  let table = document.querySelector(".custom-table");

  const tbody = document.querySelector("tbody");
  const label = document.getElementById("infoTransactionsLabel");
  let totalRow = table.querySelector('td[data-name="Total"]')?.parentElement;
  let countTrTotal = countTrValue + countTr;
  let rowHTML = ``;

  // Функция, которая определяет нужно ли отображать лейбл "Еще"
  getTransactionsForPaginations(false);

  if (responseData.length === 0) {
    label.classList.remove("disable");
    tbody.innerHTML = "";
    return;
  } else {
    label.classList.add("disable");
  }
  if (!append) {
    tbody.innerHTML = "";
  }

  responseData.forEach((transaction) =>
    addTransactionRow(tbody, transaction, idToNameMap, userId, eventRole)
  );

  rowHTML = calculateTotalRow(totalRow, countTr);
  const newRow = document.createElement("tr");
  newRow.innerHTML = rowHTML;
  tbody.appendChild(newRow);

  if (append) {
    getTransactionsForPaginations(true);
  }
}
// Функция для добавления строки в таблицу
function addTransactionRow(tbody, transaction, idToNameMap, userId, eventRole) {
  const formattedTime = formatDateTime(transaction.transaction_date);
  const categoryTran = idToNameMap[transaction.category_id];
  const type =
    transaction.type === "Income"
      ? "Доход"
      : transaction.type === "Transfer"
      ? "Перевод"
      : "Расход";
  const color =
    type === "Доход" ? "green" : type === "Перевод" ? "blue" : "red";

  const sign = type === "Доход" ? "+" : type === "Перевод" ? "" : "-";

  const account = getAccount(transaction, transaction.type);
  const user = transaction.user_id === userId ? "Вы" : transaction.user.name;
  const receipt_id = transaction.receipt_id || "";



  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${transaction.number}</td>
    <td>${formattedTime}</td>
    <td>${type}</td>
    <td>${categoryTran}</td>
    <td style="color: ${color}">${sign}${transaction.amount} руб</td>
    <td>${user}</td>
    <td>${account}</td>
    <td class="receipt" data-id="${receipt_id}" style="cursor: ${
    receipt_id ? "pointer" : "default"
  }">
      ${
        receipt_id
          ? `<box-icon name='file' type='solid' color='#31bd2c'></box-icon>`
          : receipt_id
      }
    </td>
    ${
      eventRole === "Manager" ||
      (eventRole === "Observer" && transaction.user.id === userId) ||
      eventRole === "Partner"
        ? `<td>
          <img src="../../src/modules/events/asserts/show-regular-60.png" class="iconShow" data-transaction-id="${transaction.id}">
          <img src="../../src/modules/transactions/asserts/pencil-solid-60.png" class="iconEdit" data-transaction-id="${transaction.id}">
          <img src="../../src/modules/transactions/asserts/ri-delete-bin-6-line.png" class="iconDelete" data-transaction-id="${transaction.id}">
        </td>`
        : `<td>
          <img src="../../src/modules/events/asserts/show-regular-60.png" class="iconShow" data-transaction-id="${transaction.id}">
        </td>`
    }
  `;
  tbody.appendChild(row);
}

export function checkForChanges() {
  const changeBtn = document.getElementById("changeTra");
  const currentValues = {
    date: document.getElementById("dateTr").value,
    time: document.getElementById("timeTr").value,
    account: document.querySelector(".accountBox").value,
    type: document.querySelector('input[name="typeTransaction"]:checked')
      ?.value,
    category: document.querySelector(".categoryBox").value,
    sum: document.getElementById("sumTransaction").value,
    description: document.getElementById("descriptionTran").value,
  };
  const hasChanges = Object.keys(originalValues).some(
    (key) => originalValues[key] !== currentValues[key]
  );
  if (hasChanges) {
    changeBtn.classList.remove("disable");
  } else {
    changeBtn.classList.add("disable");
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function formatTime(timeString) {
  const date = new Date(timeString);

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

async function getReceipt(receipt_id) {
  const accessToken = localStorage.getItem("access_token");
  const receiptContainer = document.getElementById("receipt-container");

  try {
    // Показываем индикатор загрузки
    receiptContainer.innerHTML = `<span class="sc-caiKgP ipNIuR"> 
      <box-icon name='loader-alt' flip='horizontal' animation='spin' color='#ef6f0b'></box-icon>
    </span>`;

    const receipt = await getReceiptApi(accessToken, receipt_id);
    
    console.log("Полученный чек:", receipt); // Отладка
    
    if (!receipt) {
      throw new Error("API вернул пустой чек");
    }

    addReceiptToHTML(receipt); // Добавляем чек в HTML
    return receipt;
  } catch (error) {
    console.error("Ошибка при получении чека:", error);

    // Показываем сообщение об ошибке в окне чека
    receiptContainer.innerHTML = `<p style="color: red; text-align: center;">Ошибка загрузки чека</p>`;
    return null;
  }
}

function addReceiptToHTML(receipt) {
  // Получаем контейнер для чека
  const container = document.getElementById("receipt-container");

  // Преобразуем объект чека в HTML
  const receiptHTML = generateReceiptHTML(receipt);

  // Добавляем HTML в контейнер
  container.innerHTML = receiptHTML;
}

function generateReceiptHTML(receipt) {
  // Разбираем данные чека

  // Проверяем, что receipt — это массив и содержит хотя бы один элемент

  const receipt1 = receipt[0]; // Берем первый элемент массива

  const cashTotalSum =
    receipt1?.data.ticket.document.receipt.cashTotalSum || "0,00";
  const ecashTotalSum = receipt1.data.ticket.document.receipt.ecashTotalSum;
  const creditSum = receipt1?.data.ticket.document.receipt.creditSum || "0,00";
  const sellerInn = receipt1?.data.seller.inn || "--";
  const shiftNumber =
    receipt1?.data.ticket.document.receipt.shiftNumber || "--";
  const requestNumber =
    receipt1?.data.ticket.document.receipt.requestNumber || "--";
  const machineNumber =
    receipt1?.data.ticket.document.receipt.machineNumber || "--";
  const cho = receipt1?.data.ticket.document.receipt.taxationType || "--";
  const createdAt = receipt1?.data.operation.date || "--";
  const documentId = receipt1?.data.query.documentId || "--";
  const fiscalDocumentNumber = receipt?.fiscalDocumentNumber || "--";
  const fiscalDriveNumber =
    receipt1?.data.ticket.document.receipt.fiscalDriveNumber || "--";
  const kktRegId = receipt1?.data.ticket.document.receipt.kktRegId || "--";
  const fiscalSign = receipt1?.data.ticket.document.receipt.fiscalSign || "--";
  const operator = receipt1?.data.ticket.document.receipt.operator || "--";
  const retailPlace = receipt1?.data.ticket.document.receipt.retailPlace;
  const retailPlaceAddress =
    receipt1?.data.ticket.document.receipt.retailPlaceAddress || "--";

  // Здесь продолжаем работать с receipt1, например, разбираем данные

  const totalSum = receipt1.data.ticket.document.receipt.totalSum;
  const user = receipt?.user || "Неизвестно";
  const userInn = receipt?.userInn || "Неизвестно";

  const dateTime = receipt?.dateTime || Date.now() / 1000; // если нет даты, используем текущую

  const items = receipt1.data.ticket.document.receipt.items;
  const itemsHTML = items
    .map(
      (item, index) => `

          <div class="sc-cTApHj fVRyQa">
            <div class="sc-cNKpQo bSevbG">
              <div class="sc-bBHHQT iVWrCP">${index + 1}.</div>
              <div class="sc-AjmZR juOfWY">
                <div>${item.name}</div>
              </div>
            </div>
            <div class="sc-jObXwK cBBNUN">${item.quantity}</div>
            <div class="sc-dPiKHq jtMGgR">
            ${(item.sum / 100).toLocaleString("ru-RU", {
              minimumFractionDigits: 2,
            })}</div>
          </div>

`
    )
    .join("");

  const dateObj = new Date(createdAt);

  // Форматируем в нужный вид: день.месяц.год часы:минуты
  const formattedDate = dateObj
    .toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");

  // Формируем HTML-код чека
  return `
<div>
  <div
    class="sc-ezbkgU ilkjkI sc-gWXaA-D fzBOpH"
    data-reach-dialog-overlay=""
  >
    <div
      aria-modal="true"
      role="dialog"
      tabindex="-1"
      aria-label="receipt-details-modal"
      class="sc-hGPAah hfwvPT"
      data-reach-dialog-content=""
    >
      <div class="sc-dlVyqM fPYzXc">
        <div id="receipt-container" class="sc-iNGGwv hsrLVo">
          <div class="sc-cCcYRi kmLPwf">
          
            <span class="sc-jcFkyM ihvgJG">КАССОВЫЙ ЧЕК</span>
            <span
              class="sc-crHlIS hWTept sc-jgrIVw DBTfN"
              title=""
              id="close-icon"
            >
              <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16.9393 0.93934C17.5251 0.353553 18.4749 0.353553 19.0607 0.93934C19.6464 1.52513 19.6464 2.47487 19.0607 3.06066L12.1213 10L19.0607 16.9393C19.6464 17.5251 19.6464 18.4749 19.0607 19.0607C18.4749 19.6464 17.5251 19.6464 16.9393 19.0607L10 12.1213L3.06066 19.0607C2.47487 19.6464 1.52513 19.6464 0.939339 19.0607C0.353554 18.4749 0.353554 17.5251 0.939339 16.9393L7.87868 10L0.93934 3.06066C0.353553 2.47487 0.353553 1.52513 0.93934 0.93934C1.52513 0.353553 2.47487 0.353553 3.06066 0.93934L10 7.87868L16.9393 0.93934Z"
                  fill="#4164E3"
                ></path>
              </svg>
            </span>
          </div>
          <span class="sc-caiKgP ipNIuR">Приход</span>
          <div class="sc-cidCJl gHtjd">
            <div class="sc-iUKrWq kSLLaF">
              <div class="sc-iAKVOt klLDEA">
                <div class="sc-cNKpQo bSevbG">Предмет расчета</div>
                <div class="sc-jObXwK cBBNUN">Кол-во</div>
                <div class="sc-dPiKHq jtMGgR">Сумма, ₽</div>
              </div>
                <div class="sc-efQUeY eWLxTJ">
              ${itemsHTML}
                </div>
              </div>
      </div>
      <div class="sc-gSQGeZ iOAir">
        <div class="sc-jeqYYF sc-eJwXpk frkNye jMA-dWh">
          <div>Итог:</div>
          <div>${(totalSum / 100).toLocaleString("ru-RU", {
            minimumFractionDigits: 2,
          })} </div>
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">Наличные</div>
          <div>${cashTotalSum} 
          </div>
        
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">Безналичные</div>
          <div>${(totalSum / 100).toLocaleString("ru-RU", {
            minimumFractionDigits: 2,
          })} </div>
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">Предоплата (аванс)</div>
          <div>${creditSum}</div>
        </div>
      </div>
      <div class="sc-gSQGeZ sc-lbhJmS iOAir gRgzMw">
        <div class="sc-nVjpj jzhAMS">
          <div class="sc-jeqYYF frkNye">
            <div class="sc-hiwReK iFZavI">ИНН</div>
            <div>${sellerInn}</div>
          </div>
          <div class="sc-jeqYYF frkNye">
            <div class="sc-hiwReK iFZavI">№ смены</div>
            <div>${shiftNumber}</div>
          </div>
          <div class="sc-jeqYYF frkNye">
            <div class="sc-hiwReK iFZavI">Чек №</div>
            <div>${requestNumber}</div>
          </div>
        </div>
        <div class="sc-nVjpj jzhAMS">
          <div class="sc-jeqYYF frkNye">
            <div class="sc-hiwReK iFZavI">№ АВТ</div>
            <div>${machineNumber}</div>
          </div>
    
        </div>
      </div>
      <div class="sc-gSQGeZ iOAir2">
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">Дата/Время</div>
          <div>${formattedDate}</div>
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">ФД №:</div>
          <div>${documentId}</div>
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">ФН:</div>
          <div>${fiscalDriveNumber}</div>
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">РН ККТ:</div>
          <div>${kktRegId}</div>
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">ФП:</div>
          <div>${fiscalSign}</div>
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">Кассир:</div>
          <div class="sc-ehCIER jXeQeS">${operator}</div>
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">Место расчетов:</div>
          <div>${retailPlace}</div>
        </div>
        <div class="sc-jeqYYF frkNye">
          <div class="sc-hiwReK iFZavI">Адрес расчетов:</div>
          <div class="sc-ehCIER jXeQeS">
            ${retailPlaceAddress}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
</div>
</div>
`;

}



function clearModalReceipt() {
  const container = document.getElementById("receipt-container");
  const receiptHTML = `<div>
<div
class="sc-ezbkgU ilkjkI sc-gWXaA-D fzBOpH"
data-reach-dialog-overlay=""
>
<div
aria-modal="true"
role="dialog"
tabindex="-1"
aria-label="receipt-details-modal"
class="sc-hGPAah hfwvPT"
data-reach-dialog-content=""
>
<div class="sc-dlVyqM fPYzXc">
<div id="receipt-container" class="sc-iNGGwv hsrLVo">
  <div class="sc-cCcYRi kmLPwf">
    </span>
    <span class="sc-jcFkyM ihvgJG">КАССОВЫЙ ЧЕК</span>
    <span
      class="sc-crHlIS hWTept sc-jgrIVw DBTfN"
      title=""
      id="close-icon"
    >
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16.9393 0.93934C17.5251 0.353553 18.4749 0.353553 19.0607 0.93934C19.6464 1.52513 19.6464 2.47487 19.0607 3.06066L12.1213 10L19.0607 16.9393C19.6464 17.5251 19.6464 18.4749 19.0607 19.0607C18.4749 19.6464 17.5251 19.6464 16.9393 19.0607L10 12.1213L3.06066 19.0607C2.47487 19.6464 1.52513 19.6464 0.939339 19.0607C0.353554 18.4749 0.353554 17.5251 0.939339 16.9393L7.87868 10L0.93934 3.06066C0.353553 2.47487 0.353553 1.52513 0.93934 0.93934C1.52513 0.353553 2.47487 0.353553 3.06066 0.93934L10 7.87868L16.9393 0.93934Z"
        fill="#4164E3"
      ></path>
    </svg>
    </span>

  </div>
    <span class="sc-caiKgP ipNIuR"> <box-icon name='loader-alt' flip='horizontal' animation='spin' color='#ef6f0b' ></box-icon></span>
  </div>
</div>
</div>
</div>
</div>`;
  container.innerHTML = receiptHTML;
}

// Проверка заполненности всех обязательных полей в диалоговом окне
export function checkRequiredFields(formId) {
  const form = document.getElementById(formId);
  const requiredFields = form.querySelectorAll(".requiredField");
  const createButton = form.querySelector(".createButton");

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

  // Ограничение максимальной длины до 20 символов
  if (inputSumValue.length > 20) {
    inputSumValue = inputSumValue.slice(0, 20);
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

export async function createNewTransaction(type) {
  const form = document.querySelector(".modal");
  const button = form.querySelector(`#buttonCreate${type}`);
  button.classList.add("disable");

  // Общие поля
  const event_id = parseInt(localStorage.getItem("event"), 10);
  const dateTransaction = form.querySelector("#dateTransaction").value;
  const timeTransaction =
    form.querySelector("#timeTransaction").value || "00:00";
  const dateUTCString = convertTimeToUtc(dateTransaction, timeTransaction);
  const description =
    form.querySelector("#modalInputDescription").value || null;
  const access_token = localStorage.getItem("access_token");

  // Переменные для хранения данных
  let source_account_id,
    target_account_id,
    category_id,
    amount,
    destinationAccountId,
    receipt_id,
    transfer_fee;

  try {
    let response;

    // Развилка по типу транзакции
    if (type === "Expense") {
      category_id = parseInt(localStorage.getItem("transactionCategoryId"), 10);
      source_account_id = parseInt(localStorage.getItem("sourceAccountId"), 10);
      amount = parseFloat(form.querySelector("#inputAmountExpense").value);

      if (isNaN(amount) || amount <= 0) {
        const errorMessage = `Сумма должна быть больше 0`;
        createToast("error", errorMessage);
        return;
      }

      // Вызываем API для создания расхода
      response = await createTransactionApi(
        event_id,
        type,
        category_id,
        amount,
        dateUTCString,
        description,
        receipt_id,
        source_account_id,
        target_account_id,
        access_token
      );
    } else if (type === "Income") {
      category_id = parseInt(localStorage.getItem("transactionCategoryId"), 10);
      target_account_id = parseInt(localStorage.getItem("sourceTargetId"), 10);
      amount = parseFloat(form.querySelector("#inputAmountIncome").value);

      if (isNaN(amount) || amount <= 0) {
        const errorMessage = `Сумма должна быть больше 0`;
        createToast("error", errorMessage);
        return;
      }

      // Вызываем API для создания дохода
      response = await createTransactionApi(
        event_id,
        type,
        category_id,
        amount,
        dateUTCString,
        description,
        receipt_id,
        source_account_id,
        target_account_id,
        access_token
      );
    } else if (type === "Transfer") {
      category_id = 18;
      source_account_id = parseInt(localStorage.getItem("sourceAccountId"), 10);
      target_account_id = parseInt(localStorage.getItem("sourceTargetId"), 10);
      amount = parseFloat(form.querySelector("#inputAmountTransfer").value);
      transfer_fee =
        parseFloat(form.querySelector("#inputTransferFee").value) || 0;

      if (isNaN(amount) || amount <= 0) {
        const errorMessage = `Сумма должна быть больше 0`;
        createToast("error", errorMessage);
        return;
      }

      // Вызываем API для создания перевода
      response = await createTransactionApi(
        event_id,
        type,
        category_id,
        amount,
        dateUTCString,
        description,
        receipt_id,
        source_account_id,
        target_account_id,
        access_token,
        transfer_fee
      );
    } else {
      throw new Error("Неизвестный тип транзакции");
    }

    // Если все прошло успешно
    closeDialog();
    const successMessage = `Транзакция успешно изменена`;
    createToast("success", successMessage);
    setTimeout(manageLogicTransactions, 10);
  } catch (error) {
    // В случае ошибки
    closeDialog();
    const errorMessage = error.message || "Произошла ошибка";
    createToast("error", errorMessage);

    // Восстановление состояния кнопки
    setTimeout(() => {
      button.classList.remove("disable");
    }, 10000);
  }
}

export async function updateTransaction(type) {
  const form = document.querySelector(".modal");
  const button = form.querySelector(`#buttonEdit${type}`);
  button.classList.add("disable");

  // Общие поля
  const event_id = parseInt(localStorage.getItem("event"), 10);
  const transaction_id = parseInt(localStorage.getItem("transactionId"), 10);
  const dateTransaction = form.querySelector("#dateTransaction").value;
  const timeTransaction =
    form.querySelector("#timeTransaction").value || "00:00";
  const dateUTCString = convertTimeToUtc(dateTransaction, timeTransaction);
  const description =
    form.querySelector("#modalInputDescription").value || null;
  const access_token = localStorage.getItem("access_token");

  // Переменные для хранения данных
  let source_account_id,
    target_account_id,
    category_id,
    amount,
    receipt_id,
    transfer_fee;

  try {
    let response;

    // Развилка по типу транзакции
    if (type === "Expense") {
      
      category_id = parseInt(localStorage.getItem("transactionCategoryId"), 10);
      const inputSourceAccountId = form.querySelector(
        "#modalInputSourceAccountId"
      );
      source_account_id = parseInt(
        inputSourceAccountId.dataset.sourceAccountId,
        10
      );

      amount = parseFloat(form.querySelector("#inputAmountExpense").value);

      if (isNaN(amount) || amount <= 0) {
        const errorMessage = `Сумма должна быть больше 0`;
        createToast("error", errorMessage);
        return;
      }

      response = await updateTransactionApi(
        transaction_id,
        event_id,
        type,
        category_id,
        amount,
        dateUTCString,
        description,
        receipt_id,
        source_account_id,
        target_account_id,
        access_token
      );
    } else if (type === "Income") {
      const inputCategory = form.querySelector("#modalInputCategoryId");
      
      category_id = parseInt(inputCategory.dataset.categoryId, 10);

      const inputTargetAccountId = form.querySelector(
        "#modalInputTargetAccountId"
      );
      console.log(inputTargetAccountId);
      target_account_id = parseInt(
        inputTargetAccountId.dataset.targetAccountId,
        10
      );

      amount = parseFloat(form.querySelector("#inputAmountIncome").value);

      if (isNaN(amount) || amount <= 0) {
        const errorMessage = `Сумма должна быть больше 0`;
        createToast("error", errorMessage);
        return;
      }

      response = await updateTransactionApi(
        transaction_id,
        event_id,
        type,
        category_id,
        amount,
        dateUTCString,
        description,
        receipt_id,
        source_account_id,
        target_account_id,
        access_token
      );
    } else if (type === "Transfer") {
      category_id = 18;

      const inputSourceAccountId = form.querySelector(
        "#modalInputSourceAccountId"
      );
      source_account_id = parseInt(
        inputSourceAccountId.dataset.sourceAccountId,
        10
      );

      const inputTargetAccountId = form.querySelector(
        "#modalInputTargetAccountId"
      );

      target_account_id = parseInt(
        inputTargetAccountId.dataset.targetAccountId,
        10
      );

      amount = parseFloat(form.querySelector("#inputAmountTransfer").value);
      transfer_fee =
        parseFloat(form.querySelector("#inputTransferFee").value) || 0;

      if (isNaN(amount) || amount <= 0) {
        const errorMessage = `Сумма должна быть больше 0`;
        createToast("error", errorMessage);
        return;
      }

      response = await updateTransactionApi(
        transaction_id,
        event_id,
        type,
        category_id,
        amount,
        dateUTCString,
        description,
        receipt_id,
        source_account_id,
        target_account_id,
        access_token,
        transfer_fee
      );
    } else {
      throw new Error("Неизвестный тип транзакции");
    }

    // Если все прошло успешно
    closeDialog();
    const successMessage = `Транзакция успешно изменена`;
    createToast("success", successMessage);
    setTimeout(manageLogicTransactions, 10);
  } catch (error) {
    // В случае ошибки
    closeDialog();
    const errorMessage = error.message || "Произошла ошибка";
    createToast("error", errorMessage);

    // Восстановление состояния кнопки
    setTimeout(() => {
      button.classList.remove("disable");
    }, 10000);
  }
}

const MIN_PRELOADER_DURATION = 1000;

export function toggleModalDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const optionsContainer = document.querySelector(
    `#${dropdownId} .modalOption`
  );
  const isActive = dropdown.classList.contains("active");

  // Определение и вызов нужной функции для загрузки данных
  switch (dropdownId) {
    case "modalDropdownSourceAccount":
      fillSourceAccountDirectory(optionsContainer);
      break;
    case "modalDropdownTargetAccount":
      fillTargetAccountDirectory(optionsContainer);
      break;
    case "modalDropdownCategory":
      fillCategoryDirectory(optionsContainer);
      break;
    default:
      console.warn(`Unknown dropdownId: ${dropdownId}`);
  }

  toggleDropdownState(dropdown, isActive);

  document.addEventListener("click", (event) =>
    closeDropdownOnClick(event, dropdown, dropdownId)
  );
}

// Функция для заполнения справочника значениями и установки значения в инпут
function fillSourceAccountDirectory(options) {
  options = options;
  options.innerHTML = "";
  if (!cachedActiveAccounts || cachedActiveAccounts.length === 0) {
    options.classList.add("empty");
    options.innerHTML = `
    <div class="emptyMessage">
      <span> Нет активных счетов. <a href="https://sweetcash.org/pages/events/index.html" class="createLink">Создай</a></span>
    </div>
    `;
  } else {
    cachedActiveAccounts.forEach((cachedActiveAccount) => {
      var lista = options;
      var listItem = document.createElement("li");
      listItem.textContent = cachedActiveAccount.name;
      listItem.setAttribute("data-id", cachedActiveAccount.id);

      listItem.addEventListener("click", () => {
        const inputElement = document.getElementById(
          "modalInputSourceAccountId"
        );
        inputElement.value = cachedActiveAccount.name;
        localStorage.setItem("sourceAccountId", cachedActiveAccount.id);
      });

      lista.appendChild(listItem);
    });
  }
}

function fillTargetAccountDirectory(options) {
  options = options;
  options.innerHTML = "";
  if (!cachedActiveAccounts || cachedActiveAccounts.length === 0) {
    options.classList.add("empty");
    options.innerHTML = `
    <div class="emptyMessage">
      <span> Нет активных счетов. <a href="https://sweetcash.org/pages/events/index.html" class="createLink">Создай</a></span>
    </div>
    `;
  } else {
    cachedActiveAccounts.forEach((cachedActiveAccount) => {
      var lista = options;
      var listItem = document.createElement("li");
      listItem.textContent = cachedActiveAccount.name;
      listItem.setAttribute("data-id", cachedActiveAccount.id);

      listItem.addEventListener("click", () => {
        const inputElement = document.getElementById(
          "modalInputTargetAccountId"
        );
        localStorage.setItem("sourceTargetId", cachedActiveAccount.id);
        inputElement.value = cachedActiveAccount.name;
      });

      lista.appendChild(listItem);
    });
  }
}

// Функция для заполнения справочника значениями и установки значения в инпут
function fillCategoryDirectory(options) {
  options.innerHTML = "";
  if (!cachedCategories || cachedCategories.length === 0) {
    options.classList.add("empty");
    options.innerHTML = `
                        <div class="emptyMessage">
                          <span> Нет категорий. Обратитесь в поддержку</span>
                        </div>
                        `;
  } else {
    const modal = document.querySelector(".modal");
    const type = modal.id === "modalExpense" ? "Expense" : "Income";
    renderCategoryTree(options, type);
  }
}

// Функция для управления состоянием "active"
function toggleDropdownState(dropdown, isActive) {
  if (isActive) {
    dropdown.classList.remove("active");
  } else {
    if (currentOpenDropdown) {
      currentOpenDropdown.classList.remove("active");
    }
    dropdown.classList.add("active");
    currentOpenDropdown = dropdown;
  }
}

// Функция для закрытия dropdown при клике вне его
function closeDropdownOnClick(event, dropdown, dropdownId) {
  if (!event.target.closest(`#${dropdownId}`)) {
    dropdown.classList.remove("active");
    currentOpenDropdown = null;
    document.removeEventListener("click", (e) =>
      closeDropdownOnClick(e, dropdown, dropdownId)
    );
  }
}

function renderCategoryTree(lista, type) {
  const filteredCategories = cachedCategories.filter(
    (category) => category.type === type
  );
  lista.innerHTML = "";
  createCategoryTree(filteredCategories, lista);
}

function createCategoryTree(categories, parentElement) {
  const inputElement = document.querySelector("#modalInputCategoryId");
  const treeContainer = document.createElement("div");
  treeContainer.classList.add("category-tree");
  parentElement.appendChild(treeContainer);

  // Функция для рекурсивного создания дерева
  function createTree(categories, container) {
    categories.forEach((category) => {
      const categoryId = category.id;
      const categoryName = category.name;

      // Создаем элемент списка
      const listItem = document.createElement("li");
      listItem.setAttribute("data-id", categoryId);
      listItem.setAttribute("data-name", categoryName); // Сохраняем имя категории

      // Создаем элемент span для отображения имени категории
      const span = document.createElement("span");
      span.textContent = categoryName;

      // Добавляем элемент span в элемент списка
      listItem.appendChild(span);

      // Если у категории есть подкатегории, создаем вложенный список
      if (category.sub_categories && category.sub_categories.length > 0) {
        const subList = document.createElement("ul");
        subList.hidden = true; // Изначально скрываем подкатегории
        listItem.appendChild(subList);
        createTree(category.sub_categories, subList);

        // Добавляем span для развертывания/свертывания подкатегорий
        const toggleSpan = document.createElement("span");
        toggleSpan.classList.add("toggle", "plus");

        listItem.insertBefore(toggleSpan, span);
      } else {
        const toggleSpan = document.createElement("span");
        toggleSpan.classList.add("toggle", "minus");
        listItem.insertBefore(toggleSpan, span);
      }

      // Добавляем элемент списка в контейнер
      container.appendChild(listItem);
    });
  }

  // Создаем дерево категорий
  createTree(categories, treeContainer);

  treeContainer.addEventListener("click", function (event) {
    const target = event.target;

    if (target.classList.contains("toggle")) {
      event.stopPropagation();

      const listItem = target.parentNode;
      const subList = listItem.querySelector("ul");

      if (subList) {
        subList.hidden = !subList.hidden;

        if (subList.hidden) {
          target.classList.remove("minus");
          target.classList.add("plus");
        } else {
          target.classList.remove("plus");
          target.classList.add("minus");
        }
      }
    } else if (target.tagName === "SPAN" || target.tagName === "LI") {
      const listItem = target.tagName === "SPAN" ? target.parentNode : target;
      inputElement.value = listItem.getAttribute("data-name");
      localStorage.setItem(
        "transactionCategoryId",
        listItem.getAttribute("data-id")
      );
    }
  });
}
