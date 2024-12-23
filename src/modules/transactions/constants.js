export const formTransactions = {
  /* Переменные для sidebar */
  sidebar: document.querySelector(".sidebar"),
  exitButton: document.getElementById("exist"),

  /* Переменные для navbar */
  eventDropdown: document.getElementById("eventDropdown"),
  eventOption: document.querySelector(".dropdownOptions"),
  inputEvent: document.querySelector(".dropdownInput"),

  startDateEvent: document.getElementById("startDate"),
  endDateEvent: document.getElementById("endDate"),
  buttonOpenModalExpense: document.getElementById("buttonOpenModalExpense"),
  buttonOpenModalIncome: document.getElementById("buttonOpenModalIncome"),
  buttonOpenModalTransaction: document.getElementById(
    "buttonOpenModalTransaction"
  ),
  getTransactionButton: document.querySelector(".buttonGetAllTransaction"),
  userIdElement: document.getElementById("user_id"),

  /* Переменные для модального окна */

  modalElement: document.querySelector(".modal"),

  modalElementTr: document.getElementById("modalTransaction"),
  dateTransaction: document.getElementById("dateTr"),
  timeTransaction: document.getElementById("timeTr"),

  modalDropdownAccount: document.getElementById("modalDropdownAccount"),
  modalOptionAccount: document.getElementById("modalOptionAccount"),
  modalInputAccount: document.getElementById(".modalInputAccount"),

  option1: document.querySelector(".option1"),
  dropdown1: document.querySelector(".dropdown1"),

  sumTransactionInput: document.getElementById("inputAmountExpense"),

  dropdownCat: document.getElementById("dropdownCat"),

  descriptionTextarea: document.querySelector(".description"),

  /* Переменные для sidebar */
  idTransaction: document.getElementById("InputId"),

  delete: document.querySelector(".delete-button"),
  aprove_delete: document.getElementById("deleteBtn"),
  cancel: document.getElementById("closeBtn"),
  create_transaction: document.getElementById("create-submit"),
  cancelTra: document.getElementById("closeBtnTra"),

  catTransaction: document.querySelector(".categoryBox"),
  sumTransaction: document.getElementById("sumTransaction"),
  description: document.getElementById("descriptionTran"),

  buttonCreateExpense: document.getElementById("buttonCreateExpense"),

  editTransactionButton: document.getElementById("changeTra"),
  row: document.querySelector(".custom-table tbody"),
  radioButtons: document.querySelectorAll('input[name="typeTransaction"]'),

  showModalElementTr: document.getElementById("ShowModalTransaction"),
  showIdTransaction: document.getElementById("ShowInputId"),
  showDateTransaction: document.getElementById("ShowdateTr"),
  showTimeTransaction: document.getElementById("ShowtimeTr"),
  showAccountTransaction: document.getElementById("showAccountTransaction"),
  showCatTransaction: document.getElementById("showCatTran"),
  showSumTransaction: document.getElementById("ShowsumTransaction"),
  showDescription: document.getElementById("ShowdescriptionTran"),
  showCancelTra: document.getElementById("showCloseBtnTra"),

  labelMoreTransaction: document.getElementById("more"),

  closeIcon: document.getElementById("close-icon"),

  dropdown2: document.querySelector(".dropdown2"),
  dropdownAcc: document.getElementById("dropdownAcc"),

  modalTransaction: document.getElementById("modalTransaction"),
  createExpenseButton: document.getElementById("createExpenseButton"),
};
