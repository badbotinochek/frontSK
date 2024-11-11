import { formCounts } from "./constants.js";
import {
  getAllMyAccountsApi,
  createAccountApi,
  updateAccountApi,
  addUserAccountApi,
  deleteUserAccountApi,
} from "../../utils/api.js";
import { createToast } from "../notifications/index.js";

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
      setTimeout(() => {
        checkAndUpdateToken();
      }, 60 * 1000); // Повторить попытку через 1 минуту
    }
  } else if (timeLeft > 2 * 60 * 1000) {
    setTimeout(checkAndUpdateToken, timeLeft - 2 * 60 * 1000); // Запланировать обновление за 2 минуты до истечения
  }
}

export function checkCreateForm() {
  const nameAccount = formCounts.modalCreateInputNameAccount
    ? formCounts.modalCreateInputNameAccount.value
    : "";

  if (nameAccount) {
    formCounts.modalCreateCreateButtonAccount.classList.remove("disable");
  } else {
    formCounts.modalCreateCreateButtonAccount.classList.add("disable");
  }
}

export function handleClickTra() {
  formCounts.modalEditFormAccount.close();
  formCounts.modalCreateFormAccount.close();
}

let isCommented = false;

export function exit() {
  localStorage.clear();
  window.location.href = "/pages/auth/index.html";
}

export function sidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.addEventListener("mouseenter", function () {
    this.classList.remove("close");
  });

  sidebar.addEventListener("mouseleave", function () {
    this.classList.add("close");
  });
}

export function showModalCount() {
  clearModalData();
  var buttonCreate = formCounts.modalCreateCreateButtonAccount;
  buttonCreate.classList.add("disable");
  formCounts.modalCreateFormAccount.showModal();
}

export function redirectToAuth() {
  const access_token = localStorage.getItem("access_token");
  if (!access_token) {
    window.location.href = "../../pages/auth/index.html";
  }
}

export function clearModalData() {
  formCounts.modalCreateInputIdAccount.value = "";
  formCounts.modalCreateInputNameAccount.value = "";
  formCounts.modalCreateInputDescriptionAccount.value = "";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

let originalAccountData = {};

// Функция для сохранения исходных значений
function saveOriginalValues(name, description, state) {
  originalAccountData = {
    name,
    description,
    state,
  };
}

export function checkForChanges() {
  const buttonEdit = formCounts.modalEditButtonAccount;
  const currentValues = {
    name: document.getElementById("modalEditInputNameAccount").value,
    description: document.getElementById("modalEditInputDescriptionAccount")
      ?.value,
    state: document.querySelector('input[name="modalEditRadioButtons"]:checked')
      ?.value,
  };

  const hasChanges = Object.keys(originalAccountData).some(
    (key) => originalAccountData[key] !== currentValues[key]
  );

  if (hasChanges) {
    buttonEdit.classList.remove("disable");
  } else {
    buttonEdit.classList.add("disable");
  }
}

function fillModalWithData(id, name, description, state) {
  const radioButtons = document.querySelectorAll('input[name="stateCount"]');

  if (state) {
    state = "true";
  } else {
    state = "false";
  }

  radioButtons.forEach((getStateRadioButton) => {
    if (getStateRadioButton.value === state) {
      getStateRadioButton.checked = true;
    }
  });
  if (description) {
    formCounts.modalCreateInputDescriptionAccount.value = description;
  } else {
  }

  formCounts.modalCreateInputIdAccount.value = id;
  formCounts.modalCreateInputNameAccount.value = name;

  saveOriginalValues(name, description, state);
}

function fillModalEditWithData(id, name, description, state, users) {
  const radioButtons = document.querySelectorAll(
    'input[name="modalEditRadioButtons"]'
  );

  if (state) {
    state = "true";
  } else {
    state = "false";
  }

  radioButtons.forEach((getStateRadioButton) => {
    if (getStateRadioButton.value === state) {
      getStateRadioButton.checked = true;
    }
  });
  if (description) {
    formCounts.modalEditInputDescriptionAccount.value = description;
  } else {
  }

  formCounts.modalEditInputIdAccount.value = id;
  formCounts.modalEditInputNameAccount.value = name;

  const tableBody = document.querySelector(".tableContainerAccount tbody");
  tableBody.innerHTML = "";

  users.forEach((user) => {
    const newRow = document.createElement("tr");
    newRow.dataset.userId = user.id;
    newRow.innerHTML = `
        <td >${user.id}</td>
        <td>${user.name}</td>
        <img src="../../src/modules/transactions/asserts/ri-delete-bin-6-line.png" alt="Иконка" class="iconDelete" data-user-id="${user.id}">
      `;

    tableBody.appendChild(newRow);
  });

  const deleteIcons = document.querySelectorAll(".iconDelete");
  deleteIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const userAccountId = icon.getAttribute("data-user-id");
      localStorage.setItem("userAccountId", userAccountId);
      localStorage.setItem("accountId", id);
      formCounts.modalAccount.showModal();
    });
  });

  saveOriginalValues(name, description, state);
  checkForChanges();
}

