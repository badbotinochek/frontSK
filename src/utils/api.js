const BASE_URL = "https://bsikpg.duckdns.org/api/v1/";

export async function register(name, email, phone, password) {
  try {
    const requestBody = JSON.stringify({
      name: name,
      email: email,
      phone: phone,
      password: password,
    });

    const response = await fetch(BASE_URL + "auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error("Ошибка при выполнении запроса");
    }

    return await response;
  } catch (error) {
    throw error;
  }
}

export async function authenticateUser(email, password) {
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

export async function refreshAccessToken(refreshToken) {
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
      throw new Error("Ошибка обновления токена доступа");
    }
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("expire_at", data.expire_at);
      console.log("End date is greater than start date.");
      window.location.href = "../../pages/transactions/index.html";
      console.log(data);
    }
  } catch (error) {
    throw error;
  }
}

export function redirectAutorize() {
  const rememberMe = localStorage.getItem("rememberMe");
  if (rememberMe === "true") {
    window.location.href = "../../pages/transactions/index.html";
  }
}

export async function getAllMyEvents(access_token) {
  try {
    const response = await fetch(
      BASE_URL + "events/by_role?roles=Manager%2CObserver%2CPartner ",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export async function getTransacionsForEvent(
  start_date,
  end_date,
  event_id,
  limit,
  offset,
  access_token
) {
  try {
    const params = new URLSearchParams({
      start: start_date,
      end: end_date,
      event_id: event_id,
      limit: limit,
      offset: offset,
    });

    const fullUrl = `${BASE_URL}transactions/all?${params}`;
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Ошибка при выполнении запроса");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function deleteTransaction(transactionId, access_token) {
  const url = `transactions/${transactionId}`;

  try {
    const response = await fetch(BASE_URL + url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Ошибка при выполнении запроса");
    }
    return await response.json();
  } catch (error) {
    console.error("Произошла ошибка при удалении транзакции:", error);
  }
}

export async function getCategoryTransaction() {
  const access_token = localStorage.getItem("access_token");

  try {
    const response = await fetch(BASE_URL + "transactions/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Ошибка при выполнении запроса");
    }
    return await response.json();
  } catch (error) {
    console.error("Произошла ошибка при удалении транзакции:", error);
  }
}

export async function createTransactionApi(
  event_id,
  type,
  category_id,
  amount,
  transaction_date,
  description,
  access_token
) {
  try {
    const requestData = {
      event_id,
      type,
      category_id,
      amount,
      transaction_date,
    };
    if (description) {
      requestData.description = description;
    }

    const response = await fetch(BASE_URL + "transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateTransactionApi(
  transaction_id,
  event_id,
  type,
  category_id,
  amount,
  transaction_date,
  description,
  access_token
) {
  try {
    const requestData = {
      event_id,
      type,
      category_id,
      amount,
      transaction_date,
    };
    if (description) {
      requestData.description = description;
    }

    const response = await fetch(BASE_URL + `transactions/${transaction_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getMyEventsApi(access_token) {
  try {
    const response = await fetch(BASE_URL + "events/by_role?roles=Manager", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export async function getMyInvitationApi(access_token) {
  try {
    const response = await fetch(BASE_URL + "events/invitations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export async function getForeignInvitationApi(access_token) {
  try {
    const response = await fetch(
      BASE_URL + "events/by_role?roles=Observer%2CPartner",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export async function eventConfirmApi(event_id, access_token) {
  try {
    const response = await fetch(
      BASE_URL + `events/${event_id}/participant/confirm`,
      {
        method: "Put",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export async function eventRejectApi(event_id, access_token) {
  try {
    const response = await fetch(
      BASE_URL + `events/${event_id}/participant/reject`,
      {
        method: "Put",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

export async function createEventApi(
  name,
  start,
  end,
  description,
  access_token
) {
  try {
    const requestData = {
      name,
      start,
    };
    if (end) {
      requestData.end = end;
    }
    if (description) {
      requestData.description = description;
    }

    const response = await fetch(BASE_URL + "events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function createParticipantApi(
  event_id,
  user_id,
  role,
  access_token
) {
  try {
    const requestData = {
      user_id,
      role,
    };

    const response = await fetch(BASE_URL + `events/${event_id}/participant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateEventApi(
  event_id,
  name,
  start,
  end,
  description,
  access_token
) {
  try {
    const requestData = {
      name,
      start,
    };
    if (end) {
      requestData.end = end;
    }
    if (description) {
      requestData.description = description;
    }

    const response = await fetch(BASE_URL + `events/${event_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function createReceiptApi(event_id, qr, access_token) {
  try {
    const requestData = {
      event_id,
      qr,
    };

    const response = await fetch(BASE_URL + `receipts/qr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}
