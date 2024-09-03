import { formTransactions } from "./constants.js";
import {
  deleteTransaction,
  getTransacionsForEvent,
  getAllMyEvents,
  getCategoryTransaction,
  createTransactionApi,
  updateTransactionApi,
  refreshAccessToken,
  createReceiptApi,
} from "../../utils/api.js";
import { createToast } from "../notifications/index.js";
import { checkDate, isFieldFilled } from "../other_functions/validations.js";

const idToNameMap = {};

let countTr = 0;
let countTransac = 0;

export function checkForm() {
  // console.log(formTransactions.input_event.value);

  const start_date = formTransactions.start_date
    ? formTransactions.start_date.value
    : "";
  const end_date = formTransactions.end_date
    ? formTransactions.end_date.value
    : "";
  const input_event = formTransactions.input_event
    ? formTransactions.input_event.value
    : "";
  // console.log(12, start_date && end_date && input_event);
  if (start_date && end_date && input_event) {
    formTransactions.getTransactionButton.classList.remove("disable");
  } else {
    formTransactions.getTransactionButton.classList.add("disable");
  }
}

export function checkEvent() {
  const input_event = formTransactions.input_event
    ? formTransactions.input_event.value
    : "";
  // console.log(input_event);
  if (input_event) {
    // console.log("Удалить");
    formTransactions.create_transaction.classList.remove("disable");
    formTransactions.buttonScanQr.classList.remove("disable");
  } else {
    formTransactions.create_transaction.classList.add("disable");
    formTransactions.buttonScanQr.classList.add("disable");

    // console.log("Установить");
  }
}

export function handleClick() {
  formTransactions.modalElement.close();
  clearModalData();
}

export function handleClickTra() {
  formTransactions.modalElementTr.close();
  clearModalData();
}

export function handleClickTraShow() {
  formTransactions.showModalElementTr.close();
}

export function createTransaction() {
  clearModalData();
  var buttonEdit = document.getElementById("changeTra");
  buttonEdit.classList.add("Off");
  var buttonCreate = document.getElementById("createTra");
  buttonCreate.classList.remove("Off");
  buttonCreate.classList.add("disable");
  formTransactions.modalElementTr.showModal();
}

