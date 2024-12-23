import { formAccounts } from "./constants.js";
import {
  accountsTemplateElements,
  addUserTemplateElements,
  deleteUserTemplateElements,
} from "./templates.js";
import {
  getAllMyAccountsApi,
  createAccountApi,
  updateAccountApi,
  addUserAccountApi,
  deleteUserAccountApi,
} from "../../utils/api.js";
import { createToast } from "../notifications/index.js";

let originalAccountData = {};

// Общая функция, которая заполняет данными таблицу и навешивает обработчики
export async function getAllMyAccounts() {
  try {
    const access_token = localStorage.getItem("access_token");
    const blocked = "true";
    const responseData = await getAllMyAccountsApi(access_token, blocked);

    if (!responseData) {
      throw new Error("API response is empty or undefined.");
    }

    // Передаем данные в функцию, которая заполняет таблицу
    populateTableWithLiabilities(responseData);

    // Добавляем обработчики событий
    addListenersForIconsEdit(responseData);
    addListenersForIconsShow(responseData);
  } catch (error) {
    console.error("Произошла ошибка:", error);
    alert("Произошла ошибка при обращении к серверу.");
  }
}
// Функция для заполнения данных в таблицу Счета
function populateTableWithLiabilities(responseData) {
  const tbody = document.querySelector(".custom-table tbody");
  tbody.innerHTML = "";

  responseData.forEach((account) => {
    const newRow = document.createElement("tr");
    const userId = localStorage.getItem("user_id");
    const createdDate = new Date(account.created_at);
    const startday = ("0" + createdDate.getDate()).slice(-2);
    const startmonth = ("0" + (createdDate.getMonth() + 1)).slice(-2);
    const startyear = createdDate.getFullYear();
    const formattedcreatedDate = `${startday}.${startmonth}.${startyear}`;
    let state = " ";

    if (account.is_blocked) {
      state = "Архивный";
    } else {
      state = "Активный";
    }

    if (parseInt(account.user.id, 10) === parseInt(userId, 10)) {
      newRow.innerHTML = `
      <td>${account.id}</td>
      <td>${account.name}</td>
      <td>${formattedcreatedDate}</td>
      <td>${account.user.name}</td>
      <td>${state}</td>
      <td>
        <img src="../../src/modules/accounts/asserts/icon-show.png" alt="Иконка" class="iconShowAccount" data-account-id="${account.id}">
       <img src="../../src/modules/accounts/asserts/icon-pencil.png" alt="Иконка" class="iconEditAccount" data-account-id="${account.id}">
      </td>`;
    } else {
      newRow.innerHTML = `
      <td>${account.id}</td>
      <td>${account.name}</td>
      <td>${formattedcreatedDate}</td>
      <td>${account.user.name}</td>
      <td>${state}</td>
      <td>
       <img src="../../src/modules/accounts/asserts/icon-show.png" alt="Иконка" class="iconShowAccount" data-account-id="${account.id}">
      </td>`;
    }

    tbody.appendChild(newRow);
  });
}
// Функция для навешивания обработчиков на иконку Редактирование счета
function addListenersForIconsEdit(responseData) {
  const iconsEdit = document.querySelectorAll(".iconEditAccount");
  iconsEdit.forEach(function (icon) {
    icon.addEventListener("click", function (event) {
      const row = icon.closest("tr");
      const idAccountEdit =
        row.querySelector(".iconEditAccount").dataset.accountId;
      const account = responseData.find(
        (account) => account.id == idAccountEdit
      );

      handleOpenMainModal("edit", account);
    });
  });
}
// Функция для навешивания обработчиков на иконку Просмотра счета
function addListenersForIconsShow(responseData) {
  const iconsEdit = document.querySelectorAll(".iconShowAccount");
  iconsEdit.forEach(function (icon) {
    icon.addEventListener("click", function (event) {
      const row = icon.closest("tr");
      const idAccountEdit =
        row.querySelector(".iconShowAccount").dataset.accountId;
      const account = responseData.find(
        (account) => account.id == idAccountEdit
      );
      handleOpenMainModal("view", account);
    });
  });
}
// Общая функция для управления диалогового окна "Просмотр/редактирование счета"
function handleOpenMainModal(mode, account) {
  // Добавляем в диалог HTML
  fillDialogWithHTML(mode);

  // Если account передан, заполняем форму данными
  if (account) {
    fillDialogFields(account);
  }

  // Добавляем класс disabled ко всем элементам для режима veiw и убираем placeholders
  if (mode === "view") {
    disableModalInputs(modal);
    removePlaceholders(modal);
    removeIconsDeleteCoowners();
  }

  // Устанавливаем на диалоговое окно обработчики
  addEventListeners(mode);

  // Отображаем диалоговое окно
  openDialog();
}
// Единая функция, которая вставляет в диалоговое окно HTML
function fillDialogWithHTML(mode) {
  const modal = formAccounts.modalElement;
  const modalContent = document.querySelector(".modalContent");

  // Очищаем текущее содержимое
  modalContent.innerHTML = "";

  // Устанавливаем класс модального окна
  modal.className = `modal modalaccount`;

  // Создаём заголовок
  const title = document.createElement("h2");
  title.id = "modalTitle";

  if (mode === "edit") {
    title.textContent = "Редактирование счета";
  } else if (mode === "create") {
    title.textContent = "Создание счета";
  } else if (mode === "view") {
    title.textContent = "Просмотр счета";
  } else {
    title.textContent = "Неизвестный режим";
  }

  // Создаём форму
  const form = document.createElement("form");
  form.id = "modalForm";

  // Формируем содержимое формы в зависимости от сущности
  let formHTML = "";
  if (mode === "edit") {
    formHTML += accountsTemplateElements.id;
    formHTML += accountsTemplateElements.name;
    formHTML += accountsTemplateElements.status;
    formHTML += accountsTemplateElements.description;
    formHTML += accountsTemplateElements.coowners;
    formHTML += accountsTemplateElements.shareButton;
    formHTML += accountsTemplateElements.buttons.edit;
  } else if (mode === "create") {
    formHTML += accountsTemplateElements.name;
    formHTML += accountsTemplateElements.description;
    formHTML += accountsTemplateElements.buttons.create;
  } else if (mode === "view") {
    formHTML += accountsTemplateElements.id;
    formHTML += accountsTemplateElements.name;
    formHTML += accountsTemplateElements.status;
    formHTML += accountsTemplateElements.description;
    formHTML += accountsTemplateElements.coowners;
    formHTML += accountsTemplateElements.buttons.view;
  }

  // Устанавливаем содержимое формы
  form.innerHTML = formHTML;

  // Добавляем заголовок и форму в модальное окно
  modalContent.appendChild(title);
  modalContent.appendChild(form);

  // Не знаю почему но в поле "Описание" при создании диалогового окна создается 3 пробела. Код ниже удаляет это
  const textInput = document.getElementById("modalInputDescription");
  const cleanedText = textInput.value.trim();
  textInput.value = cleanedText;
}
// Функция для заполнения данных в диалоговом окне "Просмотра/редактирования счета"
function fillDialogFields(account) {
  if (!account || typeof account !== "object") {
    console.error("Передан некорректный объект для заполнения диалога.");
    return;
  }

  const inputId = document.getElementById("inputId");
  if (inputId) {
    inputId.value = account.id || "";
    originalAccountData.id = inputId.value;
  }

  const inputName = document.getElementById("inputName");
  if (inputName) {
    inputName.value = account.name || "";
    originalAccountData.name = inputName.value;
  }

  const inputDescription = document.getElementById("modalInputDescription");
  if (inputDescription) {
    inputDescription.value = account.description || "";
    originalAccountData.description = inputDescription.value;
  }

  const status = document.getElementById("modalInputStatus");
  if (account.is_blocked) {
    status.value = "Архивный";
    originalAccountData.status = "Архивный";
  } else {
    status.value = "Активный";
    originalAccountData.status = "Активный";
  }

  // Заполнение таблицы с совладельцами счета
  populateTableWithAdmittedUsers(account);
}
// Функция для заполнения данных в таблице "Совладельцы счета"
function populateTableWithAdmittedUsers(account) {
  const tableBody = document.querySelector(".customTableAccount tbody");
  const tableContainer = document.querySelector(".tableContainerAccount");
  tableBody.innerHTML = "";
  const { admitted_users } = account || {};
  const user_id = localStorage.getItem("user_id");

  if (!admitted_users || admitted_users.length === 0) {
    if (!document.querySelector(".noAdmittedUsersLabel")) {
      const noAdmittedUsersLabel = document.createElement("div");
      noAdmittedUsersLabel.classList.add("noAdmittedUsersLabel");
      noAdmittedUsersLabel.textContent = "Нет совладельцев";

      tableContainer.appendChild(noAdmittedUsersLabel);
    }
    return;
  }

  if (account.user.id == user_id) {
    admitted_users.forEach((user) => {
      const row = document.createElement("tr");

      row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td class="smallRow">
        <img src="../../src/modules/accounts/asserts/icon-delete.png" class="iconModalDelete" data-user-id=${user.id}>
      </td>`;

      tableBody.appendChild(row);
    });
  } else {
    admitted_users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td class="smallRow"> 
      </td>`;

      tableBody.appendChild(row);
    });
  }
}
// Добавляем класс disabled ко всем элементам для режима veiw
function disableModalInputs(modalElement) {
  const elements = modalElement.querySelectorAll(
    "input, textarea, modalInputStatus"
  );

  elements.forEach((element) => {
    if (element.tagName !== "BUTTON") {
      element.classList.add("disabled");
    }
  });
}
// Убираем placeholders для режима veiw
function removePlaceholders(modal) {
  const inputs = modal.querySelectorAll(
    "input[placeholder], textarea[placeholder]"
  );
  inputs.forEach((input) => {
    input.removeAttribute("placeholder");
  });
}
// Удаляем иконку удаления совладельца для режима veiw
function removeIconsDeleteCoowners() {
  const tableRows = document.querySelectorAll(".customTableAccount tbody tr");
  tableRows.forEach((row) => {
    const deleteIcon = row.querySelector("img");
    if (deleteIcon) {
      deleteIcon.remove();
    }
  });
}
// Навешиваем обработчики для диалогового окна "Просмотра/редактирования счета"
function addEventListeners(mode) {
  const modal = document.getElementById("modal");
  const closeButton = document.querySelector(".closeDialogButton");

  const inputId = document.getElementById("inputId");
  const inputName = document.getElementById("inputName");
  const inputStatus = document.getElementById("modalInputStatus");
  const inputDescription = document.getElementById("modalInputDescription");
  const saveChangeAccountButton = modal.querySelector(".editButton");

  // Общий обработчик для закрытия окна
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Универсальный обработчик кликов для всего модального окна
  document.getElementById("modalForm").addEventListener("click", (event) => {
    const target = event.target;

    if (mode === "view") {
      const saveButton = document.querySelector(".viewButton");
      if (target === saveButton) {
        event.stopPropagation();
        event.preventDefault();
      }
    } else if (mode === "create") {
      const createAccountButton = document.querySelector(".createButton");
      const inputAccount = document.querySelector(".modalInput");

      inputAccount.addEventListener("input", (event) => {
        const target = event.target;
        if (target.classList.contains("requiredField")) {
          checkRequiredFields("modalForm");
        }
      });

      createAccountButton.addEventListener("click", (e) => {
        if (createAccountButton.classList.contains("disable")) {
          e.preventDefault();
          return;
        }
        createNewAccount();
      });
    } else if (mode === "edit") {
      // Проверяем клик по выпадающему списку и выполняем нужные действия
      if (target.closest(".modalDropdown")) {
        toggleDropdownState(target);
      }
      // Если кликнули по элементу списка, выбираем его и закрываем список
      if (target.closest(".modalOption li")) {
        selectDropdownItem(event);
      }
      // Закрытие выпадающего списка при клике вне его
      document.addEventListener("click", (event) => {
        closeDropdownOnClick(event);
      });

      // Обработчик для кнопки "Поделиться счетом"
      const shareButton = document.getElementById("openModalAddUserButton");
      if (target === shareButton) {
        event.stopPropagation();
        event.preventDefault();
        handleOpenAdditionalModal("addUser");
        // Ваш код для обработки действия по кнопке "Поделиться счетом"
      }

      // Обработчик для кнопки удаления пользователя
      const deleteIcon = target.closest(".iconModalDelete"); // Ищем ближайший элемент с классом iconModalDelete
      if (deleteIcon) {
        const deleteUserId = deleteIcon.getAttribute("data-user-id"); // Получаем id пользователя из атрибута
        handleOpenAdditionalModal("deleteUser", deleteUserId);
      }
      // Обработчики для отслеживания изменений

      // Навешиваем обработчики
      inputName.addEventListener("input", handleFieldChange);
      inputDescription.addEventListener("input", handleFieldChange);

      // Для изменения статуса через выпадающий список
      inputStatus.addEventListener("click", () => {
        const statusItems = document.querySelectorAll("#modalOptionStatus li");
        statusItems.forEach((item) => {
          item.addEventListener("click", () => {
            inputStatus.value = item.textContent; // Обновляем значение поля
            handleFieldChange(); // Проверяем изменения и обновляем состояние кнопки
          });
        });
      });

      saveChangeAccountButton.addEventListener("click", (e) => {
        if (saveChangeAccountButton.classList.contains("disable")) {
          e.preventDefault();
          return;
        }
        updateAccount();
      });
    }
  });
}

