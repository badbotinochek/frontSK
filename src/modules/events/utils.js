import {
  getMyEventsApi,
  getMyInvitationApi,
  getForeignInvitationApi,
  eventConfirmApi,
  eventRejectApi,
  createEventApi,
  createParticipantApi,
  updateEventApi,
} from "../../utils/api.js";
import { createToast } from "../notifications/index.js";
import { formEvent } from "./constants.js";
import { eventsTemplateElements } from "./templates.js";

// Общая функция, которая заполняет данными таблицу и навешивает обработчики
export async function getMyEvents() {
  try {
    const access_token = localStorage.getItem("access_token");
    const responseData = await getMyEventsApi(access_token);

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
  const tbody = document.querySelector("#MyEventsTable tbody");
  tbody.innerHTML = "";

  responseData.forEach((event) => {
    const startDate = new Date(event.start);
    const startday = ("0" + startDate.getDate()).slice(-2);
    const startmonth = ("0" + (startDate.getMonth() + 1)).slice(-2);
    const startyear = startDate.getFullYear();
    const starthours = ("0" + startDate.getHours()).slice(-2);
    const startminutes = ("0" + startDate.getMinutes()).slice(-2);
    const startseconds = ("0" + startDate.getSeconds()).slice(-2);
    const formattedStartDate = `${startday}.${startmonth}.${startyear}`;

    let formattedEndDate = "";
    if (event.end) {
      const endDate = new Date(event.end);
      const endtday = ("0" + endDate.getDate()).slice(-2);
      const endmonth = ("0" + (endDate.getMonth() + 1)).slice(-2);
      const endyear = endDate.getFullYear();
      const endhours = ("0" + endDate.getHours()).slice(-2);
      const endminutes = ("0" + endDate.getMinutes()).slice(-2);
      const endseconds = ("0" + endDate.getSeconds()).slice(-2);
      formattedEndDate = `${endtday}.${endmonth}.${endyear}`;
    } else {
      formattedEndDate = "";
    }

    const participantsCount = event.participants.length;

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
            <td>${event.name}</td>
            <td>${formattedStartDate}</td>
            <td>${formattedEndDate}</td>
            <td>${participantsCount}</td>
            <td> 
                  <img src="../../src/modules/events/asserts/show-regular-60.png" alt="Иконка" class="iconShowEvent" data-measure-id="${event.id}" > 
                  <img src="../../src/modules/transactions/asserts/pencil-solid-60.png" alt="Иконка" class="iconEditEvent" data-measure-id="${event.id}">
            </td>`;

    tbody.appendChild(newRow);
  });
}
// Функция для навешивания обработчиков на иконку Редактирование счета
function addListenersForIconsEdit(responseData) {
  const iconsEdit = document.querySelectorAll(".iconEditEvent");
  iconsEdit.forEach(function (icon) {
    icon.addEventListener("click", function (event) {
      const row = icon.closest("tr");
      const idMeasureEdit =
        row.querySelector(".iconEditEvent").dataset.measureId;
      const measure = responseData.find(
        (measure) => measure.id == idMeasureEdit
      );
      handleOpenMainModal("edit", measure);
    });
  });
}
// Функция для навешивания обработчиков на иконку Просмотра счета
function addListenersForIconsShow(responseData) {
  const iconsEdit = document.querySelectorAll(".iconShowEvent");
  iconsEdit.forEach(function (icon) {
    icon.addEventListener("click", function (event) {
      const row = icon.closest("tr");
      const idMeasureShow =
        row.querySelector(".iconShowEvent").dataset.measureId;
      const measure = responseData.find(
        (measure) => measure.id == idMeasureShow
      );
      handleOpenMainModal("view", measure);
    });
  });
}
// Общая функция для управления диалогового окна "Просмотр/редактирование счета"
function handleOpenMainModal(mode, measure) {
  // Добавляем в диалог HTML
  fillMainDialogWithHTML(mode);

  // Если measure передан, заполняем форму данными
  if (measure) {
    fillEventDialogFields(measure);
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
function fillMainDialogWithHTML(mode) {
  const modalMainContent = formEvent.modalMainContent;

  // Очищаем текущее содержимое
  modalMainContent.innerHTML = "";

  // Создаём заголовок
  const title = document.createElement("h2");
  title.id = "modalMainTitle";

  if (mode === "create") {
    title.textContent = "Создание мероприятия";
  } else if (mode === "edit") {
    title.textContent = "Редактирование мероприятия";
  } else if (mode === "view") {
    title.textContent = "Просмотр мероприятия";
  } else {
    title.textContent = "Неизвестный режим";
  }

  // Создаём форму
  const form = document.createElement("form");
  form.id = "modalForm";

  // Формируем содержимое формы в зависимости от сущности
  let formHTML = "";
  if (mode === "create") {
    formHTML += eventsTemplateElements.name;
    formHTML += eventsTemplateElements.period;
    formHTML += eventsTemplateElements.description;
    formHTML += eventsTemplateElements.buttons.create;
  } else if (mode === "edit") {
    formHTML += eventsTemplateElements.id;
    formHTML += eventsTemplateElements.name;
    formHTML += eventsTemplateElements.period;
    formHTML += eventsTemplateElements.description;
    formHTML += eventsTemplateElements.participant;
    formHTML += eventsTemplateElements.addParticipantButton;
    formHTML += eventsTemplateElements.buttons.edit;
  } else if (mode === "view") {
    formHTML += eventsTemplateElements.id;
    formHTML += eventsTemplateElements.name;
    formHTML += eventsTemplateElements.period;
    formHTML += eventsTemplateElements.description;
    formHTML += eventsTemplateElements.participant;
    formHTML += eventsTemplateElements.buttons.view;
  }

  // Устанавливаем содержимое формы
  form.innerHTML = formHTML;

  // Добавляем заголовок и форму в модальное окно
  modalMainContent.appendChild(title);
  modalMainContent.appendChild(form);

  // Не знаю почему но в поле "Описание" при создании диалогового окна создается 3 пробела. Код ниже удаляет это
  const textInput = document.getElementById("modalInputDescription");
  const cleanedText = textInput.value.trim();
  textInput.value = cleanedText;
}
function fillEventDialogFields(event) {
  if (!event || typeof event !== "object") {
    console.error("Передан некорректный объект для заполнения диалога.");
    return;
  }

  // Уникальный идентификатор
  const inputId = document.getElementById("inputId");
  if (inputId) {
    inputId.value = event.id || "";
  }

  // Наименование мероприятия
  const inputName = document.getElementById("inputName");
  if (inputName) {
    inputName.value = event.name || "";
  }

  // Дата начала
  const dateStart = document.getElementById("dateStartEvent");
  if (dateStart) {
    dateStart.value = event.start ? event.start.split("T")[0] : ""; // Убираем время
  }

  // Дата окончания
  const dateEnd = document.getElementById("dateEndEvent");
  if (dateEnd) {
    dateEnd.value = event.end ? event.end.split("T")[0] : ""; // Убираем время
  }

  // Описание
  const inputDescription = document.getElementById("modalInputDescription");
  if (inputDescription) {
    inputDescription.value = event.description || "";
  }

  // Заполнение таблицы с участниками
  populateTableWithParticipants(event.participants);
}
function populateTableWithParticipants(participants) {
  const tableBody = document.querySelector(".customTableParticipant tbody");
  tableBody.innerHTML = "";

  const roleMap = {
    Manager: "Менеджер",
    Observer: "Контролер",
    Partner: "Партнер",
  };

  // Заполняем таблицу участниками
  participants.forEach((participant) => {
    const mappedRole = roleMap[participant.role] || "Роль не указана";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${participant.user_id}</td>
      <td>${participant.user.name || "Без имени"}</td>
     <td>${mappedRole}</td>`;
    tableBody.appendChild(row);
  });
}
// Добавляем класс disabled ко всем элементам для режима veiw
function disableModalInputs() {
  const modalMainContent = document.getElementById("mainModal"); // Получаем основной элемент модального окна
  const elements = modalMainContent.querySelectorAll(
    "input, textarea, modalInputStatus , button"
  );

  elements.forEach((element) => {
    // Для кнопки "Добавить участника" добавляем атрибут disabled и класс disabled
    if (element.classList.contains("closeDialogButton")) {
      return;
    } else {
      // Для остальных элементов (кроме кнопки "Добавить участника") не изменяем состояние
      element.classList.add("disabled");
    }
  });
}
// Основная функция для добавления обработчиков событий
function addEventListeners(mode) {
  const modal = formEvent.modalMain;
  const closeButton = document.querySelector(".closeDialogButton");

  // Обработчик кликов на кнопку Закрытия диалогового окна
  closeButton.addEventListener("click", closeDialog);

  // Обработчик кликов по форме
  document.getElementById("modalForm").addEventListener("click", (event) => {
    // В зависимости от режима выполняем соответствующие действия
    if (mode === "create") {
      handleCreateMode(modal);
    } else if (mode === "edit") {
      handleEditMode(event, modal);
    }
  });
}
// Обработчик для режима создания события
function handleCreateMode(modal) {
  const createEventButton = modal.querySelector(".createButton");

  // Убираем старый обработчик и добавляем новый для кнопки создания
  createEventButton.removeEventListener("click", handleCreateEvent);
  createEventButton.addEventListener("click", handleCreateEvent);
}
// Обработчик для создания события
function handleCreateEvent(e) {
  const modal = formEvent.modalMain;
  const createEventButton = modal.querySelector(".createButton");

  // Проверка, если кнопка заблокирована
  if (createEventButton.classList.contains("disable")) {
    e.preventDefault();
    return;
  }

  // Если кнопка активна, вызываем функцию создания события
  createNewEvent();
}
async function createNewEvent() {
  const accessToken = localStorage.getItem("access_token");
  const modal = formEvent.modalMain;
  const button = document.querySelector(".createButton");
  const name = modal.querySelector("#inputName").value.trim();
  const dateStart = modal.querySelector("#dateStartEvent").value.trim();
  const dateEnd = modal.querySelector("#dateEndEvent").value.trim() || null;
  const description =
    modal.querySelector("#modalInputDescription").value.trim() || null;

  button.classList.add("disable");

  const formatDate = (dateString) => {
    const dateParts = dateString.split("-");
    if (dateParts.length !== 3) {
      throw new Error("Неверный формат даты");
    }
    const year = dateParts[0];
    const month = dateParts[1].padStart(2, "0");
    const day = dateParts[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formattedStartDate = `${formatDate(dateStart)}T00:00:00.000Z`;
  const formattedEndDate = dateEnd
    ? `${formatDate(dateEnd)}T23:59:59.999Z`
    : null;

  try {
    const response = await createEventApi(
      name,
      formattedStartDate,
      formattedEndDate,
      description,
      accessToken
    );

    setTimeout(getMyEvents, 1000);
    closeDialog();
    const successMessage = `Мероприятие создано`;
    createToast("success", successMessage);
  } catch (error) {
    setTimeout(() => {
      button.classList.remove("disable");
    }, 10000);
  }
}

// Обработчик для режима редактирования
function handleEditMode(event, modal) {
  const target = event.target;

  // Обработчик для кнопки "Поделиться счетом"
  const shareButton = document.getElementById("openModalAddParticipanButton");
  if (target === shareButton) {
    event.stopPropagation();
    event.preventDefault();
    handleOpenAdditionalModal();
  }

  // Обработчик для сохранения изменений
  // const saveChangeAccountButton = modal.querySelector(".editButton");
  // saveChangeAccountButton.addEventListener("click", (e) => {
  //   if (saveChangeAccountButton.classList.contains("disable")) {
  //     e.preventDefault();
  //     return;
  //   }
  //   updateAccount();
  // });
}
// Единая функция для открытия диалогового окна "Добавить пользователя"
function handleOpenAdditionalModal() {
  // Добавляем в диалог HTML
  fillAdditionalModalWithHTML();

  // // Накидываем обработчики на вторичное диалоговое окно
  // if (type == "addUser") {
  //   addEventListenersForAdditionalModal();
  // } else {
  //   addEventListenersForDeleteUserModal(deleteUserId);
  // }

  // Отображаем диалоговое окно
  openAdditionalModal();
}
// Единая функция, которая вставляет во вторичное диалоговое окно HTML
function fillAdditionalModalWithHTML() {
  const modal = document.getElementById("minorModal");
  const modalContent = modal.querySelector(".modalMinorContent");

  // Очищаем текущее содержимое
  modalContent.innerHTML = "";

  // Устанавливаем класс модального окна
  modal.className = `modal modal${"participant"}`;

  // Создаём заголовок
  const title = document.createElement("h2");
  title.id = "modalTitle";
  title.textContent = "Добавление участника";

  // Создаём форму
  const form = document.createElement("form");
  form.id = "additionalModalForm";

  // Формируем содержимое формы в зависимости от сущности
  let formHTML = "";

  formHTML += addParticipantTemplateElements.addParticipant;

  // Устанавливаем содержимое формы
  form.innerHTML = formHTML;

  // Добавляем заголовок и форму в модальное окно
  modalContent.appendChild(title);
  modalContent.appendChild(form);
}

// Навешиваем обработчики для диалогового окна "Просмотра/редактирования счета"
function retert(mode) {
  const modal = formEvent.modalMain;
  const closeButton = document.querySelector(".closeDialogButton");

  const inputId = document.getElementById("inputId");
  const inputName = document.getElementById("inputName");
  const inputStatus = document.getElementById("modalInputStatus");
  const inputDescription = document.getElementById("modalInputDescription");
  const saveChangeAccountButton = modal.querySelector(".editButton");

  // Общий обработчик для закрытия окна
  closeButton.addEventListener("click", () => {
    closeDialog();
  });

  // Универсальный обработчик кликов для всего модального окна
  document.getElementById("modalForm").addEventListener("click", (event) => {
    const target = event.target;
    if (mode === "create") {
      const createEventButton = modal.querySelector(".createButton");
      createEventButton.removeEventListener("click", handleCreateEvent);
      createEventButton.addEventListener("click", handleCreateEvent);
    } else if (mode === "view") {
      const saveButton = document.querySelector(".viewButton");
      if (target === saveButton) {
        event.stopPropagation();
        event.preventDefault();
      }
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

export async function getMyEventsенг() {
  try {
    const access_token = localStorage.getItem("access_token");

    eventsData = responseData;

    tbody.innerHTML = "";

    responseData.forEach((event) => {
      newRow.addEventListener("click", function () {
        const idEventEdit = event.id;
        const nameEvent = event.name;
        const startEvent = event.start;
        const endEvent = event.end;
        const descriptionEvent = event.description;

        const participants = event.participants.map((participant) => {
          return {
            id: participant.user_id,
            role: participant.role,
          };
        });

        const formatterDateStart = formatDate(startEvent);

        let formatterDateEnd = "";
        if (endEvent) {
          formatterDateEnd = formatDate(endEvent);
        } else {
          formatterDateEnd = "";
        }

        fillModalWithData(
          idEventEdit,
          nameEvent,
          formatterDateStart,
          formatterDateEnd,
          descriptionEvent,
          participants
        );

        fillModaShowlWithData(
          idEventEdit,
          nameEvent,
          formatterDateStart,
          formatterDateEnd,
          descriptionEvent,
          participants
        );
      });

      tbody.appendChild(newRow);
    });

    const iconsShow = document.querySelectorAll(".iconShow1");
    iconsShow.forEach(function (icon) {
      icon.addEventListener("click", function () {
        const inputs = formEvent.modalShowEvent.querySelectorAll(
          "input, textarea, button"
        );

        formEvent.eventShowId.style.background = "#f5f7fa";
        formEvent.inputEventShowName.style.background = "#f5f7fa";
        formEvent.dateStartShowEvent.style.background = "#f5f7fa";
        formEvent.dateEndShowEvent.style.background = "#f5f7fa";
        formEvent.descriptionShowEvent.style.background = "#f5f7fa";
        formEvent.addParticipantShowButton.style.pointerEvents = "none";
        formEvent.addParticipantShowButton.style.backgroundColor = "#409eff";
        formEvent.addParticipantShowButton.style.opacity = "0.5";

        inputs.forEach((input) => {
          if (input.id !== "closeModalEvent") {
            input.disabled = true;
          }
        });
        document.getElementById("closeModalShowEvent").disabled = false;

        var table = document.getElementById("customTableShow");
        var rows = table.querySelectorAll("tr");
        if (rows.length == 1 || rows.length == 2) {
          modalShowEvent.style.height = "761px";
        } else {
          modalShowEvent.style.height = "804px";
        }

        formEvent.modalShowEvent.showModal();
      });
    });

    const iconsEdit = document.querySelectorAll(".iconEdit");
    iconsEdit.forEach(function (icon) {
      icon.addEventListener("click", function (event) {
        const row = icon.closest("tr");

        const idEventEdit = row.querySelector(".iconEdit").dataset.eventId;
        const eventData = eventsData.find((event) => event.id == idEventEdit);

        if (eventData) {
          const { id, name, start, end, description, participants } = eventData;
          const formatterDateStart = formatDate(start);

          fillModalWithData(
            id,
            name,
            formatterDateStart,
            end,
            description,
            participants.map((p) => ({ id: p.user_id, role: p.role }))
          );
        }

        var buttonEdit = formEvent.editModalEventButton;
        buttonEdit.classList.remove("Off");

        buttonEdit.classList.add("disable");
        var buttonCreate = formEvent.createModalEventButton;
        buttonCreate.classList.add("Off");

        formEvent.modalEvent.showModal();
      });
    });
  } catch (error) {
    console.error("Произошла ошибка:", error);
    alert("Произошла ошибка при обращении к серверу.");
  }
}

// Функция для закрытия диалоговых окон
export function closeDialog() {
  // Получаем переменные из объекта formEvent
  const modalMain = formEvent.modalMain;
  const modalMinor = formEvent.modalMinor;
  const additionalModal = formEvent.additionalModal;

  // Если дополнительное модальное окно открыто, закрываем его и открываем основное
  if (additionalModal && additionalModal.style.display === "flex") {
    additionalModal.style.display = "none";
    if (modalMain) {
      modalMain.setAttribute("open", "false"); // Закрываем основное окно
    }
  } else if (modalMain && modalMain.hasAttribute("open")) {
    modalMain.removeAttribute("open"); // Удаляем атрибут open, чтобы закрыть диалог
  }
}

// Функция для управления диалогового окна "Создание счета"
export function handleOpenModalCreate(event) {
  const entity = event.target.dataset.entity;
  const mode = event.target.dataset.mode;
  fillMainDialogWithHTML(mode);
  openDialog();
  addEventListeners(mode);
}

// Функция для открытия диалогового окна "Создание счета"
function openDialog() {
  const modalMain = formEvent.modalMain;
  modalMain.setAttribute("open", "true");
}

// Функция для проверки заполненности обязательных параметров
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

let eventData = [];

function fillModaShowlWithData(
  id,
  name,
  start,
  end,
  description,
  participants
) {
  formEvent.eventShowId.value = id;
  formEvent.inputEventShowName.value = name;
  formEvent.dateStartShowEvent.value = start;
  formEvent.dateEndShowEvent.value = end;
  formEvent.descriptionShowEvent.value = description;

  const tableBody = document.querySelector(
    "#modalShowEvent .tableContainer tbody"
  );

  tableBody.innerHTML = ""; // Очищаем таблицу перед добавлением новых участников

  participants.forEach((participant) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${participant.id}</td>
      <td>${participant.role}</td>
    `;
    tableBody.appendChild(newRow);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

let eventsData = [];

function fillModalWithData(id, name, start, end, description, participants) {
  formEvent.idEventInput.value = id;
  formEvent.nameEventInput.value = name;
  formEvent.dateStartEventInput.value = start;
  formEvent.dateEndEventInput.value = end;
  formEvent.descriptionEvent.value = description;

  eventData = (id, name, start, end, description, participants);

  const tableBody = document.querySelector(".tableContainer tbody");
  tableBody.innerHTML = "";

  participants.forEach((participant) => {
    const newRow = document.createElement("tr");
    newRow.dataset.userId = participant.id;
    newRow.dataset.role = participant.role;
    newRow.innerHTML = `
        <td data-user-id="${participant.id}">${participant.id}</td>
        <td data-role="${participant.role}">${participant.role}</td>
      `;

    tableBody.appendChild(newRow);
  });
  saveOriginalValues(id, name, start, end, description, participants);

  checkForChanges();
}

let originalEventData = {};

// Функция для сохранения исходных значений
function saveOriginalValues(id, name, start, end, description, participants) {
  originalEventData = {
    id,
    name,
    start,
    end,
    description,
    participants: participants.map((p) => ({ id: p.id, role: p.role })),
  };
}

// Функция для проверки изменений
export function checkForChanges() {
  const name = formEvent.nameEventInput.value;
  const start = formEvent.dateStartEventInput.value;
  const end = formEvent.dateEndEventInput.value || null;

  const description = formEvent.descriptionEvent.value;

  const table = document.querySelector("#modalEvent .customTable");
  const rows = table.querySelectorAll("tbody tr");

  const participants = Array.from(
    document.querySelectorAll("#modalEvent .customTable tbody tr")
  ).map((row) => {
    return {
      id: row.dataset.userId,
      role: row.dataset.role,
    };
  });

  const hasChanged =
    originalEventData.name !== name ||
    originalEventData.start !== start ||
    originalEventData.end !== end ||
    originalEventData.description !== description ||
    originalEventData.participants.length !== participants.length;

  const buttonEdit = formEvent.editModalEventButton;
  const nameEventInput = formEvent.nameEventInput.value;
  const dateStartEventInput = formEvent.dateStartEventInput.value;
  if (hasChanged) {
    if (nameEventInput && dateStartEventInput) {
      buttonEdit.classList.remove("disable");
    } else {
      buttonEdit.classList.add("disable");
    }
  } else {
    buttonEdit.classList.add("disable");
  }
}

export async function getMyInvitation() {
  try {
    const access_token = localStorage.getItem("access_token");
    const responseData = await getMyInvitationApi(access_token);
    const tbody = document.querySelector("#Invitations tbody");
    tbody.innerHTML = "";

    const user_id = parseInt(localStorage.getItem("user_id"), 10);
    let participantType;

    responseData.forEach((event) => {
      const participantWithId2 = event.participants.find(
        (participant) => participant.user_id === user_id
      );
      if (participantWithId2) {
        const roleOfParticipantWithId2 = participantWithId2.role;
        if (roleOfParticipantWithId2 === "Partner") {
          participantType = "Партнер";
        } else {
          participantType = "Контролер";
        }
      } else {
      }
    });

    responseData.forEach((event) => {
      const startDate = new Date(event.start);
      const startday = ("0" + startDate.getDate()).slice(-2);
      const startmonth = ("0" + (startDate.getMonth() + 1)).slice(-2);
      const startyear = startDate.getFullYear();
      const starthours = ("0" + startDate.getHours()).slice(-2);
      const startminutes = ("0" + startDate.getMinutes()).slice(-2);
      const startseconds = ("0" + startDate.getSeconds()).slice(-2);
      const formattedStartDate = `${startday}.${startmonth}.${startyear}`;

      let formattedEndDate = "";
      if (event.end) {
        const endDate = new Date(event.end);
        const endtday = ("0" + endDate.getDate()).slice(-2);
        const endmonth = ("0" + (endDate.getMonth() + 1)).slice(-2);
        const endyear = endDate.getFullYear();
        const endhours = ("0" + endDate.getHours()).slice(-2);
        const endminutes = ("0" + endDate.getMinutes()).slice(-2);
        const endseconds = ("0" + endDate.getSeconds()).slice(-2);
        formattedEndDate = `${endtday}.${endmonth}.${endyear} `;
      } else {
        formattedEndDate = "";
      }

      const participantsCount = event.participants.length;

      const newRow = document.createElement("tr");

      newRow.innerHTML = `
              <td>${event.name}</td>
              <td>${formattedStartDate}</td>
              <td>${formattedEndDate}</td>
              <td>${participantsCount}</td>
              <td>${participantType}</td>
              <td> 
                  <img src="../../src/modules/events/asserts/show-regular-60.png" alt="Иконка" class="iconShow2" data-event-id="${event.id}"> 
                  <img src="../../src/modules/events/asserts/check-circle-solid-60.png" alt="Иконка" class="iconConfirm" data-event-id="${event.id}"> 
                  <img src="../../src/modules/events/asserts/x-circle-solid-60.png" alt="Иконка" class="iconReject" data-event-id="${event.id}">
              </td>`;

      newRow.addEventListener("click", function () {
        const idEventEdit = event.id;
        const nameEvent = event.name;
        const startEvent = event.start;
        const endEvent = event.end;
        const descriptionEvent = event.description;

        const participants = event.participants.map((participant) => {
          return {
            id: participant.user_id,
            role: participant.role,
          };
        });
        const formatterDateStart = formatDate(startEvent);

        fillModaShowlWithData(
          idEventEdit,
          nameEvent,
          formatterDateStart,
          endEvent,
          descriptionEvent,
          participants
        );
      });
      tbody.appendChild(newRow);
    });

    const iconsShow = document.querySelectorAll(".iconShow2");
    iconsShow.forEach(function (icon) {
      icon.addEventListener("click", function () {
        const inputs = formEvent.modalShowEvent.querySelectorAll(
          "input, textarea, button"
        );

        formEvent.eventShowId.style.background = "#f5f7fa";
        formEvent.inputEventShowName.style.background = "#f5f7fa";
        formEvent.dateStartShowEvent.style.background = "#f5f7fa";
        formEvent.dateEndShowEvent.style.background = "#f5f7fa";
        formEvent.descriptionShowEvent.style.background = "#f5f7fa";
        formEvent.addParticipantShowButton.style.pointerEvents = "none";
        formEvent.addParticipantShowButton.style.backgroundColor = "#409eff";
        formEvent.addParticipantShowButton.style.opacity = "0.5";

        inputs.forEach((input) => {
          if (input.id !== "closeModalEvent") {
            input.disabled = true;
          }
        });
        document.getElementById("closeModalShowEvent").disabled = false;
        var table = document.getElementById("customTableShow");
        var rows = table.querySelectorAll("tr");
        if (rows.length == 1 || rows.length == 2) {
          modalShowEvent.style.height = "761px";
        } else {
          modalShowEvent.style.height = "804px";
        }
        formEvent.modalShowEvent.showModal();
      });
    });

    const iconsConfirm = document.querySelectorAll(".iconConfirm");
    iconsConfirm.forEach(function (icon) {
      icon.addEventListener("click", async function () {
        const eventId = icon.getAttribute("data-event-id");

        try {
          const access_token = localStorage.getItem("access_token");

          const response = await eventConfirmApi(eventId, access_token);

          setTimeout(getMyEvents, 1000);

          setTimeout(getMyEvents, 1000);
        } catch (error) {
          console.error("Произошла ошибка при подтверждении события:", error);
          alert("Произошла ошибка при подтверждении события.");
        }
      });
    });

    const iconsReject = document.querySelectorAll(".iconReject");
    iconsReject.forEach(function (icon) {
      icon.addEventListener("click", async function () {
        const eventId = icon.getAttribute("data-event-id");

        const access_token = localStorage.getItem("access_token");
        try {
          const response = await eventRejectApi(eventId, access_token);
        } catch (error) {
          console.error("Произошла ошибка при отклонении события:", error);
          alert("Произошла ошибка при отклонении события.");
        }
      });
    });
  } catch (error) {
    console.error("Произошла ошибка:", error);
    alert("Произошла ошибка при обращении к серверу.");
  }
}

export async function getForeignInvitation() {
  try {
    const access_token = localStorage.getItem("access_token");
    const responseData = await getForeignInvitationApi(access_token);

    const tbody = document.querySelector("#hisEventsTable tbody");

    tbody.innerHTML = "";

    const user_id = parseInt(localStorage.getItem("user_id"), 10);
    let participantType;

    responseData.forEach((event) => {
      const participantWithId2 = event.participants.find(
        (participant) => participant.user_id === user_id
      );
      if (participantWithId2) {
        const roleOfParticipantWithId2 = participantWithId2.role;

        if (roleOfParticipantWithId2 === "Partner") {
          participantType = "Партнер";
        } else {
          participantType = "Контролер";
        }
      } else {
      }
    });

    responseData.forEach((event) => {
      const startDate = new Date(event.start);
      const startday = ("0" + startDate.getDate()).slice(-2);
      const startmonth = ("0" + (startDate.getMonth() + 1)).slice(-2);
      const startyear = startDate.getFullYear();
      const starthours = ("0" + startDate.getHours()).slice(-2);
      const startminutes = ("0" + startDate.getMinutes()).slice(-2);
      const startseconds = ("0" + startDate.getSeconds()).slice(-2);
      const formattedStartDate = `${startday}.${startmonth}.${startyear}`;

      let formattedEndDate = "";
      if (event.end) {
        const endDate = new Date(event.end);
        const endtday = ("0" + endDate.getDate()).slice(-2);
        const endmonth = ("0" + (endDate.getMonth() + 1)).slice(-2);
        const endyear = endDate.getFullYear();
        const endhours = ("0" + endDate.getHours()).slice(-2);
        const endminutes = ("0" + endDate.getMinutes()).slice(-2);
        const endseconds = ("0" + endDate.getSeconds()).slice(-2);
        formattedEndDate = `${endtday}.${endmonth}.${endyear} `;
      } else {
        formattedEndDate = "";
      }

      const participantsCount = event.participants.length;

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
              <td>${event.name}</td>
              <td>${formattedStartDate}</td>
              <td>${formattedEndDate}</td>
              <td>${participantsCount}</td>
              <td>${participantType}</td>
              <td> <img src="../../src/modules/events/asserts/show-regular-60.png" alt="Иконка" class="iconShow3" > </td>         
              `;

      newRow.addEventListener("click", function () {
        const idEventEdit = event.id;
        const nameEvent = event.name;
        const startEvent = event.start;
        const endEvent = event.end;
        const descriptionEvent = event.description;

        const participants = event.participants.map((participant) => {
          return {
            id: participant.user_id,
            role: participant.role,
          };
        });

        const formatterDateStart = formatDate(startEvent);

        fillModalWithData(
          idEventEdit,
          nameEvent,
          formatterDateStart,
          endEvent,
          descriptionEvent,
          participants
        );

        fillModaShowlWithData(
          idEventEdit,
          nameEvent,
          formatterDateStart,
          endEvent,
          descriptionEvent,
          participants
        );
      });

      tbody.appendChild(newRow);
    });

    const iconsShow = document.querySelectorAll(".iconShow3");
    iconsShow.forEach(function (icon) {
      icon.addEventListener("click", function () {
        const inputs = formEvent.modalShowEvent.querySelectorAll(
          "input, textarea, button"
        );

        formEvent.eventShowId.style.background = "#f5f7fa";
        formEvent.inputEventShowName.style.background = "#f5f7fa";
        formEvent.dateStartShowEvent.style.background = "#f5f7fa";
        formEvent.dateEndShowEvent.style.background = "#f5f7fa";
        formEvent.descriptionShowEvent.style.background = "#f5f7fa";
        formEvent.addParticipantShowButton.style.pointerEvents = "none";
        formEvent.addParticipantShowButton.style.backgroundColor = "#409eff";
        formEvent.addParticipantShowButton.style.opacity = "0.5";

        inputs.forEach((input) => {
          if (input.id !== "closeModalEvent") {
            input.disabled = true;
          }
        });

        var table = document.getElementById("customTableShow");
        var rows = table.querySelectorAll("tr");
        console.log("Я", rows);
        var rows = table.querySelectorAll("tr");
        if (rows.length == 1 || rows.length == 2) {
          modalShowEvent.style.height = "760px";
        } else {
          modalShowEvent.style.height = "804px";
        }
        document.getElementById("closeModalShowEvent").disabled = false;
        formEvent.modalShowEvent.showModal();
      });
    });
  } catch (error) {
    console.error("Произошла ошибка:", error);
    alert("Произошла ошибка при обращении к серверу.");
  }
}

export function showModalEvent() {
  const tableBody = document.querySelector(".tableContainer tbody");
  const user_id = parseInt(localStorage.getItem("user_id"), 10);
  const newRow = document.createElement("tr");
  newRow.dataset.userId = user_id;
  newRow.dataset.role = "Manager";
  newRow.innerHTML = `
      <td data-user-id="${user_id}">${user_id}</td>
      <td data-role="Manager">Manager</td>
    `;
  tableBody.appendChild(newRow);
  var buttonEdit = formEvent.editModalEventButton;
  buttonEdit.classList.add("Off");
  var buttonCreate = formEvent.createModalEventButton;
  buttonCreate.classList.remove("Off");
  formEvent.modalEvent.showModal();
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
  this.setAttribute("placeholder", "Введите описание мероприятия");
}

export function handleClickModelEvent() {
  clearModalData();

  const participants = Array.from(
    document.querySelectorAll(".tableContainer tbody tr")
  ).map((row) => {
    return {
      id: row.dataset.userId,
      role: row.dataset.role,
    };
  });

  const hasChanged =
    originalEventData.name !== name ||
    originalEventData.start !== start ||
    originalEventData.end !== end ||
    originalEventData.description !== description ||
    originalEventData.participants.length !== participants.length;

  formEvent.modalEvent.close();
}

export function handleClickModelShowEvent() {
  clearModalData();
  formEvent.modalShowEvent.close();
}

export function showModalParticipant() {
  formEvent.modalEvent.close();
  formEvent.modalParticipant.showModal();
}

export function handleClickModelParticipant() {
  var table = document.querySelector(".customTable");
  var rows = table.querySelectorAll("tr");
  var modalEvent = document.getElementById("modalEvent");
  // if (rows.length == 3) {
  //   modalEvent.style.height = "804px";
  // } else {

  // }

  formEvent.modalParticipant.close();
  formEvent.modalEvent.showModal();
}

export function checkCreateParticipantForm() {
  const userId = formEvent.idUserInput.value;
  const checkedRadioButton = document.querySelector(".custom-radio:checked");
  const typeParticipant = checkedRadioButton ? checkedRadioButton.value : null;
  if (userId && typeParticipant !== null) {
    formEvent.createParticipantButton.classList.remove("disable");
  } else {
    formEvent.createParticipantButton.classList.add("disable");
  }
}

export function validationUserId(e) {
  let input = e.target,
    inputUserValue = getInputSumValue(input),
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

export function checkEventForm() {
  const nameEventInput = formEvent.nameEventInput.value;
  const dateStartEventInput = formEvent.dateStartEventInput.value;
  if (nameEventInput && dateStartEventInput) {
    formEvent.createModalEventButton.classList.remove("disable");
  } else {
    formEvent.createModalEventButton.classList.add("disable");
  }
}

export async function editEvent() {
  formEvent.editModalEventButton.classList.add("disable");

  const accessToken = localStorage.getItem("access_token");
  const eventId = formEvent.idEventInput.value;
  const nameEventInput = formEvent.nameEventInput.value;
  const dateStartEventInput = formEvent.dateStartEventInput.value;
  const dateEndEventInput = formEvent.dateEndEventInput.value || null;
  const descriptionEvent = formEvent.descriptionEvent.value || null;

  const formatDate = (dateString) => {
    const dateParts = dateString.split("-");
    if (dateParts.length !== 3) {
      throw new Error("Неверный формат даты");
    }
    const year = dateParts[0];
    const month = dateParts[1].padStart(2, "0");
    const day = dateParts[2].padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const formatEndDate = (dateString) => {
    const dateParts = dateString.split("-");
    if (dateParts.length !== 3) {
      throw new Error("Неверный формат даты");
    }
    const year = dateParts[0];
    const month = dateParts[1].padStart(2, "0");
    const day = dateParts[2].padStart(2, "0");
    return `${year}-${month}-${day}T23:59:59.999Z`;
  };

  const formattedStartDate = formatDate(dateStartEventInput);
  let formattedEndDate = "";
  if (dateEndEventInput) {
    formattedEndDate = formatEndDate(dateEndEventInput);
  }

  try {
    const response = await updateEventApi(
      eventId,
      nameEventInput,
      formattedStartDate,
      formattedEndDate,
      descriptionEvent,
      accessToken
    );

    setTimeout(getMyEvents, 1000);

    setTimeout(handleClickModelEvent, 1000);

    const successMessage = `Мероприятие измененно`;

    const participants = Array.from(
      document.querySelectorAll("#modalEvent .customTable tbody tr")
    ).map((row) => {
      return {
        id: row.dataset.userId,
        role: row.dataset.role,
      };
    });

    createToast("success", successMessage);

    if (originalEventData.participants.length !== participants.length) {
      const table = document.querySelector("#modalEvent .customTable");
      const rows = table.querySelectorAll("tbody tr");

      rows.forEach((row, index) => {
        const userId = parseInt(row.getAttribute("data-user-id"));
        const role = row.getAttribute("data-role");

        // Проверка, есть ли участник в originalEventData.participants
        const participantExists = originalEventData.participants.some(
          (participant) => participant.id === userId
        );

        if (!participantExists) {
          setTimeout(() => {
            createParticipantApi(eventId, userId, role, accessToken)
              .then((response) => {})
              .catch((error) => {
                console.error("Ошибка при добавлении участника:", error);
              });
          }, index * 2000);
        }
      });
    } else {
    }

    // Добавляем вызов API метода createParticipantApi для каждой строки таблицы
  } catch (error) {
    setTimeout(() => {
      formEvent.createModalEventButton.classList.remove("disable");
    }, 10000);
  }
}

export function clearModalData() {
  formEvent.idEventInput.value = "";
  formEvent.nameEventInput.value = "";
  formEvent.dateStartEventInput.value = "";
  formEvent.dateEndEventInput.value = "";
  formEvent.descriptionEvent.value = "";
  const tbody = document.querySelector(".customTable tbody");
  tbody.innerHTML = "";

  const tbodyedit = document.querySelector("#modalEvent .customTable tbody");
  tbodyedit.innerHTML = "";
}
