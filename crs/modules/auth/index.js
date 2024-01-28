const BASE_URL = "https://bsikpg.duckdns.org/api/v1/";

window.onload = function () {
  async function performApiRequest(endpoint, method, body = null) {
    const url = `${BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body && JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Произошла неизвестная ошибка";
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      alert(`Произошла ошибка при выполнении запроса: ${error.message}`);
      throw error;
    }
  }

  async function authenticateUser(email, password) {
    return await performApiRequest("auth/login", "POST", { email, password });
  }

  async function refreshAccessToken(refreshToken) {
    const tokenRefreshData = await performApiRequest("auth/token", "POST", {
      refresh_token: refreshToken,
    });

    if (tokenRefreshData.token) {
      localStorage.setItem("access_token", tokenRefreshData.token);
      localStorage.setItem("refresh_token", tokenRefreshData.refresh_token);
      window.location.href = "../../pages/transactions/index.html";
    } else {
      console.error("Обновление токена не удалось");
    }
  }

  document.querySelector("#signup-submit").onclick = async function (event) {
    event.preventDefault();

    try {
      const email = document.querySelector("#InputEmail").value;
      const password = document.querySelector("#InputPassword").value;

      const loginData = await authenticateUser(email, password);

      if (loginData.refresh_token) {
        await refreshAccessToken(loginData.refresh_token);
      }
    } catch (error) {
      console.error("Произошла ошибка:", error);
    }
  };
};