export async function deleteTransactions() {
  const access_token = localStorage.getItem("access_token");
  const transactionId = localStorage.getItem("transactionId");
  try {
    const response = await deleteTransaction(transactionId, access_token);

    // console.log("Транзакция успешно удалена");
    handleClick();
    const successMessage = `Транзакция успешно удалена`;
    createToast("success", successMessage);
    setTimeout(getTransactions, 10);
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export function deleteSErrorBorder() {
  formTransactions.start_date.classList.remove("error");
}

export function deleteEErrorBorder() {
  formTransactions.end_date.classList.remove("error");
}

export function getCountTransactions() {
  var screenHeight = window.innerHeight;

  var countTransaction = (screenHeight - 157) / 49 - 1;
  let intNumber = Math.floor(countTransaction);
  return intNumber;
}

export async function getTransactionsForPaginations(pagination) {
  const start_date = new Date(formTransactions.start_date.value);
  const end_date = new Date(formTransactions.end_date.value);

  const formattedStartDate =
    start_date.toISOString().slice(0, 10) + "T00:00:00Z";
  const formattedEndDate = end_date.toISOString().slice(0, 10) + "T23:59:59Z";
  const event_id = localStorage.getItem("event");
  var limit = 15;
  var offset = 0;
  if (pagination) {
    offset = getCountRowsTable();
    console.log(offset);
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
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export function getCountRowsTable() {
  const tbody = document.querySelector("tbody");
  const rows = tbody.querySelectorAll("tr");
  const rowCount = rows.length;

  console.log(`Количество строк в таблице: ${rowCount}`);
  return rowCount;
}

export async function getTransactions(offset = 0, append = false) {
  if (formTransactions.getTransactionButton.disabled) {
    return;
  }
  formTransactions.getTransactionButton.disabled = true;
  formTransactions.getTransactionButton.classList.add("disable");

  try {
    const start_date = new Date(formTransactions.start_date.value);
    const end_date = new Date(formTransactions.end_date.value);
    const formattedStartDate =
      start_date.toISOString().slice(0, 10) + "T00:00:00Z";
    const formattedEndDate = end_date.toISOString().slice(0, 10) + "T23:59:59Z";
    const event_id = localStorage.getItem("event");
    const limit = getCountTransactions();
    var offset = offset;
    const access_token = localStorage.getItem("access_token");

    if (checkDate(formattedStartDate, formattedEndDate)) {
    } else {
      const errorMessage = `Дата окончания мероприятия не может быть меньше даты начала мероприятия`;
      createToast("error", errorMessage);
      formTransactions.getTransactionButton.classList.add("disable");
      formTransactions.start_date.classList.add("error");
      formTransactions.end_date.classList.add("error");
      return;
    }

    formTransactions.start_date.classList.remove("error");
    formTransactions.end_date.classList.remove("error");

    getTransactionsForPaginations(false);

    const responseCat = getCategoryTransaction();

    const responseData = await getTransacionsForEvent(
      formattedStartDate,
      formattedEndDate,
      event_id,
      limit,
      offset,
      access_token
    );
    const tbody = document.querySelector("tbody");
    // Проверка, есть ли данные
    const label = document.getElementById("infoTransactionsLabel");
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

    countTr = 0;
    // Перебираем полученныеs данные и добавляем строки в таблицу
    responseData.forEach((transaction) => {
      const date = new Date(transaction.transaction_date);
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      const hours = ("0" + date.getHours()).slice(-2);
      const minutes = ("0" + date.getMinutes()).slice(-2);
      const seconds = ("0" + date.getSeconds()).slice(-2);
      const formattedTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;

      responseCat;

      const categoryTran = idToNameMap[transaction.category_id];

      let type;
      if (transaction.type === "Income") {
        type = "Доход";
        countTr += transaction.amount;
      } else if (transaction.type === "Expense") {
        type = "Расход";
        countTr -= transaction.amount;
      } else {
        type = transaction.type;
      }

      const receipt_id = transaction.receipt_id || "";

      const user_id = parseInt(localStorage.getItem("user_id"), 10);
      let user;
      if (transaction.user_id === user_id) {
        user = "Вы";
      } else {
        user = transaction.user_id;
      }

      const newRow = document.createElement("tr");
      const eventRole = localStorage.getItem("eventRole");
      let rowHTML = `
      <td>${transaction.number}</td>
      <td>${formattedTime}</td>
      <td>${type}</td>
      <td>${categoryTran}</td>
      <td>${transaction.amount} руб</td>
      <td>${user}</td>
      <td>${receipt_id}</td>`;

      if (
        eventRole === "Manager" ||
        (eventRole === "Observer" &&
          transaction.user_id === parseInt(localStorage.getItem("user_id"), 10))
      ) {
        rowHTML += `
          <td>
            <img src="../../src/modules/events/asserts/show-regular-60.png" alt="Иконка" class="iconShow">
            <img src="../../src/modules/transactions/asserts/pencil-solid-60.png" alt="Иконка" class="iconEdit">
            <img src="../../src/modules/transactions/asserts/ri-delete-bin-6-line.png" alt="Иконка" class="iconDelete" data-transaction-id="${transaction.id}">
          </td>`;
      } else if (eventRole === "Partner") {
        rowHTML += `
          <td>
            <img src="../../src/modules/events/asserts/show-regular-60.png" alt="Иконка" class="iconShow">
            <img src="../../src/modules/transactions/asserts/pencil-solid-60.png" alt="Иконка" class="iconEdit">
            <img src="../../src/modules/transactions/asserts/ri-delete-bin-6-line.png" alt="Иконка" class="iconDelete" data-transaction-id="${transaction.id}">
          </td>`;
      } else {
        rowHTML += `
          <td>
            <img src="../../src/modules/events/asserts/show-regular-60.png" alt="Иконка" class="iconShow">
          </td>`;
      }

      // newRow.addEventListener("click", function () {
      //   console.log(transaction);
      // });

      newRow.innerHTML = rowHTML;
      tbody.appendChild(newRow);

      const iconsDelete = document.querySelectorAll(".iconDelete");

      iconsDelete.forEach(function (icon) {
        icon.addEventListener("click", function () {
          const transactionId = icon.getAttribute("data-transaction-id");
          localStorage.setItem("transactionId", transactionId);

          formTransactions.modalElement.showModal();
        });
      });

      newRow.addEventListener("click", function () {
        const categoryTransa = idToNameMap[transaction.category_id];

        const idTransactionEdit = transaction.number;
        const dateTransaction = transaction.transaction_date;
        const timeTransaction = transaction.transaction_date;
        const typeTransaction = transaction.type;
        const categoryTransaction = categoryTransa;
        const amountTransaction = transaction.amount;
        const descriptionTransaction = transaction.description;

        const formatterDate = formatDate(dateTransaction);
        const formatterTime = formatTime(timeTransaction);

        fillModalWithData(
          idTransactionEdit,
          formatterDate,
          formatterTime,
          typeTransaction,
          categoryTransaction,
          amountTransaction,
          descriptionTransaction
        );

        fillModaShowlWithData(
          idTransactionEdit,
          formatterDate,
          formatterTime,
          typeTransaction,
          categoryTransaction,
          amountTransaction,
          descriptionTransaction
        );
      });
    });
    let countTrValue = 0;

    let table = document.querySelector(".custom-table");

    // Ищем строку с ячейкой <td data-name="Total"> Итого </td>
    let totalRow = table.querySelector('td[data-name="Total"]')?.parentElement;

    if (totalRow) {
      // Ищем ячейку с суммой (предполагаем, что она находится в 5-й ячейке)
      let countTrCell = totalRow.cells[4];

      // Извлекаем значение countTr
      countTrValue = parseFloat(
        countTrCell.textContent.trim().replace(" руб", "")
      );

      // Удаляем строку из таблицы
      totalRow.remove();

      // Теперь значение countTr сохранено в переменной countTrValue
      console.log("Значение countTr:", countTrValue);
    }

    let countTrTotal = countTrValue + countTr;
    let rowHTML = ``;

    if (countTrTotal > 0) {
      rowHTML = `
      <td data-name="Total"> Итого  </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td style="padding-left: 35px; color: green">${countTrTotal} руб </td>
      <td> </td>
      <td> </td>`;
    } else {
      rowHTML = `
      <td data-name="Total"> Итого  </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td style="padding-left: 35px; color: red">${countTrTotal} руб </td>
      <td> </td>
      <td> </td>`;
    }
    console.log(countTr);

    const newRow = document.createElement("tr");

    newRow.innerHTML = rowHTML;
    tbody.appendChild(newRow);

    const iconsEdit = document.querySelectorAll(".iconEdit");

    iconsEdit.forEach(function (icon) {
      icon.addEventListener("click", function () {
        const eventId = icon.getAttribute("data-event-id");
        var buttonEdit = document.getElementById("changeTra");
        buttonEdit.classList.remove("Off");
        var buttonCreate = document.getElementById("createTra");
        buttonCreate.classList.add("Off");
        getCategory();
        modalTransaction.showModal();
      });
    });

    const iconsShow = document.querySelectorAll(".iconShow");
    iconsShow.forEach(function (icon) {
      icon.addEventListener("click", function () {
        const inputs = formTransactions.showModalElementTr.querySelectorAll(
          "input, textarea, getTransactionButton"
        );

        formTransactions.showIdTransaction.style.background = "#f5f7fa";
        formTransactions.showDateTransaction.style.background = "#f5f7fa";
        formTransactions.showTimeTransaction.style.background = "#f5f7fa";
        formTransactions.showCatTransaction.style.background = "#f5f7fa";
        formTransactions.showSumTransaction.style.background = "#f5f7fa";
        formTransactions.showDescription.style.background = "#f5f7fa";

        formTransactions.showModalElementTr.showModal();
      });
    });
    if (append) {
      getTransactionsForPaginations(true);
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
    alert("Произошла ошибка при обращении к серверу.");
  } finally {
    formTransactions.getTransactionButton.classList.remove("disable");
    formTransactions.getTransactionButton.disabled = false;
  }
}

let originalValues = {};

function saveOriginalValues() {
  originalValues = {
    date: document.getElementById("dateTr").value,
    time: document.getElementById("timeTr").value,
    type: document.querySelector('input[name="typeTransaction"]:checked')
      ?.value,
    category: document.querySelector(".categoryBox").value,
    sum: document.getElementById("sumTransaction").value,
    description: document.getElementById("descriptionTran").value,
  };
}

export function checkForChanges() {
  const changeBtn = document.getElementById("changeTra");
  const currentValues = {
    date: document.getElementById("dateTr").value,
    time: document.getElementById("timeTr").value,
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

function fillModalWithData(
  id,
  date,
  time,
  type,
  category,
  amount,
  description
) {
  const InputId = document.getElementById("InputId");
  const radioButtons = document.querySelectorAll(
    'input[name="typeTransaction"]'
  );
  InputId.value = id;
  formTransactions.dateTransaction.value = date;
  formTransactions.timeTransaction.value = time;
  radioButtons.forEach((getTransactionButton) => {
    if (getTransactionButton.value === type) {
      getTransactionButton.checked = true;
    }
  });
  formTransactions.catTransaction.value = category;
  formTransactions.sumTransaction.value = amount;
  formTransactions.description.value = description;
  saveOriginalValues();
  const changeBtn = document.getElementById("changeTra");
  changeBtn.classList.add("disable");
}

function fillModaShowlWithData(
  id,
  date,
  time,
  type,
  category,
  amount,
  description
) {
  const radioButtons = document.querySelectorAll(
    'input[name="showTypeTransaction"]'
  );
  formTransactions.showIdTransaction.value = id;
  formTransactions.showDateTransaction.value = date;
  formTransactions.showTimeTransaction.value = time;
  radioButtons.forEach((getTransactionButton) => {
    if (getTransactionButton.value === type) {
      getTransactionButton.checked = true;
    }
  });
  formTransactions.showCatTransaction.value = category;
  formTransactions.showSumTransaction.value = amount;
  formTransactions.showDescription.value = description;
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
  // console.log(date);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export async function getEvent() {
  const token = localStorage.getItem("access_token");
  try {
    const events = await getAllMyEvents(token);
    const user_id = parseInt(localStorage.getItem("user_id"), 10);

    // console.log(events);
    events.forEach((event) => {
      const eventId = event.id;
      const eventName = event.name;
      const participants = event.participants;
      const user = participants.find(
        (participant) => participant.user_id === user_id
      );
      const userRole = user.role;

      var lista = document.querySelector(".option");
      var listItem = document.createElement("li");
      // console.log(participants);
      listItem.textContent = eventName;
      listItem.setAttribute("data-id", eventId);
      listItem.setAttribute("data-role", userRole);
      lista.appendChild(listItem);
    });

    // Вызываем функцию foo() после добавления элементов списка
    foo();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

const foo = () => {
  const list = document.querySelector(".option");
  const input = document.querySelector(".text-box");
  console.log(list);
  for (let i = 0; i < list.children.length; i++) {
    list?.children[i].addEventListener("click", (e) => {
      const selectedId = list.children[i].getAttribute("data-id");
      const selectedIdEvent = list.children[i].getAttribute("data-role");
      const selectedValue = list.children[i].innerHTML;

      input.value = selectedValue;
      localStorage.setItem("event", selectedId);
      localStorage.setItem("eventRole", selectedIdEvent);

      checkForm();
      checkEvent();
      // console.log(localStorage.getItem("event"));
    });
  }
};

export function sidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.addEventListener("mouseenter", function () {
    this.classList.remove("close");
  });

  sidebar.addEventListener("mouseleave", function () {
    this.classList.add("close");
  });
}

export function getDate() {
  // Функция для получения даты в формате YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Получаем текущую дату
  const currentDate = new Date();

  // Устанавливаем первый день текущего месяца
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const formattedFirstDay = formatDate(firstDayOfMonth);
  document.getElementById("start-date").value = formattedFirstDay;

  // Устанавливаем последний день текущего месяца
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const formattedLastDay = formatDate(lastDayOfMonth);
  document.getElementById("end-date").value = formattedLastDay;
}

export function changeStyleBorder() {
  // Изменяем стиль границы
  this.style.borderColor = "#409eff"; // Измените цвет границы по вашему вкусу
  // Удаляем плейсхолдер
  this.removeAttribute("placeholder");
}

export function customTextArea() {
  // Возвращаем исходный цвет границы
  this.style.borderColor = ""; // Вернуть стандартный цвет границы
  // Возвращаем плейсхолдер
  this.setAttribute("placeholder", "Введите описание к транзакции");
}

export function exit() {
  localStorage.clear();
  window.location.href = "../../pages/auth/index.html";
}

export function toggleDropdown(event) {
  formTransactions.dropdown.classList.toggle("active");
  event.stopPropagation();
}

export function closeDropdown(event) {
  if (!formTransactions.option.contains(event.target)) {
    formTransactions.dropdown.classList.remove("active");
  }
}

export function toggleDropdownCat(event) {
  formTransactions.dropdownCat.classList.toggle("active");
  event.stopPropagation();
}

export function closeDropdownTransaction(event) {
  if (!formTransactions.option1.contains(event.target)) {
    formTransactions.dropdown1.classList.remove("active");
  }
}

function getInputSumValue(input) {
  return input.value.replace(/[^\d,]/g, "");
}

export function onSumInput(e) {
  let input = e.target,
    inputSumValue = getInputSumValue(input),
    formattedInputValue = "";

  if (!inputSumValue) {
    return (input.value = "");
  }

  const commaCount = (inputSumValue.match(/,/g) || []).length; // Считаем количество запятых

  if (commaCount > 1) {
    // Если количество запятых больше 1, убираем последнюю запятую
    inputSumValue = inputSumValue.slice(0, -1);
  }

  if (commaCount === 0 && inputSumValue === "0") {
    // Правило 1: Если введен 0 в начале, заменить на 0 и запятую
    formattedInputValue = "0,";
  } else {
    formattedInputValue = inputSumValue;
  }
  input.value = formattedInputValue;
}

export function onPhoneKeyDown(e) {
  let input = e.target;
  let inputValue = getInputSumValue(input);
  if (
    e.keyCode === 8 &&
    inputValue.length == 2 &&
    inputValue[inputValue.length - 1] == ","
  ) {
    input.value = "";
  }
}

export async function getAllCategory() {
  try {
    const categories = await getCategoryTransaction();
    categories.forEach((item) => {
      idToNameMap[item.id] = item.name;
    });
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

// function createCategoryTree(categories, parentElement) {
//   categories.forEach((category) => {
//     const categoryId = category.id;
//     const categoryName = category.name;
//     const listItem = document.createElement("li");
//     const span = document.createElement("span");
//     span.classList.add("show");
//     span.textContent = categoryName;
//     listItem.setAttribute("data-id", categoryId);
//     listItem.appendChild(span);
//     parentElement.appendChild(listItem);

//     if (category.sub_categories && category.sub_categories.length > 0) {
//       const subList = document.createElement("ul");
//       listItem.appendChild(subList);
//       createCategoryTree(category.sub_categories, subList);
//     }
//   });
// }

// function createCategoryTree(categories, parentElement) {
//   categories.forEach((category) => {
//     const categoryId = category.id;
//     const categoryName = category.name;

//     // Создаем элемент списка
//     const listItem = document.createElement("li");
//     listItem.setAttribute("data-id", categoryId);

//     // Создаем элемент span для отображения имени категории
//     const span = document.createElement("span");
//     span.textContent = categoryName;

//     // Добавляем элемент span в элемент списка
//     listItem.appendChild(span);

//     let toggleSpan;

//     // Если у категории есть подкатегории, создаем вложенный список
//     if (category.sub_categories && category.sub_categories.length > 0) {
//       const subList = document.createElement("ul");
//       subList.hidden = true; // Изначально скрываем подкатегории
//       listItem.appendChild(subList);
//       createCategoryTree(category.sub_categories, subList);

//       // Добавляем класс toggle и плюсик к span
//       toggleSpan = document.createElement("span");
//       toggleSpan.classList.add("toggle", "plus");
//       listItem.insertBefore(toggleSpan, span);
//     } else {
//       // Если подкатегорий нет, добавляем минус
//       toggleSpan = document.createElement("span");
//       toggleSpan.classList.add("toggle", "minus");
//       listItem.insertBefore(toggleSpan, span);
//     }

//     // Добавляем элемент списка в родительский элемент
//     parentElement.appendChild(listItem);

//     // Обработчик события для переключения видимости подкатегорий
//     toggleSpan.addEventListener("click", function () {
//       if (category.sub_categories && category.sub_categories.length > 0) {
//         const subList = listItem.querySelector("ul");
//         subList.hidden = !subList.hidden;
//         // Переключаем класс и текст на плюс или минус
//         if (subList.hidden) {
//           toggleSpan.classList.remove("minus");
//           toggleSpan.classList.add("plus");
//         } else {
//           toggleSpan.classList.remove("plus");
//           toggleSpan.classList.add("minus");
//         }
//       }
//     });
//   });
// }

//

function createCategoryTree(categories, parentElement) {
  // Находим элемент input с классом "categoryBox"
  const inputElement = document.querySelector(".categoryBox");

  // Создаем контейнер для дерева категорий
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

  // Обработчик кликов на контейнер дерева
  treeContainer.addEventListener("click", function (event) {
    const target = event.target;

    // Если клик на элемент с классом toggle
    if (target.classList.contains("toggle")) {
      event.stopPropagation(); // Предотвращаем всплытие события

      const listItem = target.parentNode;
      const subList = listItem.querySelector("ul");

      if (subList) {
        // Переключаем видимость подкатегорий
        subList.hidden = !subList.hidden;

        // Обновляем класс и текст toggleSpan
        if (subList.hidden) {
          target.classList.remove("minus");
          target.classList.add("plus");
        } else {
          target.classList.remove("plus");
          target.classList.add("minus");
        }
      }
    }
    // Если клик на <li> или <span> (с именем категории)
    else if (target.tagName === "SPAN" || target.tagName === "LI") {
      // Определяем элемент <li>, на который был произведен клик
      const listItem = target.tagName === "SPAN" ? target.parentNode : target;
      inputElement.value = listItem.getAttribute("data-name"); // Заполняем input именем категории
      console.log(listItem.getAttribute("data-id"));
      localStorage.setItem("cat_transaction", listItem.getAttribute("data-id"));
      formTransactions.dropdown1.classList.remove("active");

      event.stopPropagation();
      checkForChanges();
    }
  });
}

export async function getCategory() {
  try {
    const categories = await getCategoryTransaction();

    const lista = document.getElementById("optionCat");
    lista.innerHTML = "";

    // Создание корневого элемента UL
    const rootUl = document.createElement("ul");
    rootUl.classList.add("tree");
    rootUl.id = "tree";
    lista.appendChild(rootUl);

    // Создание дерева категорий
    createCategoryTree(categories, rootUl);

    // fooq1();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export function checkCreateTranForm() {
  const dateTransaction = formTransactions.dateTransaction.value;
  const timeTransaction = formTransactions.timeTransaction.value;
  const catTransaction = formTransactions.catTransaction.value;
  const typeTransaction = formTransactions.typeTransaction.value;
  const sumTransaction = formTransactions.sumTransaction.value;
  if (dateTransaction && timeTransaction && sumTransaction && catTransaction) {
    formTransactions.createTra.classList.remove("disable");
  } else {
    formTransactions.createTra.classList.add("disable");
  }
}

function getSelectedRadioValue() {
  // Получаем все радиокнопки с классом 'custom-radio'
  var radios = document.querySelectorAll(".custom-radio");

  // Перебираем радиокнопки, чтобы найти выбранную
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      // Возвращаем значение выбранной радиокнопки
      return radios[i].value;
    }
  }

  // Если ни одна радиокнопка не выбрана, возвращаем null
  return null;
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

export async function createNewTransaction() {
  let buttonClicked = false;
  formTransactions.createTra.classList.add("disable");
  buttonClicked = true;
  // console.log("Я тут ");
  const eventId = localStorage.getItem("event");
  const dateTransaction = formTransactions.dateTransaction.value;
  const timeTransaction = formTransactions.timeTransaction.value;
  const catTransactionId = localStorage.getItem("cat_transaction");
  const sumTransaction = formTransactions.sumTransaction.value;
  const accessToken = localStorage.getItem("access_token");
  // const dateTime = new Date(`${dateTransaction}T${timeTransaction}:00`);
  const description = formTransactions.description.value || null;
  const typeTransaction = getSelectedRadioValue();

  let dateUTCString = "";
  dateUTCString = convertTimeToUtc(dateTransaction, timeTransaction);

  try {
    const response = await createTransactionApi(
      eventId,
      typeTransaction,
      catTransactionId,
      sumTransaction,
      dateUTCString,
      description,
      accessToken
    );

    // console.log(response);
    handleClickTra();
    const successMessage = `Транзакция успешно добавленна`;
    createToast("success", successMessage);
    setTimeout(getTransactions, 100);
    clearModalData();
  } catch (error) {
    // console.log("Я тут ");
    setTimeout(() => {
      formTransactions.createTra.classList.remove("disable");
      buttonClicked = false;
    }, 10000);
  }
}

export async function updateTransaction() {
  let buttonClicked = false;
  formTransactions.createTra.classList.add("disable");
  buttonClicked = true;
  const eventId = localStorage.getItem("event");
  const idTransaction = formTransactions.idTransaction.value;
  const dateTransaction = formTransactions.dateTransaction.value;
  const timeTransaction = formTransactions.timeTransaction.value;
  const catTransactionId = localStorage.getItem("cat_transaction");
  const sumTransaction = formTransactions.sumTransaction.value;
  const accessToken = localStorage.getItem("access_token");

  const description = formTransactions.description.value || null;
  const typeTransaction = getSelectedRadioValue();

  let dateUTCString = "";
  dateUTCString = convertTimeToUtc(dateTransaction, timeTransaction);

  try {
    const response = await updateTransactionApi(
      idTransaction,
      eventId,
      typeTransaction,
      catTransactionId,
      sumTransaction,
      dateUTCString,
      description,
      accessToken
    );

    handleClickTra();
    const successMessage = `Транзакция успешно обновлена`;
    createToast("success", successMessage);
    setTimeout(getTransactions, 100);
    clearModalData();
    const changeBtn = document.getElementById("changeTra");
    changeBtn.classList.add("disable");
  } catch (error) {
    // console.log("Я тут ");

    setTimeout(() => {
      buttonClicked = false;
    }, 10000);
  }
}

export function clearModalData() {
  const InputId = document.getElementById("InputId");
  InputId.value = "";
  formTransactions.dateTransaction.value = ""; // Очищаем поле "Дата"
  formTransactions.timeTransaction.value = ""; // Очищаем поле "Время"
  // Очищаем выбранные радиокнопки
  formTransactions.radioButtons.forEach((getTransactionButton) => {
    getTransactionButton.checked = false;
  });
  formTransactions.catTransaction.value = ""; // Очищаем поле "Категория"
  formTransactions.sumTransaction.value = ""; // Очищаем поле "Сумма"
  formTransactions.description.value = ""; // Очищаем поле "Описание"
}

export function checkEditTranForm() {
  const formTransactions = {
    dateTransaction: document.getElementById("dateTr"),
    timeTransaction: document.getElementById("timeTr"),
    catTransaction: document.querySelector(".categoryBox"),
    typeTransaction: document.querySelector(
      'input[name="typeTransaction"]:checked'
    ),

    sumTransaction: document.getElementById("sumTransaction"),
    description: document.getElementById("descriptionTran"),
  };

  const initialValues = {
    dateTransaction: formTransactions.dateTransaction.value,
    timeTransaction: formTransactions.timeTransaction.value,
    catTransaction: formTransactions.catTransaction.value,
    typeTransaction: formTransactions.typeTransaction
      ? formTransactions.typeTransaction.value
      : null,
    sumTransaction: formTransactions.sumTransaction.value,
    description: formTransactions.description.value,
  };

  const handleChange = (e) => {
    const { id, value, type, name, checked } = e.target;
    let currentValue =
      type === "radio" && checked ? value : formTransactions[id]?.value || "";

    if (type === "radio") {
      currentValue = document.querySelector(
        `input[name="${name}"]:checked`
      )?.value;
    }

    const initial = initialValues[id];
    if (currentValue !== undefined && currentValue !== initial) {
      // console.log("true");
    } else {
      // console.log("false");
    }
  };

  Object.values(formTransactions).forEach((field) => {
    if (field.type === "radio") {
      const radios = document.querySelectorAll(`input[name="${field.name}"]`);
      radios.forEach((radio) => {
        radio.addEventListener("change", handleChange);
      });
    } else {
      field.addEventListener("input", handleChange);
    }
  });
}

export async function checkAndUpdateToken() {
  const expireAt = localStorage.getItem("expire_at");
  if (!expireAt) return;

  const expireTime = new Date(expireAt).getTime();
  const currentTime = Date.now();
  const timeLeft = expireTime - currentTime;

  if (timeLeft > 0 && timeLeft <= 2 * 60 * 1000) {
    // 2 минуты в миллисекундах
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      await refreshAccessToken(refreshToken);
    } catch (error) {
      console.error("Ошибка обновления токена доступа:", error);
      setTimeout(() => {
        checkAndUpdateToken();
      }, 60 * 1000); // Повторить попытку через 1 минуту
    }
  } else if (timeLeft > 2 * 60 * 1000) {
    setTimeout(checkAndUpdateToken, timeLeft - 2 * 60 * 1000); // Запланировать обновление за 2 минуты до истечения
  }
}

export function redirectToAuth() {
  const access_token = localStorage.getItem("access_token");
  if (!access_token) {
    window.location.href = "../../pages/auth/index.html";
  }
}

function validateQrCode(message) {
  const regex =
    /^t=\w{1,}&s=[a-zA-Z0-9.]{1,}&fn=\w{1,}&i=\w{1,}&fp=\w{1,}&n=\w{1,}$/;
  return regex.test(message);
}

async function onScanSuccess(decodedText, decodedResult) {
  // handle the scanned code as you like, for example:

  console.log(`Code matched = ${decodedText}`, decodedResult);
  const access_token = localStorage.getItem("access_token");
  const event_id = localStorage.getItem("event");

  html5QrcodeScanner
    .clear()
    .then((ignore) => {
      // QR Code scanning is stopped.
    })
    .catch((err) => {
      // Stop failed, handle it.
    });

  console.log(validateQrCode(decodedText));

  if (!validateQrCode(decodedText)) {
    alert("Это не QR код");
    formTransactions.modalElementScan.close();
    formTransactions.buttonScanQr.classList.remove("disable");
    formTransactions.buttonScanQr.disabled = false;
  } else {
    console.log("Message is valid.");
  }

  try {
    const response = await createReceiptApi(
      event_id,
      decodedText,
      access_token
    );
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  } finally {
    formTransactions.buttonScanQr.classList.remove("disable");
    formTransactions.buttonScanQr.disabled = false;
    formTransactions.modalElementScan.close();
  }
}

function onScanFailure(error) {
  // handle scan failure, usually better to ignore and keep scanning.
  // for example:
  console.warn(`Code scan error = ${error}`);
}

let html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 50, qrbox: { width: 250, height: 250 } },
  /* verbose= */ false
);

export function openQrScanner() {
  formTransactions.buttonScanQr.disabled = true;
  formTransactions.buttonScanQr.classList.add("disable");
  formTransactions.modalElementScan.showModal();

  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}
