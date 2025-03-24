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
import { eventsTemplateElements, addParticipantTemplateElements  } from "./templates.js";

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
// Функция для заполнения данных в таблице
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
// Функция для навешивания обработчиков на иконку Редактирование мероприятия
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
      handleOpenMainModal('event', "edit", measure);
    });
  });
}
// Функция для навешивания обработчиков на иконку Просмотра мероприятия
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
      handleOpenMainModal("event", "view", measure);
    });
  });
}
function removeAllModals() {
  // Получаем все элементы с классом .modal
  const existingModals = document.querySelectorAll(".modal");
  
  // Удаляем все найденные модальные окна
  existingModals.forEach(modal => {
    modal.remove();
  });
}

// Общая функция для управления диалогового окна "Просмотр/редактирование счета"
// export function handleOpenMainModal(entity, mode, data) {
//   // Добавляем в диалог HTML
//   removeAllModals();

//   // Создаем новое модальное окно
//   const modal = document.createElement("div");
//   modal.id = `modal_${entity}_${mode}`;
//   modal.classList.add("modal");

//   fillDialogWithHTML(entity, mode);
  
//    // Если measure передан, заполняем форму данными
//   if (data) {
//     fillDialogFields(entity, mode, data);
//   }

//    // Добавляем класс disabled ко всем элементам для режима veiw и убираем placeholders
//   if (mode === "view") {
//     disableModalInputs();
//   }

//   // Устанавливаем на диалоговое окно обработчики
//    addEventListeners(entity, mode);

//   // Отображаем диалоговое окно
//   openDialog(entity);

// }

// // Единая функция, которая вставляет в диалоговое окно HTML
// function fillDialogWithHTML(entity, mode) {
//   const modalContent = entity === "event" ? formEvent.modalMainContent : formEvent.modalMinorContent;
  
//   // Очищаем текущее содержимое
//   modalContent.innerHTML = "";

//   // Создаём заголовок
//   const title = document.createElement("h2");
//   title.id = entity === "event" ? "modalMainTitle" : "modalMinorTitle";

//   // Устанавливаем текст заголовка в зависимости от режима и сущности
//   if (entity === "event") {
//     if (mode === "create") {
//       title.textContent = "Создание мероприятия";
//     } else if (mode === "edit") {
//       title.textContent = "Редактирование мероприятия";
//     } else if (mode === "view") {
//       title.textContent = "Просмотр мероприятия";
//     } else {
//       title.textContent = "Неизвестный режим";
//     }
//   } else if (entity === "participant") {
//     if (mode === "create") {
//       title.textContent = "Добавление участника";
//     } else if (mode === "edit") {
//       title.textContent = "Изменение роли";
//     } else {
//       title.textContent = "Неизвестный режим";
//     }
//   }

//   // Создаём форму
//   const form = document.createElement("form");
//   form.id = "modalForm";

//   // Формируем содержимое формы в зависимости от сущности и режима
//   let formHTML = "";
//   if (entity === "event") {
//     if (mode === "create") {
//       formHTML += eventsTemplateElements.name;
//       formHTML += eventsTemplateElements.period;
//       formHTML += eventsTemplateElements.description;
//       formHTML += eventsTemplateElements.buttons.create;
//     } else if (mode === "edit") {
//       formHTML += eventsTemplateElements.id;
//       formHTML += eventsTemplateElements.name;
//       formHTML += eventsTemplateElements.period;
//       formHTML += eventsTemplateElements.description;
//       formHTML += eventsTemplateElements.participant;
//       formHTML += eventsTemplateElements.addParticipantButton;
//       formHTML += eventsTemplateElements.buttons.edit;
//     } else if (mode === "view") {
//       formHTML += eventsTemplateElements.id;
//       formHTML += eventsTemplateElements.name;
//       formHTML += eventsTemplateElements.period;
//       formHTML += eventsTemplateElements.description;
//       formHTML += eventsTemplateElements.participant;
//       formHTML += eventsTemplateElements.buttons.view;
//     }
//   } else if (entity === "participant") {
//     if (mode === "create" || mode === "edit") {
//       formHTML += addParticipantTemplateElements.addParticipant;
  