function handleFieldChange() {
  const formId = "modalForm";
  const isChanged = checkIfChanged();
  const isValid = checkRequiredFieldsEditForm(formId);

  const saveButton = document.querySelector(".editButton");
  if (isChanged && isValid) {
    saveButton.classList.remove("disable");
    saveButton.disabled = false;
    saveButton.removeAttribute("data-tooltip");
  } else {
    saveButton.classList.add("disable");
    saveButton.disabled = true;
    saveButton.setAttribute("data-tooltip", "Заполните обязательные параметры");
  }
}
function checkIfChanged() {
  const inputName = document.getElementById("inputName");
  const inputStatus = document.getElementById("modalInputStatus");
  const inputDescription = document.getElementById("modalInputDescription");
  const currentData = {
    name: inputName.value,
    status: inputStatus.value,
    description: inputDescription.value,
  };

  // Сравниваем текущие данные с оригинальными
  return (
    currentData.name !== originalAccountData.name ||
    currentData.status !== originalAccountData.status ||
    currentData.description !== originalAccountData.description
  );
}
function checkRequiredFieldsEditForm(formId) {
  const form = document.getElementById(formId);
  const requiredFields = form.querySelectorAll(".requiredField");

  let allFieldsFilled = true;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      allFieldsFilled = false;
    }
  });

  return allFieldsFilled;
}

