var u_email = document.myForm.u_email;
var u_password = document.myForm.u_password;

function validate() {
  if (u_email.value && u_password.value) {
    // Поля заполнены, можно отправить данные на сервер
    sendLoginRequest(u_email.value, u_password.value);
  } else {
    if (!u_email.value) {
      u_email.classList.remove("is-valid");
      u_email.classList.add("is-invalid");
      document.getElementById("email-validation").innerText =
        "Обязательное поле";
    } else {
      u_email.classList.remove("is-invalid");
      u_email.classList.add("is-valid");
      document.getElementById("email-validation").innerText = "";
    }

    if (!u_password.value) {
      u_password.classList.remove("is-valid");
      u_password.classList.add("is-invalid");
      document.getElementById("password-validation").innerText =
        "Обязательное поле";
    } else {
      u_password.classList.remove("is-invalid");
      u_password.classList.add("is-valid");
      document.getElementById("password-validation").innerText = "";
    }
  }
}

function sendLoginRequest(email, password) {
  fetch("https://bsikpg.duckdns.org/api/v1/auth/login", {
    method: "POST",
    headers: {
      // Accept: "application/json",
      "Content-Type": "application/json",
      // "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ email: email, password: password }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.json());
      }
    })
    .then((data) => {
      if (data.refresh_token) {
        // Сохраните refresh_token и user_id (предположим, что они возвращаются в ответе)
        const refresh_token = data.refresh_token;
        const user_id = data.user_id;
        // Сохраните user_id в localStorage или в другом месте
        localStorage.setItem("user_id", user_id);
        localStorage.setItem("refresh_token", refresh_token);

        return fetch("https://bsikpg.duckdns.org/api/v1/auth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refresh_token }),
        });
      }
    })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .then((data) => {
      if (data.token) {
        // Если получен новый access_token, сохраните его (предположим, что он возвращается в ответе)
        const token = data.token;
        // Сохраните access_token, чтобы его можно было использовать для вызова других ручек

        // Перенаправьте пользователя на страницу с транзакциями
        window.location.href = "/pages/transactions.html";
      }
    })
    .catch((error) => {
      console.error("Ошибка при выполнении запроса:", error);
    });
}