//       // Если режим edit, добавляем атрибут disabled к input
//       if (mode === "edit") {
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(formHTML, 'text/html');
//         const inputElement = doc.querySelector('#inputIdUser');
//         if (inputElement) {
//           inputElement.setAttribute('disabled', 'disabled');
//         }
//         formHTML = doc.body.innerHTML; // Сохраняем изменения
//       }
//     }
//   }

//   // Устанавливаем содержимое формы
//   form.innerHTML = formHTML;

//   // Добавляем заголовок и форму в модальное окно
//   modalContent.appendChild(title);
//   modalContent.appendChild(form);

//   // Не знаю почему но в поле "Описание" при создании диалогового окна создается 3 пробела. Код ниже удаляет это, если сущность event
//   // if (entity === "event") {
//   //   const textInput = document.getElementById("modalInputDescription");
//   //   const cleanedText = textInput.value.trim();
//   //   textInput.value = cleanedText;
//   // }
// }


// Общая функция для управления диалогового окна "Просмотр/редактирование счета"
export function handleOpenMainModal(entity, mode, data) {
  // Удаляем все предыдущие модальные окна
  removeAllModals();

  // Наполняем модальное окно HTML
  fillDialogWithHTML(entity, mode);

  // Если переданы данные, заполняем форму
  if (data) {
    fillDialogFields(entity, mode, data);
  }

  // Добавляем класс disabled ко всем элементам для режима view и убираем placeholders
  if (mode === "view") {
    disableModalInputs();
  }

  // Устанавливаем обработчики событий
  addEventListeners(entity, mode);


  const modal = document.querySelector(".modal")
  modal.setAttribute("open", "true");
}

// Единая функция, которая вставляет в диалоговое окно HTML
function fillDialogWithHTML(entity, mode) {
  let formHTML = "";

  // Логика для "event" сущности
  if (entity === "event") {
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
      // Убрал пока не поправлю 
      // formHTML += eventsTemplateElements.addParticipantButton;
      formHTML += eventsTemplateElements.buttons.edit;
    } else if (mode === "view") {
      formHTML += eventsTemplateElements.id;
      formHTML += eventsTemplateElements.name;
      formHTML += eventsTemplateElements.period;
      formHTML += eventsTemplateElements.description;
      formHTML += eventsTemplateElements.participant;
      formHTML += eventsTemplateElements.buttons.view;
    }
  } else if (entity === "participant") {
    if (mode === "create" || mode === "edit") {
      formHTML += addParticipantTemplateElements.addParticipant;
    }
  }

  // Создаем основной контейнер для модального окна
  const modal = document.createElement('div');
  modal.id = 'mainModal';
  modal.classList.add('modal', 'modalEvent');


  // Создаем основной контент модального окна
  const modalMainContent = document.createElement('div');
  modalMainContent.classList.add('modalMainContent');

  // Создаем заголовок
  const title = document.createElement('h2');
  title.id = 'modalMainTitle';

  // Логика для изменения текста заголовка в зависимости от entity и mode
  if (entity === "event") {
    if (mode === "create") {
      title.textContent = "Создание мероприятия";
    } else if (mode === "edit") {
      title.textContent = "Редактирование мероприятия";
    } else if (mode === "view") {
      title.textContent = "Просмотр мероприятия";
    } else {
      title.textContent = "Неизвестный режим";
    }
  } else if (entity === "participant") {
    if (mode === "create") {
      title.textContent = "Добавление участника";
    } else if (mode === "edit") {
      title.textContent = "Изменение роли";
    } else {
      title.textContent = "Неизвестный режим";
    }
  }

  // Создаем форму и наполняем её содержимым из formHTML
  const form = document.createElement('form');
  form.id = 'modalForm';
  form.innerHTML = formHTML;

  // Добавляем заголовок и форму в модальное окно
  modalMainContent.appendChild(title);
  modalMainContent.appendChild(form);

  // Добавляем основной контент в модальное окно
  modal.appendChild(modalMainContent);

  // Добавляем модальное окно в DOM
  document.body.appendChild(modal);
}