// Функция для открытия/закрытия выпадающего списка
function toggleDropdownState(target) {
  const dropdownTrigger = target.closest(".modalDropdown");
  if (!dropdownTrigger) return;

  const dropdown = dropdownTrigger.querySelector(".modalOption");
  dropdownTrigger.classList.toggle("active");
}
// Функция для выбора элемента из выпадающего списка и установки его в input
function selectDropdownItem(event) {
  const selectedItem = event.target.closest("li");
  if (selectedItem) {
    const dropdownTrigger = event.target.closest(".modalDropdown");
    const input = dropdownTrigger.querySelector("input");
    localStorage.setItem("stateAccount", input.value);
    input.value = selectedItem.textContent.trim();
    dropdownTrigger.classList.remove("active");
  }
}
// Функция для закрытия выпадающего списка при клике вне него
function closeDropdownOnClick(event) {
  const dropdownTrigger = document.querySelector(".modalDropdown.active");
  if (dropdownTrigger && !dropdownTrigger.contains(event.target)) {
    dropdownTrigger.classList.remove("active");
  }
}

// Функция для управления диалогового окна "Создание счета"
export function handleOpenModalCreate(event) {
  const entity = event.target.dataset.entity;
  const mode = event.target.dataset.mode;
  fillDialogWithHTML(mode);
  openDialog();
  addEventListeners(mode);
}
// Функция для открытия диалогового окна "Создание счета"
function openDialog() {
  const modal = document.getElementById("modal");
  modal.style.display = "flex";
}
// Функция для проверки заполненности обязательных параметров
function checkRequiredFields(formId) {
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
// Функция для создания счета
async function createNewAccount() {
  const modal = document.querySelector(".modal");
  const button = document.querySelector(".createButton");
  const access_token = localStorage.getItem("access_token");
  const name = modal.querySelector("#inputName").value.trim();
  const description = modal
    .querySelector("#modalInputDescription")
    .value.trim();

  button.classList.add("disable");

  try {
    let response = await createAccountApi(name, description, access_token);

    setTimeout(() => {
      getAllMyAccounts();
    }, 500);
    createToast("success", `Счет с ID равным ${response.id} успешно добавлен`);
    closeDialog();
  } catch (error) {
    console.error("Ошибка при создании счета:", error);
    createToast(
      "error",
      error.message || "Произошла ошибка при создании счета"
    );
  } finally {
    setTimeout(() => {
      button.classList.remove("disable");
    }, 1000);
  }
}

// Функция для закрытия диалоговых окон
export function closeDialog() {
  const additionalModal = document.getElementById("additionalModal");
  const modal = document.getElementById("modal");

  if (additionalModal && additionalModal.style.display === "flex") {
    additionalModal.style.display = "none";
    if (modal) {
      modal.style.display = "flex";
    }
  } else if (modal && modal.style.display === "flex") {
    modal.style.display = "none";
  }
}

// Единая функция для открытия диалогового окна "Добавить пользователя"
function handleOpenAdditionalModal(type, deleteUserId) {
  // Добавляем в диалог HTML
  fillAdditionalModalWithHTML(type);

  // Накидываем обработчики на вторичное диалоговое окно
  if (type == "addUser") {
    addEventListenersForAdditionalModal();
  } else {
    addEventListenersForDeleteUserModal(deleteUserId);
  }

  // Отображаем диалоговое окно
  openAdditionalModal();
}
// Единая функция, которая вставляет во вторичное диалоговое окно HTML
function fillAdditionalModalWithHTML(type) {
  const modal = document.getElementById("additionalModal");
  const modalContent = modal.querySelector(".modalContent");

  // Очищаем текущее содержимое
  modalContent.innerHTML = "";

  // Устанавливаем класс модального окна
  modal.className = `modal modal${type}`;

  // Создаём заголовок
  const title = document.createElement("h2");
  title.id = "modalTitle";

  if (type === "addUser") {
    title.textContent = "Поделиться счетом";
  } else if (type === "deleteUser") {
    title.textContent = "Удалить совладельца";
  } else {
    title.textContent = "Неизвестный режим";
  }

  // Создаём форму
  const form = document.createElement("form");
  form.id = "additionalModalForm";

  // Формируем содержимое формы в зависимости от сущности
  let formHTML = "";
  if (type === "addUser") {
    formHTML += addUserTemplateElements.addUser;
  } else if (type === "deleteUser") {
    formHTML += deleteUserTemplateElements.deleteUser;
  }

  // Устанавливаем содержимое формы
  form.innerHTML = formHTML;

  // Добавляем заголовок и форму в модальное окно
  modalContent.appendChild(title);
  modalContent.appendChild(form);
}
// Функция, где накидываем обработчики на диалоговое окно "Добавить пользователя"
function addEventListenersForAdditionalModal() {
  const modal = document.getElementById("additionalModal");
  const closeButton = modal.querySelector("#closeAdditionalModal");
  const saveButton = modal.querySelector(".createButton");
  const inputIdUser = modal.querySelector("#inputIdUser");

  closeButton.addEventListener("click", () => {
    closeDialog();
  });

  document.body.addEventListener("input", (event) => {
    const target = event.target;
    if (target.id === "inputIdUser") {
      keepOnlyNumbers(target.id, event);
    }
  });

  saveButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Останавливаем отправку формы

    if (saveButton.classList.contains("disable")) {
      return; // Если кнопка заблокирована, ничего не делаем
    }

    try {
      const account = await addUserAccount(modal);
      if (true) {
        getAllMyAccounts();
        closeDialog();
        closeDialog();
      }
    } catch (error) {
      console.error("Ошибка при добавлении пользователя к счету:", error);
    }
  });

  // Обработка для проверки заполненности обязательных полей
  document.body.addEventListener("input", (event) => {
    const target = event.target;
    if (target.classList.contains("requiredField")) {
      checkRequiredFields("additionalModalForm"); // Проверяем обязательные поля в форме
    }
  });
}
function addEventListenersForDeleteUserModal(deleteUserId) {
  const modal = document.getElementById("additionalModal");
  const closeButton = modal.querySelector("#closeAdditionalModal");
  const saveButton = modal.querySelector(".createButton");
  const inputIdUser = modal.querySelector("#inputIdUser");

  closeButton.addEventListener("click", () => {
    closeDialog();
  });

  saveButton.addEventListener("click", async (event) => {
    event.preventDefault();
    deleteUser(deleteUserId);
  });
}
// Отображаем диалоговое окно
function openAdditionalModal() {
  closeDialog();
  const modal = document.getElementById("additionalModal");
  modal.style.display = "flex";
}

