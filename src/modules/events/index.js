import {
  getMyEvents,
  getMyInvitation,
  getForeignInvitation,
  handleOpenModalCreate,
  closeDialog,
  checkRequiredFields,
  showModalEvent,
  changeStyleBorder,
  customTextArea,
  handleClickModelEvent,
  showModalParticipant,
  handleClickModelParticipant,
  checkCreateParticipantForm,
  checkEventForm,
  handleClickModelShowEvent,
  checkForChanges,
  editEvent,
} from "./utils.js";

import { createToast } from "../notifications/index.js";
import { formEvent } from "./constants.js";

import {
  redirectToAuth,
  checkAndUpdateToken,
  displayUsername,
  handleTooltipMouseEnter,
  handleTooltipMouseLeave,
  handleNavClick,
  hidePreloader,
} from "../other_functions/shared_functions.js";

document.addEventListener("DOMContentLoaded", function () {
  // Предварительная загрузка данных
  checkAndUpdateToken();
  redirectToAuth();
  displayUsername();
  getMyEvents();
  getMyInvitation();
  getForeignInvitation();

  // Обработчики для отображению тултипов
  document.addEventListener("mouseenter", handleTooltipMouseEnter, true);
  document.addEventListener("mouseleave", handleTooltipMouseLeave, true);

  // Обработчики для переходов по страницам на sidebar
  document
    .querySelectorAll(".menu-links .nav-link, .nav-link[data-tooltip='Выход']")
    .forEach((link) => {
      link.addEventListener("click", handleNavClick);
    });

  // Обработчик для нажатия на кнопку открыть модальное окно
  formEvent.buttonsOpenModal.addEventListener("click", handleOpenModalCreate);

  // Обработчик для нажатия на кнопку Escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDialog();
    }
  });

  hidePreloader();

  // Обработка для проверки заполненности обязательных полей
  document.body.addEventListener("input", (event) => {
    const target = event.target;

    // Проверяем, что целевой элемент является обязательным полем
    if (target.classList.contains("requiredField")) {
      checkRequiredFields("modalForm"); // Проверяем обязательные поля в форме
    }
  });

  // setTimeout(getForeignInvitation, 100);

  // formEvent.createEventButton.addEventListener("click", showModalEvent);

  //  обработчик события при фокусировке на элементе
  // formEvent.descriptionEvent.addEventListener("focus", changeStyleBorder);

  //  обработчик события при потере фокуса элементом
  // formEvent.descriptionEvent.addEventListener("blur", customTextArea);

  // formEvent.closeEventFormButton.addEventListener(
  //   "click",
  //   handleClickModelEvent
  // );

  // formEvent.addParticipantButton.addEventListener(
  //   "click",
  //   showModalParticipant
  // );

  // formEvent.closeModalParticipantButton.addEventListener(
  //   "click",
  //   handleClickModelParticipant
  // );

  // formEvent.idUserInput.addEventListener("input", checkCreateParticipantForm);
  // const radioButtons = document.querySelectorAll(
  //   "input[name='typeParticipant']"
  // );
  // radioButtons.forEach((button) => {
  //   button.addEventListener("change", checkCreateParticipantForm);
  // });

  // const idUserInput = document.getElementById("idUser");

  // idUserInput.addEventListener("input", function (event) {
  //   const input = event.target;
  //   input.value = input.value.replace(/\s/g, ""); // Удаляем все пробелы из введенного текста
  // });

  // // Добавляем обработчик события click
  // createParticipantButton.addEventListener("click", function () {
  //   // Получаем данные из модального окна

  //   const userId = document.getElementById("idUser").value;
  //   const role = document.querySelector(
  //     'input[name="typeParticipant"]:checked'
  //   ).value;

  //   // Проверяем, чтобы user_id не повторялся в таблице
  //   const tableBody = document.querySelector(".tableContainer tbody");

  //   const existingUser = tableBody.querySelector(
  //     `tr[data-user-id="${userId}"]`
  //   );

  //   if (existingUser) {
  //     const errorMessage = `Пользователь с таким ID уже добавлен в мероприятие`;
  //     createToast("error", errorMessage);
  //     return;
  //   }

  //   // Создаем новую строку в таблице
  //   const newRow = document.createElement("tr");

  //   let roleRu;
  //   if (role === "Partner") {
  //     roleRu = "Партнер";
  //   } else {
  //     roleRu = "Контролёр";
  //   }
  //   newRow.dataset.userId = userId;
  //   newRow.dataset.role = role;
  //   newRow.innerHTML = `
  //   <td data-user-id="${userId}">${userId}</td>
  //   <td data-role="${role}">${roleRu}</td>
  //   `;
  //   tableBody.appendChild(newRow);

  //   // Очищаем поле ввода ID пользователя (если нужно)
  //   document.getElementById("idUser").value = "";

  //   checkForChanges();
  //   handleClickModelParticipant();
  //   const successMessage = `Пользователь добавлен в мероприятие`;
  //   createToast("success", successMessage);
  //   // Сбрасываем поля в модальном окне (если нужно)
  //   document.getElementById("idUser").value = "";
  //   document.querySelector(
  //     'input[name="typeParticipant"]:checked'
  //   ).checked = false;
  // });

  // formEvent.nameEventInput.addEventListener("input", checkEventForm);
  // formEvent.dateStartEventInput.addEventListener("input", checkEventForm);

  // formEvent.closeModalShowEvent.addEventListener(
  //   "click",
  //   handleClickModelShowEvent
  // );

  // formEvent.closeEventFormButton.addEventListener(
  //   "click",
  //   handleClickModelEvent
  // );

  // document
  //   .querySelectorAll("#modalEvent input, #modalEvent textarea")
  //   .forEach((input) => {
  //     input.addEventListener("input", checkForChanges);
  //   });

  // formEvent.editModalEventButton.addEventListener("click", editEvent);
});