function fillDialogFields(entity, mode, data) {
  if (!data || typeof data !== "object") {
    console.error("Передан некорректный объект для заполнения диалога.");
    return;
  }

  if (entity === "event") {
    // Уникальный идентификатор
    const inputId = document.getElementById("inputId");
    if (inputId) {
      inputId.value = data.id || "";
    }

    // Наименование мероприятия
    const inputName = document.getElementById("inputName");
    if (inputName) {
      inputName.value = data.name || "";
    }

    // Дата начала
    const dateStart = document.getElementById("dateStartEvent");
    if (dateStart) {
      dateStart.value = data.start ? data.start.split("T")[0] : ""; // Убираем время
    }

    // Дата окончания
    const dateEnd = document.getElementById("dateEndEvent");
    if (dateEnd) {
      dateEnd.value = data.end ? data.end.split("T")[0] : ""; // Убираем время
    }

    // Описание
    const inputDescription = document.getElementById("modalInputDescription");
    if (inputDescription) {
      inputDescription.value = data.description || "";
    }

    // Заполнение таблицы с участниками
    populateTableWithParticipants(mode, data.participants);
  } else if (entity === "participant") {
    // Уникальный идентификатор
    const inputId = document.getElementById("inputIdUser");
    if (inputId) {
      inputId.value = data.user_id || "";
    }

    // Роль
    const roleMap = {
      Manager: "Менеджер",
      Observer: "Контролер",
      Partner: "Партнер",
    };

    const inputRole = document.getElementById("modalInputRole");
    if (inputRole) {
      inputRole.value = roleMap[data.role] || "Роль не указана";
    }
  } else {
    console.error("Неизвестный тип сущности:", entity);
  }
}
function populateTableWithParticipants(mode, participants) {
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
    const user_id = parseInt(localStorage.getItem("user_id"), 10);
    
    if (mode === "view") {
      row.innerHTML = `
      <td>${participant.user_id}</td>
      <td>${participant.user.name || "Без имени"}</td>
     <td>${mappedRole}</td>`;

    }else {
    
    if (participant.user_id === user_id){
      row.innerHTML = `
      <td>${participant.user_id}</td>
      <td>${participant.user.name || "Без имени"}</td>
     <td>${mappedRole}</td>`;
    }else {
      row.innerHTML = `
      <td>${participant.user_id}</td>
      <td>${participant.user.name || "Без имени"}</td>
     <td>${mappedRole}</td>
     <td class="small" ><img src="../../src/modules/transactions/asserts/pencil-solid-60.png" class="iconEdit" data-user-id="${participant.user_id}" data-role="${participant.role}"></td>`;
    }
  }
    tableBody.appendChild(row);
    // Навешиваем обработчик на иконку "Edit"
     //ПОка УБРАЛ НАДО ПОПРАВИТЬ!
    // const editIcon = row.querySelector(".iconEdit");
    // if (editIcon) {
    //   editIcon.addEventListener("click", () => {
    //     const data = {
    //       user_id: editIcon.getAttribute("data-user-id"),
    //       role: editIcon.getAttribute("data-role"),
    //     };
        
    //     handleOpenMainModal("participant", "edit", data);
    //   });
    // }
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
function addEventListeners(entity, mode) {

  if(entity === "event"){
  const modal = document.querySelector(".modal");
  const closeButton = document.querySelector(".closeDialogButton");
  // Обработчик кликов на кнопку Закрытия диалогового окна
  closeButton.addEventListener("click", closeDialog);

  // Обработчик кликов по форме
  document.getElementById("mainModal").addEventListener("click", (event) => {
    // В зависимости от режима выполняем соответствующие действия
    if (mode === "create") {
      console.log(12314)

      handleCreateMode(event, modal);
    } else if (mode === "edit") {
      handleEditMode(event, modal);
      console.log(5555)
    }
  });





  
}else  {
  const dropdown = document.getElementById('modalDropdownRole');
  const isActive = dropdown.classList.contains("active");

  dropdown.addEventListener('click', () => {
    const isActive = dropdown.classList.contains("active");
    toggleDropdownState(dropdown, isActive);
  });



  const closeButton = document.getElementById("closeAdditionalModal");
  // Обработчик кликов на кнопку Закрытия диалогового окна
  closeButton.addEventListener("click", closeDialog);
 
  document.getElementById("minorModal").addEventListener("click", (event) => {
    // В зависимости от режима выполняем соответствующие действия
    if (mode === "create") {
   console.log(1)
    } else if (mode === "edit") {
      // handleEditMode(event, modal);
    }
  });

  
}
}
// Обработчик для режима создания события
function handleCreateMode(event, modal) {
  
   // Обработчик для создания события
    // Универсальный обработчик для проверки заполненности обязательных полей
    modal.addEventListener("input", (event) => {
      const target = event.target;
      if (target.classList.contains("requiredField")) {
        checkRequiredFields(modal.id);
      }
    });
  const createEventButton = modal.querySelector(".createButton");
  createEventButton.addEventListener("click", handleCreateEvent);
}
// Обработчик для создания события
function handleCreateEvent(e) {
  const modal = document.querySelector(".modal");
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
  const modal = document.querySelector(".modal");
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
    handleOpenMainModal("participant", "create");
  }


  modal.addEventListener("input", (event) => {
      checkRequiredEditFields(modal.id);
  });


  const updateEventButton = modal.querySelector(".editButton");
  updateEventButton.addEventListener("click", handleUpdateEvent);
// Если кнопка активна, вызываем функцию создания события
  

}