// Обрезаем все кроме цифр
export function keepOnlyNumbers(inputId) {
  const input = document.getElementById(inputId);
  let inputSumValue = input.value;

  inputSumValue = inputSumValue.replace(/\D/g, "");
  input.value = inputSumValue;
}

// Функция для добавления пользователя в совладельцы счетом
export async function addUserAccount(modal) {
  const accessToken = localStorage.getItem("access_token");
  const userId = localStorage.getItem("user_id");
  const saveButton = modal.querySelector(".createButton");
  const inputIdUser = modal.querySelector("#inputIdUser");
  const newUserId = parseInt(inputIdUser.value, 10);
  const accountIdInput = document.querySelector("#inputId");
  const accountId = parseInt(accountIdInput.value, 10);

  blockUserInteraction();

  saveButton.classList.add("disable");
  saveButton.removeAttribute("data-tooltip");

  // Проверки на некорректный ввод
  if (userId === newUserId) {
    createToast("error", `Себя нельзя добавлять в совладельцы счета`);
    unblockUserInteraction();
    return null;
  }

  if (checkUserIdInTable(newUserId)) {
    createToast(
      "error",
      `Пользователь с ID ${newUserId} уже имеет доступ к счету`
    );
    unblockUserInteraction();
    return null;
  }

  try {
    // Вызываем API и получаем статус и данные
    const { status, data } = await addUserAccountApi(
      accountId,
      newUserId,
      accessToken
    );

    if (status === 200) {
      createToast("success", `Пользователю предоставлен доступ к счету`);
      return data; // Возвращаем данные API в случае успеха
    }
  } catch (error) {
    // Обрабатываем ошибки, показывая сообщение пользователю
    createToast("error", `${error.message}`);
    return null;
  } finally {
    unblockUserInteraction();
    saveButton.classList.remove("disable");
  }
}
// Функция для проверки наличия ID пользователя в таблице совладельцев
function checkUserIdInTable(userIdToCheck) {
  const tableRows = document.querySelectorAll(
    ".tableContainerAccount .customTableAccount tbody tr"
  );

  for (const row of tableRows) {
    const userIdFromDataAttr = row
      .querySelector(".smallRow .iconModalDelete")
      ?.getAttribute("data-user-id");
    if (userIdFromDataAttr) {
      const userId = parseInt(userIdFromDataAttr, 10);
      if (userId === userIdToCheck) {
        return true;
      }
    }
  }

  return false;
}

