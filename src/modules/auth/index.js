const BASE_URL = "https://bsikpg.duckdns.org/api/v1/";
const form = {
  email: document.getElementById("InputEmail"),
  password: document.getElementById("InputPassword"),
  button: document.querySelector(".signup-button"),
  inputs: document.querySelectorAll("input"),
  error: document.querySelector(".input-error"),
};

let buttonClicked = false;
let rememberMeCheckbox = document.getElementById("rememberMe");

function checkForm() {
  const email = form.email.value;
  const password = form.password.value;
  if (email && password) {
    form.button.classList.remove("disable");
  } else {
    form.button.classList.add("disable");
  }
}

form.email.addEventListener("focus", function () {
  form.error.classList.remove("view");
  form.email.style.marginBottom = "36px";
});

form.email.oninput = checkForm;
form.password.oninput = checkForm;

form.button.addEventListener("click", async () => {
  if (form.email.classList.contains("email-error")) {
    form.email.classList.remove("email-error");
  }
  if (form.password.classList.contains("password-error")) {
    form.password.classList.remove("password-error");
  }

  if (buttonClicked) {
    return;
  }
  form.button.classList.add("disable");
  buttonClicked = true;
  form.button.disabled = true;
  const email = form.email.value;
  const password = form.password.value;

  if (!EmailValidator.validate(email)) {
    form.email.classList.add("email-error");
    form.button.classList.add("disable"); // Добавление класса "disable"
    form.error.classList.add("view");
    form.email.style.marginBottom = "0";
    form.error.style.marginBottom = "24px";
    form.button.disabled = false;
    buttonClicked = false;
    return;
  }

  console.log("Email валидный");

  try {
    const loginData = await authenticateUser(email, password);
    setTimeout(() => {
      form.button.disabled = false;
      buttonClicked = false;
      form.button.classList.remove("disable");
    }, 1000);

    if (loginData.refresh_token) {
      console.log(loginData);
      await refreshAccessToken(loginData.refresh_token);
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
    if (error.message === "Ошибка аутентификации") {
      form.button.classList.remove("disable");
      const errorMessage = "Проверьте правильность введенных данных.";
      createToast("error", errorMessage);
      form.email.classList.add("email-error");
      form.password.classList.add("password-error");
    }
    setTimeout(() => {
      form.button.disabled = false;
      form.button.classList.remove("disable");
      buttonClicked = false;
    }, 1000);
  }
});

form.email;

async function authenticateUser(email, password) {
  try {
    const response = await fetch(BASE_URL + "auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(BASE_URL + "auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Ошибка обновления токена доступа:", errorMessage);
      throw new Error("Ошибка обновления токена доступа");
    }
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("refresh_token", data.refresh_token);
      window.location.href = "../../pages/transactions/index.html";
    } else {
      console.error("Обновление токена не удалось");
    }
  } catch (error) {
    console.error("Произошла ошибка при обновлении токена доступа:", error);
    throw error;
  }
}

rememberMeCheckbox.addEventListener("change", function () {
  if (this.checked) {
    localStorage.setItem("rememberMe", "true");
  } else {
    localStorage.removeItem("rememberMe");
  }
});

window.onload = function () {
  const rememberMe = localStorage.getItem("rememberMe");
  if (rememberMe === "true") {
    window.location.href = "../../pages/transactions/index.html";
  }
};