function handleUpdateEvent(e) {
  const modal = document.querySelector(".modal");
  const updateEventButton = modal.querySelector(".editButton ");

  // Проверка, если кнопка заблокирована
  if (updateEventButton.classList.contains("disable")) {
    e.preventDefault();
    return;
  }

  // Если кнопка активна, вызываем функцию создания события

  updateAccount();
}










async function updateAccount() {
  const accessToken = localStorage.getItem("access_token");
  const id = document.querySelector("#inputId").value.trim();;
  const modal = document.querySelector(".modal");
  const button = document.querySelector(".editButton");
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
    const response = await updateEventApi(
      id,
      name,
      formattedStartDate,
      formattedEndDate,
      description,
      accessToken
    );

    setTimeout(getMyEvents, 1000);
    closeDialog();
    const successMessage = `Мероприятие обновлено`;
    createToast("success", successMessage);
  } catch (error) {
    setTimeout(() => {
      button.classList.remove("disable");
    }, 10000);
  }
}







 
// Функция для управления состоянием "active"
function toggleDropdownState(dropdown, isActive) {
  if (isActive) {
    dropdown.classList.remove("active");
  } else {
    dropdown.classList.add("active");
  }
}



// Функция для закрытия всех диалоговых окон
export function closeDialog() {
  // Получаем все элементы с классом "modal"
  const modals = document.querySelectorAll(".modal");

  // Удаляем атрибут "open" у всех модальных окон
  modals.forEach(modal => {
    modal.removeAttribute("open");
  });
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


// Функция для проверки заполненности обязательных параметров
export function checkRequiredEditFields(formId) {
  const form = document.getElementById(formId);
  const requiredFields = form.querySelectorAll(".requiredField");
  const editButton = form.querySelector(".editButton");

  if (editButton) {
    let allFieldsFilled = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        allFieldsFilled = false;
      }
    });

    if (allFieldsFilled) {
      editButton.classList.remove("disable");
      editButton.disabled = false;
      editButton.removeAttribute("data-tooltip");
    } else {
      editButton.classList.add("disable");
      editButton.disabled = true;
      editButton.setAttribute(
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