// Переменная для блокировки событий
let blockKeyEvents;
// Функция для блокировки всех действий пользователя
function blockUserInteraction() {
  // Создаем overlay
  const overlay = document.createElement("div");
  overlay.id = "overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "9999"; // Должен быть выше всех остальных элементов
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  // Блокируем действия с клавишами (например, клавиша Esc)
  blockKeyEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden"; // Блокируем прокрутку

  // Блокируем клавишу Escape и любые другие события
  document.addEventListener("keydown", blockKeyEvents, true); // Блокирует нажатие клавиш
  document.addEventListener("click", blockKeyEvents, true); // Блокирует клики
}
// Функция для разблокировки всех действий пользователя
function unblockUserInteraction() {
  const overlay = document.getElementById("overlay");
  if (overlay) {
    overlay.remove(); // Удаляем блокирующий слой
  }

  document.body.style.overflow = ""; // Восстанавливаем прокрутку
  document.removeEventListener("keydown", blockKeyEvents, true); // Разблокируем клавиши
  document.removeEventListener("click", blockKeyEvents, true); // Разблокируем клики
}

export async function deleteUser(deleteUserId) {
  const accessToken = localStorage.getItem("access_token");
  const userAccountId = parseInt(deleteUserId, 10);
  const accountIdInput = document.querySelector("#inputId");
  const accountId = parseInt(accountIdInput.value, 10);

  try {
    const response = await deleteUserAccountApi(
      accountId,
      userAccountId,
      accessToken
    );
    const successMessage = `Доступ заблокирован к счету для пользователя`;
    createToast("success", successMessage);
    getAllMyAccounts();
    closeDialog();
    closeDialog();
    formCounts.modalEditFormAccount.close();
  } catch (error) {}
}

// Функция для обновления счета
export async function updateAccount() {
  const accessToken = localStorage.getItem("access_token");
  const modal = document.querySelector(".modal");
  const button = document.querySelector(".createButton");
  const accountIdInput = document.querySelector("#inputId");
  const accountId = parseInt(accountIdInput.value, 10);
  const name = modal.querySelector("#inputName").value.trim();
  const description = modal
    .querySelector("#modalInputDescription")
    .value.trim();
  const savedState = localStorage.getItem("stateAccount");

  let isBlocked;
  if (savedState === "Активный") {
    isBlocked = false;
  } else if (savedState === "Архивный") {
    isBlocked = true;
  } else {
    console.error("Неизвестное состояние в Local Storage:", savedState);
  }

  try {
    const response = await updateAccountApi(
      accountId,
      name,
      description,
      isBlocked,
      accessToken
    );

    setTimeout(() => {
      getAllMyAccounts();
    }, 100);
    const successMessage = `Счет успешно обновлен`;
    createToast("success", successMessage);
    closeDialog();
  } catch (error) {
    setTimeout(() => {
      buttonClicked = false;
      formCounts.modalEditButtonAccount.classList.remove("disable");
    }, 10000);
  }
}
