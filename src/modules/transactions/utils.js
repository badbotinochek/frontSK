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
  getReceiptApi,
  getAllMyAccountsApi,
} from "../../utils/api.js";
import { createToast } from "../notifications/index.js";
import { checkDate, isFieldFilled } from "../other_functions/validations.js";

let cachedCategories = null;
let cachedActiveAccounts = null;
const idToNameMap = {};

let countTr = 0;
let countTransac = 0;

export function checkForm() {
  const start_date = formTransactions.start_date
    ? formTransactions.start_date.value
    : "";
  const end_date = formTransactions.end_date
    ? formTransactions.end_date.value
    : "";
  const input_event = formTransactions.input_event
    ? formTransactions.input_event.value
    : "";

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

  if (input_event) {
    formTransactions.create_transaction.classList.remove("disable");
    formTransactions.buttonScanQr.classList.remove("disable");
  } else {
    formTransactions.create_transaction.classList.add("disable");
    formTransactions.buttonScanQr.classList.add("disable");
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
  getCategory();
  formTransactions.modalElementTr.showModal();
}

export async function deleteTransactions() {
  const access_token = localStorage.getItem("access_token");
  const transactionId = localStorage.getItem("transactionId");
  try {
    const response = await deleteTransaction(transactionId, access_token);

    handleClick();
    const successMessage = `Транзакция успешно удалена`;
    createToast("success", successMessage);
    setTimeout(getTransactions, 10);
  } catch (error) {}
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
      let account;

      if (transaction.type === "Income") {
        if (!transaction.target_account) {
          account = "?";
        } else {
          if (!transaction.target_account.name) {
            account = transaction.target_account.id;
          } else {
            account = transaction.target_account.name;
          }
        }
      } else if (transaction.type === "Expense") {
        if (!transaction.source_account) {
          account = "?";
        } else {
          if (!transaction.source_account.name) {
            account = transaction.source_account.id;
          } else {
            account = transaction.source_account.name;
          }
        }
      } else {
        account = "yep";
      }

      const user_id = parseInt(localStorage.getItem("user_id"), 10);
      let user;
      if (transaction.user_id === user_id) {
        user = "Вы";
      } else {
        user = transaction.user.name;
      }

      const newRow = document.createElement("tr");
      const eventRole = localStorage.getItem("eventRole");

      let rowHTML = ``;
      if (type === "Доход") {
        rowHTML = `
          <td>${transaction.number}</td>
          <td>${formattedTime}</td>
          <td>${type}</td>
          <td>${categoryTran}</td>
          <td style="color: green"> +${transaction.amount} руб</td>
          <td>${user}</td>
          <td>${account}</td>
          ${
            receipt_id
              ? `<td class="receipt" data-id="${receipt_id}"><box-icon name='file' type='solid' color='#31bd2c' ></box-icon></td>`
              : `<td class="receipt">${receipt_id}</td>`
          }
        `;
      } else {
        rowHTML = `
          <td>${transaction.number}</td>
          <td>${formattedTime}</td>
          <td>${type}</td>
          <td>${categoryTran}</td>
          <td style="color: red"> -${transaction.amount} руб</td>
          <td>${user}</td>
          <td>${account}</td>
          ${
            receipt_id
              ? `<td class="receipt" data-id="${receipt_id}"><box-icon name='file' type='solid' color='#31bd2c' ></box-icon></td>`
              : `<td class="receipt">${receipt_id}</td>`
          }
        `;
      }

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

      newRow.innerHTML = rowHTML;
      tbody.appendChild(newRow);

      const receiptCells = document.querySelectorAll(".receipt");
      receiptCells.forEach((receiptCell) => {
        if (receiptCell.dataset.id && receiptCell.dataset.id.trim() !== "") {
          // Устанавливаем cursor: pointer, если есть data-id
          receiptCell.style.cursor = "pointer";

          // Добавляем обработчик клика
          receiptCell.addEventListener("click", function () {
            const receipt_id = receiptCell.dataset.id;

            // Если чек существует, показываем модальное окно
            if (receipt_id) {
              clearModalReceipt(); // Очистить данные из модалки (если нужно)
              formTransactions.modalReceiptDetails.showModal(); // Показать модальное окно

              // Загружаем чек с задержкой
              setTimeout(function () {
                getReceipt(receipt_id); // Получаем информацию о чеке
              }, 1000);
            }
          });
        }
      });

      const iconsDelete = document.querySelectorAll(".iconDelete");

      iconsDelete.forEach(function (icon) {
        icon.addEventListener("click", function () {
          const transactionId = icon.getAttribute("data-transaction-id");
          localStorage.setItem("transactionId", transactionId);

          formTransactions.modalElement.showModal();
        });
      });

      newRow.addEventListener("click", function () {
        let account;

        if (transaction.type === "Income") {
          if (!transaction.target_account) {
            account = "?";
          } else {
            if (!transaction.target_account.name) {
              account = transaction.target_account.id;
            } else {
              account = transaction.target_account.name;
            }
          }
        } else if (transaction.type === "Expense") {
          if (!transaction.source_account) {
            account = "?";
          } else {
            if (!transaction.source_account.name) {
              account = transaction.source_account.id;
            } else {
              account = transaction.source_account.name;
            }
          }
        } else {
          account = "yep";
        }
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
          account,
          typeTransaction,
          categoryTransaction,
          amountTransaction,
          descriptionTransaction
        );

        fillModaShowlWithData(
          idTransactionEdit,
          formatterDate,
          formatterTime,
          account,
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
    }

    let countTrTotal = countTrValue + countTr;
    let rowHTML = ``;

    if (countTrTotal > 0) {
      rowHTML = `
      <td data-name="Total"> Итого  </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td style="padding-left: 35px; color: green"> +${countTrTotal} руб </td>
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
        formTransactions.showAccountTransaction.style.background = "#f5f7fa";
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
    alert(error);
  } finally {
    formTransactions.getTransactionButton.classList.remove("disable");
    formTransactions.getTransactionButton.disabled = false;
  }
}

async function getReceipt(receipt_id) {
  const accessToken = localStorage.getItem("access_token");

  try {
    const receipt = await getReceiptApi(accessToken, receipt_id);
    addReceiptToHTML(receipt);
  } catch (error) {}
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

function addReceiptToHTML(receipt) {
  // Получаем контейнер для чека
  const container = document.getElementById("receipt-container");

  // Преобразуем объект чека в HTML
  const receiptHTML = generateReceiptHTML(receipt);

  // Добавляем HTML в контейнер
  container.innerHTML = receiptHTML;
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

let originalValues = {};

function saveOriginalValues() {
  originalValues = {
    date: document.getElementById("dateTr").value,
    time: document.getElementById("timeTr").value,
    account: document.querySelector(".accountBox").value,
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
    account: document.querySelector(".accountBox").value,
    type: document.querySelector('input[name="typeTransaction"]:checked')
      ?.value,
    category: document.querySelector(".categoryBox").value,
    sum: document.getElementById("sumTransaction").value,
    description: document.getElementById("descriptionTran").value,
  };
  console.log(currentValues);
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
  account,
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
  formTransactions.accountBox.value = account;
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
  account,
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
  formTransactions.showAccountTransaction.value = account;
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

      listItem.textContent = eventName;
      listItem.setAttribute("data-id", eventId);
      listItem.setAttribute("data-role", userRole);
      lista.appendChild(listItem);
    });

    // Вызываем функцию foo() после добавления элементов списка
    foo();
  } catch (error) {}
}

const foo = () => {
  const list = document.querySelector(".option");
  const input = document.querySelector(".text-box");

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
  formTransactions.dropdown2.classList.remove("active");
  event.stopPropagation();
}

export function closeDropdown(event) {
  if (!formTransactions.option.contains(event.target)) {
    formTransactions.dropdown.classList.remove("active");
    formTransactions.dropdown2.classList.remove("active");
  }
}

export function toggleDropdownCat(event) {
  formTransactions.dropdownCat.classList.toggle("active");
  formTransactions.dropdown2.classList.remove("active");
  event.stopPropagation();
}

export function closeDropdownTransaction(event) {
  if (!formTransactions.option1.contains(event.target)) {
    formTransactions.dropdown1.classList.remove("active");
  }
}

export function getInputSumValue(input) {
  return input.value.replace(/[^\d.]/g, ""); // Убираем всё, кроме цифр и точки
}

export function onSumInput(e) {
  let input = e.target,
    inputSumValue = getInputSumValue(input),
    formattedInputValue = "";

  if (!inputSumValue) {
    return (input.value = "");
  }

  const dotCount = (inputSumValue.match(/\./g) || []).length; // Считаем количество точек

  if (dotCount > 1) {
    // Если количество точек больше 1, убираем последнюю точку
    inputSumValue = inputSumValue.slice(0, -1);
  }

  // Если есть точка и более двух цифр после неё, обрезаем лишние
  if (inputSumValue.includes(".")) {
    let [wholePart, decimalPart] = inputSumValue.split("."); // Разделяем целую и дробную части
    if (decimalPart.length > 2) {
      decimalPart = decimalPart.slice(0, 2); // Оставляем только первые две цифры после точки
    }
    inputSumValue = `${wholePart}.${decimalPart}`; // Объединяем обратно
  }

  if (dotCount === 0 && inputSumValue === "0") {
    // Если введен 0 в начале и нет точки, добавляем 0.
    formattedInputValue = "0.";
  } else {
    formattedInputValue = inputSumValue;
  }

  input.value = formattedInputValue; // Устанавливаем отформатированное значение
}

export function onPhoneKeyDown(e) {
  let input = e.target;
  let inputValue = getInputSumValue(input);

  if (
    e.keyCode === 8 && // Проверка нажатия клавиши Backspace
    inputValue.length == 2 &&
    inputValue[inputValue.length - 1] == "." // Проверяем, что последний символ - точка
  ) {
    input.value = ""; // Очищаем поле
  }
}

export async function getAllCategory() {
  try {
    const allCategories = await getCategoryTransaction();

    allCategories.forEach((item) => {
      idToNameMap[item.id] = item.name;

      if (item.sub_categories && item.sub_categories.length > 0) {
        // Проход по подкатегориям
        item.sub_categories.forEach((subCategory) => {
          idToNameMap[subCategory.id] = subCategory.name;
        });
      }
    });
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

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
    cachedCategories = categories;
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export function renderCategoryTree(type) {
  const filteredCategories = cachedCategories.filter(
    (category) => category.type === type
  );

  const lista = document.getElementById("optionCat");
  lista.innerHTML = "";

  // Создание корневого элемента UL
  const rootUl = document.createElement("ul");
  rootUl.classList.add("tree");
  rootUl.id = "tree";
  lista.appendChild(rootUl);

  // Создание дерева категорий
  createCategoryTree(filteredCategories, rootUl);
}

export function checkCreateTranForm() {
  const dateTransaction = formTransactions.dateTransaction.value;
  // const timeTransaction = formTransactions.timeTransaction.value;
  const accountBox = formTransactions.accountBox.value;
  const catTransaction = formTransactions.catTransaction.value;
  const typeTransaction = formTransactions.typeTransaction.value;
  const sumTransaction = formTransactions.sumTransaction.value;
  if (
    dateTransaction &&
    // timeTransaction &&
    sumTransaction &&
    catTransaction &&
    accountBox
  ) {
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

  const eventId = localStorage.getItem("event");
  const dateTransaction = formTransactions.dateTransaction.value;
  let timeTransaction = formTransactions.timeTransaction.value;
  const accountTransactionId = localStorage.getItem("account_id");
  const catTransactionId = localStorage.getItem("cat_transaction");
  const sumTransaction = formTransactions.sumTransaction.value;
  const accessToken = localStorage.getItem("access_token");
  // const dateTime = new Date(`${dateTransaction}T${timeTransaction}:00`);
  const description = formTransactions.description.value || null;
  const typeTransaction = getSelectedRadioValue();

  if (!timeTransaction) {
    timeTransaction = "00:00";
  }

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
      accountTransactionId,
      accessToken
    );

    handleClickTra();
    const successMessage = `Транзакция успешно добавленна`;
    createToast("success", successMessage);
    setTimeout(getTransactions, 100);
    clearModalData();
  } catch (error) {
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
  formTransactions.accountBox.value = "";
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
    } else {
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

  if (timeLeft <= 2 * 60 * 10000) {
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

  if (!validateQrCode(decodedText)) {
    alert("Это не QR код");
    formTransactions.modalElementScan.close();
    formTransactions.buttonScanQr.classList.remove("disable");
    formTransactions.buttonScanQr.disabled = false;
  } else {
  }

  try {
    const response = await createReceiptApi(
      event_id,
      decodedText,
      access_token
    );
  } catch (error) {
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

export async function getActiveAccounts() {
  try {
    const access_token = localStorage.getItem("access_token");
    const activeAccounts = await getAllMyAccountsApi(access_token, false);
    cachedActiveAccounts = activeAccounts;

    renderAccount();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export function toggleDropdownAcc(event) {
  formTransactions.dropdownAcc.classList.toggle("active");
  event.stopPropagation();
  formTransactions.dropdown1.classList.remove("active");
}

export function renderAccount() {
  const inputElement = document.querySelector(".accountBox");

  const lista = document.getElementById("optionAcc");
  lista.innerHTML = "";

  const treeContainer = document.createElement("div");
  treeContainer.classList.add("account-div");
  lista.appendChild(treeContainer);

  cachedActiveAccounts.forEach((account) => {
    const accountId = account.id;
    const accountName = account.name;

    const listItem = document.createElement("li");
    listItem.setAttribute("data-id", accountId);
    listItem.setAttribute("data-name", accountName);

    const span = document.createElement("span");
    span.textContent = accountName;

    listItem.appendChild(span);
    treeContainer.appendChild(listItem);
  });

  treeContainer.addEventListener("click", function (event) {
    const target = event.target;

    // Если клик на <li> или <span> (с именем категории)
    if (target.tagName === "SPAN" || target.tagName === "LI") {
      // Определяем элемент <li>, на который был произведен клик
      const listItem = target.tagName === "SPAN" ? target.parentNode : target;
      inputElement.value = listItem.getAttribute("data-name"); // Заполняем input именем категории

      localStorage.setItem("account_id", listItem.getAttribute("data-id"));
      formTransactions.dropdown2.classList.remove("active");

      event.stopPropagation();
    }
  });
}
