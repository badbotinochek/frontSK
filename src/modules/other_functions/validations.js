export class EmailValidator {
  static validate(email) {
    const reg = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    return reg.test(email);
  }
}

// Проверяем, что дата окончания больше даты начала
export function checkDate(startDate, endDate) {
  return startDate < endDate;
}

// Проверяем, что поле "Выберете мероприятие" заполненно
export function isFieldFilled(fieldValue) {
  return fieldValue && fieldValue.trim() !== "";
}

const formatDate = (dateString) => {};
