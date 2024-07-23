class EmailValidator {
  static validate(email) {
    const reg = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    return reg.test(email);
  }
}

// Проверяем, что дата окончания больше даты начала
function checkDate(startDate, endDate) {
  return startDate < endDate;
}

// Проверяем, что поле "Выберете мероприятие" заполненно
function isFieldFilled(fieldValue) {
  return fieldValue && fieldValue.trim() !== "";
}

export { checkDate, isFieldFilled };
export { EmailValidator };

export function sidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.addEventListener("mouseenter", function () {
    this.classList.remove("close");
  });

  sidebar.addEventListener("mouseleave", function () {
    this.classList.add("close");
  });
}