let countsData = [];

export async function getAllMyAccounts() {
  try {
    const access_token = localStorage.getItem("access_token");
    const blocked = "true";
    const responseData = await getAllMyAccountsApi(access_token, blocked);

    // Check if responseData is valid
    if (!responseData) {
      throw new Error("API response is empty or undefined.");
    }

    countsData = responseData;

    const tbody = document.querySelector("#MyCountsTable tbody");
    tbody.innerHTML = "";

    responseData.forEach((account) => {
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

      const newRow = document.createElement("tr");
      const userId = localStorage.getItem("user_id");

      if (parseInt(account.user.id, 10) === parseInt(userId, 10)) {
        newRow.innerHTML = `
        <td>${account.id}</td>
        <td>${account.name}</td>
        <td>${formattedcreatedDate}</td>
        <td>${account.user.name}</td>
        <td>${state}</td>
        <td>
        
         <img src="../../src/modules/transactions/asserts/pencil-solid-60.png" alt="Иконка" class="iconEditAccount" data-account-id="${account.id}">
        </td>`;
      } else {
        newRow.innerHTML = `
        <td>${account.id}</td>
        <td>${account.name}</td>
        <td>${formattedcreatedDate}</td>
        <td>${account.user.name}</td>
        <td>${state}</td>
        <td>
        </td>`;
      }

      // if (parseInt(account.user.id, 10) === parseInt(userId, 10)) {
      //   newRow.innerHTML = `
      //   <td>${account.id}</td>
      //   <td>${account.name}</td>
      //   <td>${formattedcreatedDate}</td>
      //   <td>${account.user.name}</td>
      //   <td>${state}</td>
      //   <td>
      //    <img src="../../src/modules/events/asserts/show-regular-60.png" alt="Иконка" class="iconShow">
      //    <img src="../../src/modules/transactions/asserts/pencil-solid-60.png" alt="Иконка" class="iconEditAccount" data-account-id="${account.id}">
      //   </td>`;
      // } else {
      //   newRow.innerHTML = `
      //   <td>${account.id}</td>
      //   <td>${account.name}</td>
      //   <td>${formattedcreatedDate}</td>
      //   <td>${account.user.name}</td>
      //   <td>${state}</td>
      //   <td>
      //    <img src="../../src/modules/events/asserts/show-regular-60.png" alt="Иконка" class="iconShow">
      //   </td>`;
      // }

      tbody.appendChild(newRow);
    });

    const iconsEdit = document.querySelectorAll(".iconEditAccount");
    iconsEdit.forEach(function (icon) {
      icon.addEventListener("click", function (event) {
        const row = icon.closest("tr");
        const idAccountEdit =
          row.querySelector(".iconEditAccount").dataset.accountId;
        const accountData = responseData.find(
          (account) => account.id == idAccountEdit
        );

        if (accountData) {
          const idCountEdit = accountData.id;
          const nameCount = accountData.name;
          const descriptionCount = accountData.description;
          const state = accountData.is_blocked;

          const users = accountData.admitted_users.map((admitted_users) => {
            return {
              id: admitted_users.id,
              name: admitted_users.name,
            };
          });

          localStorage.setItem("account", idCountEdit);
          fillModalEditWithData(
            idCountEdit,
            nameCount,
            descriptionCount,
            state,
            users
          );
        }

        var buttonEdit = formCounts.modalEditButtonAccount;
        buttonEdit.classList.add("disable");

        formCounts.modalEditFormAccount.showModal();
      });
    });
  } catch (error) {
    console.error("Произошла ошибка:", error);
    alert("Произошла ошибка при обращении к серверу.");
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

export async function updateAccount() {
  let buttonClicked = false;
  formCounts.modalEditButtonAccount.classList.add("disable");
  buttonClicked = true;
  const accountId = localStorage.getItem("account");
  const state = getSelectedRadioValue();
  const name = formCounts.modalEditInputNameAccount.value;
  const description = formCounts.modalEditInputDescriptionAccount.value;

  const accessToken = localStorage.getItem("access_token");

  try {
    const response = await updateAccountApi(
      accountId,
      name,
      description,
      state,
      accessToken
    );

    handleClickTra();
    const successMessage = `Счет успешно обновлен`;
    createToast("success", successMessage);
    setTimeout(getAllMyAccounts, 100);
  } catch (error) {
    setTimeout(() => {
      buttonClicked = false;
      formCounts.modalEditButtonAccount.classList.remove("disable");
    }, 10000);
  }
}

export async function createNewAccount() {
  let buttonClicked = false;
  formCounts.createModalEventButton.classList.add("disable");
  buttonClicked = true;

  const name = formCounts.modalCreateInputNameAccount.value;
  const description = formCounts.modalCreateInputDescriptionAccount.value;
  const accessToken = localStorage.getItem("access_token");

  try {
    const response = await createAccountApi(name, description, accessToken);

    handleClickTra();
    const successMessage = `Счет успешно добавленн`;
    createToast("success", successMessage);
    setTimeout(getAllMyAccounts, 100);
  } catch (error) {
    setTimeout(() => {
      formCounts.createModalEventButton.classList.remove("disable");
      buttonClicked = false;
    }, 10000);
  }
}

export function checkCreateAccountForm() {
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

export async function createAccount() {
  let buttonClicked = false;
  formCounts.modalCreateCreateButtonAccount.classList.add("disable");
  buttonClicked = true;
  const name = formCounts.modalCreateInputNameAccount.value;
  const description = formCounts.modalCreateInputDescriptionAccount.value;

  const accessToken = localStorage.getItem("access_token");

  try {
    const response = await createAccountApi(name, description, accessToken);

    handleClickTra();
    const successMessage = `Счет успешно создан`;
    createToast("success", successMessage);
    setTimeout(getAllMyAccounts, 100);
  } catch (error) {
    setTimeout(() => {
      buttonClicked = false;
      formCounts.modalCreateCreateButtonAccount.classList.remove("disable");
    }, 10000);
  }
}

export function clearModalAddUser() {
  formCounts.modalAddUserInputIdUser.value = "";
}

export function showModalAddUser() {
  formCounts.modalEditFormAccount.close();
  clearModalAddUser();
  formCounts.modalAddUserButton.classList.add("disable");
  formCounts.modalAddUserAccount.showModal();
}

export function closeModalAddUser() {
  formCounts.modalEditFormAccount.showModal();

  formCounts.modalAddUserAccount.close();
}

export function addUser() {}

export function validateAndCleanInput(value) {
  // Удаляем все символы, кроме цифр
  value = value.replace(/\D/g, "");

  // Удаляем ведущие нули, если они есть
  value = value.replace(/^0+/, "");

  if (value.length > 13) {
    value = value.slice(0, 13);
  }

  return value;
}

export function checkCreateAddUserForm() {
  if (formCounts.modalAddUserInputIdUser.value) {
    formCounts.modalAddUserButton.classList.remove("disable");
  } else {
    formCounts.modalAddUserButton.classList.add("disable");
  }
}

export async function addUserAccount() {
  // Получаем данные из модального окна

  let buttonClicked = false;
  formCounts.modalAddUserButton.classList.add("disable");
  buttonClicked = true;

  const userId = localStorage.getItem("user_id");
  const newUserId = formCounts.modalAddUserInputIdUser.value;
  const account_id = formCounts.modalEditInputIdAccount.value;

  // Проверяем, чтобы user_id не повторялся в таблице
  const tableBody = document.querySelector(".tableContainerAccount tbody");

  const existingUser = tableBody.querySelector(
    `tr[data-user-id="${newUserId}"]`
  );

  if (existingUser) {
    const errorMessage = `Пользователь с таким ID уже имеет доступ к счету`;
    createToast("error", errorMessage);
    return;
  }

  if (userId == newUserId) {
    const errorMessage = `Себя нельзя добавлять в счет`;
    createToast("error", errorMessage);
    return;
  }

  const accessToken = localStorage.getItem("access_token");

  try {
    const response = await addUserAccountApi(
      account_id,
      newUserId,
      accessToken
    );

    const successMessage = `Пользователю предоставлен доступ к счету`;
    createToast("success", successMessage);
    getAllMyAccounts();
    formCounts.modalAddUserAccount.close();
    formCounts.modalEditFormAccount.close();
  } catch (error) {
    setTimeout(() => {
      formCounts.modalAddUserButton.classList.remove("disable");
      buttonClicked = false;
    }, 1000);
  }
}

export function handleClick() {
  formCounts.modalAccount.close();
}

export async function deleteTransactions() {
  const access_token = localStorage.getItem("access_token");
  const userAccountId = localStorage.getItem("userAccountId");
  const accountId = localStorage.getItem("accountId");

  try {
    const response = await deleteUserAccountApi(
      accountId,
      userAccountId,
      access_token
    );
    getAllMyAccounts();
    handleClick();
    formCounts.modalEditFormAccount.close();
    const successMessage = `Доступ заблокирован к счету для пользователя`;
    createToast("success", successMessage);
  } catch (error) {}
}
