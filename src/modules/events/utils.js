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

export function sidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.addEventListener("mouseenter", function () {
    this.classList.remove("close");
  });

  sidebar.addEventListener("mouseleave", function () {
    this.classList.add("close");
  });
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

export async function getMyEvents() {
  try {
    const access_token = localStorage.getItem("access_token");
    const responseData = await getMyEventsApi(access_token);
    eventsData = responseData;
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
                    <img src="../../src/modules/events/asserts/show-regular-60.png" alt="Иконка" class="iconShow1" > 
                    <img src="../../src/modules/transactions/asserts/pencil-solid-60.png" alt="Иконка" class="iconEdit" data-event-id="${event.id}">
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

export async function createEvent() {
  let buttonClicked = false;
  formEvent.createModalEventButton.classList.add("disable");
  buttonClicked = true;

  const accessToken = localStorage.getItem("access_token");
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
    return `${year}-${month}-${day}`;
  };

  const formattedStartDate = `${formatDate(dateStartEventInput)}T00:00:00.000Z`;
  const formattedEndDate = dateEndEventInput
    ? `${formatDate(dateEndEventInput)}T23:59:59.999Z`
    : null;

  try {
    const response = await createEventApi(
      nameEventInput,
      formattedStartDate,
      formattedEndDate,
      descriptionEvent,
      accessToken
    );

    setTimeout(getMyEvents, 1000);

    setTimeout(handleClickModelEvent, 1000);

    const successMessage = `Мероприятие создано`;
    createToast("success", successMessage);

    // Добавляем вызов API метода createParticipantApi для каждой строки таблицы
    const table = document.querySelector("#modalEvent .customTable");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row, index) => {
      setTimeout(() => {
        const eventId = response.id;
        const userId = row.getAttribute("data-user-id");
        const role = row.getAttribute("data-role");

        createParticipantApi(eventId, userId, role, accessToken)
          .then((response) => {})
          .catch((error) => {
            console.error("Ошибка при добавлении участника:", error);
          });
      }, index * 1000); // Задержка в миллисекундах, увеличиваемая на 1 секунду с каждой итерацией
    });
  } catch (error) {
    setTimeout(() => {
      formEvent.createModalEventButton.classList.remove("disable");
      buttonClicked = false;
    }, 10000);
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

export function redirectToAuth() {
  const access_token = localStorage.getItem("access_token");
  if (!access_token) {
    window.location.href = "../auth/index.html";
  }
}

export function exit() {
  localStorage.clear();
  window.location.href = "/pages/auth/index.html";
}

const MIN_PRELOADER_DURATION = 1000; // Минимальная продолжительность в миллисекундах (1 секунда)
export function hidePreloader() {
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
