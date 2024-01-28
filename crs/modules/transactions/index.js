document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM загружен");

  const logoutButton = document.getElementById("logout-button");

  if (logoutButton) {
    console.log("Кнопка 'Выйти' найдена");

    logoutButton.addEventListener("click", function () {
      console.log("Кнопка 'Выйти' нажата");

      // Очистите данные аутентификации (если необходимо)
      // localStorage.removeItem("user_id");
      // localStorage.removeItem("access_token");
      // localStorage.removeItem("refresh_token");

      // Перенаправление на страницу авторизации
      window.location.href = "../../pages/auth/index.html";
    });
  } else {
    console.error("Кнопка 'Выйти' не найдена");
  }
});
