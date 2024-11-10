import {
  checkAndUpdateToken,
  redirectToAuth,
  sidebar,
  exit,
  showModalCount,
  getAllMyAccounts,
  handleClickTra,
  checkForChanges,
  updateAccount,
  checkCreateForm,
  createAccount,
  showModalAddUser,
  addUser,
  closeModalAddUser,
  validateAndCleanInput,
  checkCreateAddUserForm,
  addUserAccount,
  handleClick,
  deleteTransactions,
} from "./utils.js";
import { formCounts } from "./constants.js";
import { createToast } from "../notifications/index.js";

document.addEventListener("DOMContentLoaded", function (e) {
  checkAndUpdateToken();
  redirectToAuth();

  getAllMyAccounts();
  const userId = localStorage.getItem("user_id");

  formCounts.userIdElement.textContent = userId;
  console.log(formCounts.userIdElement.textContent);

  // Обработчик для сайдбара
  sidebar();

  formCounts.openModalCreateAccountButton.addEventListener(
    "click",
    showModalCount
  );
  formCounts.modalEditCloseButtonAccount.addEventListener(
    "click",
    handleClickTra
  );

  formCounts.modalCreateCloseButtonAccount.addEventListener(
    "click",
    handleClickTra
  );

  //  обработчик события нажатия на кнопку "выход"
  formCounts.exit.addEventListener("click", exit);

  document
    .querySelectorAll(
      "#modalEditFormAccount input, #modalEditFormAccount textarea"
    )
    .forEach((input) => {
      input.addEventListener("input", checkForChanges);
    });

  formCounts.modalEditButtonAccount.addEventListener("click", updateAccount);

  formCounts.modalCreateInputNameAccount.addEventListener(
    "input",
    checkCreateForm
  );

  formCounts.modalCreateCreateButtonAccount.addEventListener(
    "click",
    createAccount
  );
});

const MIN_PRELOADER_DURATION = 1000; // Минимальная продолжительность в миллисекундах (1 секунда)

function hidePreloader() {
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

// Скрытие прелоадера после полной загрузки страницы
window.addEventListener("load", () => {
  hidePreloader();

  formCounts.modalEditAddUserFormAccount.addEventListener(
    "click",
    showModalAddUser
  );

  formCounts.modalAddUserButton.addEventListener("click", addUser);

  formCounts.modalAddUserCloseButton.addEventListener(
    "click",
    closeModalAddUser
  );

  formCounts.modalAddUserInputIdUser.addEventListener("input", () => {
    const input = document.getElementById("idUser");
    input.value = validateAndCleanInput(input.value);
  });

  formCounts.modalAddUserInputIdUser.addEventListener(
    "input",
    checkCreateAddUserForm
  );

  // Добавляем обработчик события click
  formCounts.modalAddUserButton.addEventListener("click", addUserAccount);

  formCounts.cancel.addEventListener("click", handleClick);

  formCounts.aprove_delete.addEventListener("click", deleteTransactions);
});
