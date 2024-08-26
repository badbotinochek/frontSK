import { formRegistration } from "./constants.js";
import { EmailValidator } from "../other_functions/validations.js";
import { register } from "../../utils/api.js";

function redirectToAuth() {
  window.location.href = "../auth/index.html";
}

export { redirectToAuth };

export function checkRegistrationForm() {
  const userName = formRegistration.userName.value;
  const mobile = formRegistration.mobile.value;
  const email = formRegistration.email.value;
  const password = formRegistration.password.value;
  const passwordRepeat = formRegistration.passwordRepeat.value;
  console.log(email);

  if (userName && mobile && email && password && passwordRepeat) {
    formRegistration.registrationButton.classList.remove("disable");
  } else {
    formRegistration.registrationButton.classList.add("disable");
  }
}

function validatePhoneNumber(phoneNumber) {
  const cleanedNumber = phoneNumber.replace(/\D/g, "");
  if (
    !(
      cleanedNumber[0] === "9" ||
      cleanedNumber[0] === "7" ||
      cleanedNumber[0] === "8"
    )
  ) {
    return false;
  }
  return cleanedNumber.length === 11;
}

function validatePassword(password) {
  console.log(password.length);
  const reg =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if (password.length < 8) {
    formRegistration.password.classList.add("passwordError");
    formRegistration.textPasswordError.classList.add("view");
    formRegistration.registrationButton.classList.add("disable");
  } else if (reg.test(password) === false) {
    formRegistration.password.classList.add("passwordError");
    formRegistration.textPasswordError2.classList.add("view");
    formRegistration.registrationButton.classList.add("disable");
  }
}

export async function userRegistration() {
  formRegistration.registrationButton.classList.add("disable");
  const userName = formRegistration.userName.value;
  const mobile = formRegistration.mobile.value;
  const email = formRegistration.email.value;
  const password = formRegistration.password.value;
  const passwordRepeat = formRegistration.passwordRepeat.value;

  if (!validatePhoneNumber(mobile)) {
    formRegistration.mobile.classList.add("mobileError");
    formRegistration.registrationButton.classList.add("disable");
    formRegistration.textMobileError.classList.add("view");
  }

  if (!EmailValidator.validate(email)) {
    formRegistration.email.classList.add("emailError");
    formRegistration.registrationButton.classList.add("disable");
    formRegistration.textEmailError.classList.add("view");
  }

  validatePassword(password);

  if (password !== passwordRepeat) {
    formRegistration.passwordRepeat.classList.add("passwordError");
    formRegistration.textPasswordErrorRepeat.classList.add("view");
    formRegistration.registrationButton.classList.add("disable");
    return;
  }

  let cleanedNumber = mobile.replace(/\D/g, "");

  if (cleanedNumber.startsWith("9")) {
    cleanedNumber = "+7" + cleanedNumber;
  } else if (cleanedNumber.startsWith("7")) {
    cleanedNumber = "+" + cleanedNumber;
  } else if (cleanedNumber.startsWith("8")) {
    cleanedNumber = "+7" + cleanedNumber.slice(1); // Удаляем первый символ (8) и добавляем +7
  }
  console.log(cleanedNumber);

  try {
    const response = await register(userName, email, cleanedNumber, password);
    console.log(response.status);
    if (response.status === 200) {
      // Редирект на другую страницу
      localStorage.setItem("user_email", email);
      window.location.href = "../registration_confirmation/index.html";
    } else {
      // Обработка других случаев
      console.log("Другой код состояния:", response.status);
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

//Сделать универсальнее в будущем
export function removeErrorStyle() {
  formRegistration.textEmailError.classList.remove("view");
}
export function removeErrorStyleMobile() {
  formRegistration.textMobileError.classList.remove("view");
}
export function removeErrorPasswordRepeat() {
  formRegistration.textPasswordErrorRepeat.classList.remove("view");
}
export function removeErrorPassword() {
  formRegistration.textPasswordError2.classList.remove("view");
  formRegistration.textPasswordError.classList.remove("view");
}

function getInputNumberValue(input) {
  return input.value.replace(/\D/g, "");
}
export function onPhoneInput(e) {
  let input = e.target,
    inputNumbersValue = getInputNumberValue(input),
    formattedInputValue = "",
    selectionStart = input.selectionStart;

  if (!inputNumbersValue) {
    return (input.value = "");
  }

  if (input.value.length != selectionStart) {
    if (e.data && /\D/g.test(e.data)) {
      input.value = inputNumbersValue;
    }
    return;
  }

  if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
    // Russian phone number
    if (inputNumbersValue[0] == "9")
      inputNumbersValue = "7" + inputNumbersValue;
    let firstSimbols = inputNumbersValue[0] == "8" ? "8" : "+7";
    formattedInputValue = firstSimbols + " ";
    if (inputNumbersValue.length > 1) {
      formattedInputValue += "(" + inputNumbersValue.substring(1, 4);
    }
    if (inputNumbersValue.length >= 5) {
      formattedInputValue += ") " + inputNumbersValue.substring(4, 7);
    }
    if (inputNumbersValue.length >= 8) {
      formattedInputValue += "-" + inputNumbersValue.substring(7, 9);
    }
    if (inputNumbersValue.length >= 10) {
      formattedInputValue += "-" + inputNumbersValue.substring(9, 11);
    }
  } else {
    // Not Russian phone number
    formattedInputValue = "+" + inputNumbersValue;
  }
  input.value = formattedInputValue;
}
export function onPhoneKeyDown(e) {
  let input = e.target;
  if (e.keyCode == 8 && getInputNumberValue(input).length == 1) {
    input.value = "";
  }
}

export function hidepassword1() {
  if (formRegistration.password.type === "password") {
    formRegistration.password.type = "text";
    formRegistration.eyecon1.classList.remove("fa-eye-slash");
    formRegistration.eyecon1.classList.add("fa-eye");
  } else {
    formRegistration.password.type = "password";
    formRegistration.eyecon1.classList.remove("fa-eye");
    formRegistration.eyecon1.classList.add("fa-eye-slash");
  }
}

export function hidepassword2() {
  if (formRegistration.passwordRepeat.type === "password") {
    formRegistration.passwordRepeat.type = "text";
    formRegistration.eyecon2.classList.add("fa-eye");
    formRegistration.eyecon2.classList.remove("fa-eye-slash");
  } else {
    formRegistration.passwordRepeat.type = "password";
    formRegistration.eyecon2.classList.remove("fa-eye");
    formRegistration.eyecon2.classList.add("fa-eye-slash");
  }
}
