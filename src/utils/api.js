const BASE_URL = "https://sweetcash.org/api/";

export async function register(name, email, phone, password) {
  try {
    const requestBody = JSON.stringify({
      name: name,
      email: email,
      phone: phone,
      password: password,
    });

    const response = await fetch(BASE_URL + "v1/auth/register", {
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
    const response = await fetch(BASE_URL + "v1/auth/login", {
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
    const response = await fetch(BASE_URL + "v1/auth/token", {
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

      window.location.href = "../../pages/transactions/index.html";
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
      BASE_URL + "v1/events/by_role?roles=Manager%2CObserver%2CPartner ",
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

// Transactions

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

    const fullUrl = `${BASE_URL}v2/transactions/all?${params}`;
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Ошибкwewа при выполнении запроса");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function deleteTransaction(transactionId, access_token) {
  const url = `v2/transactions/${transactionId}`;

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

export async function createTransactionApi(
  event_id,
  type,
  category_id,
  amount,
  transaction_date,
  description,
  account_id,
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

    if (type === "Income") {
      requestData.target_account_id = account_id;
    } else {
      requestData.source_account_id = account_id;
    }

    if (description) {
      requestData.description = description;
    }

    const response = await fetch(BASE_URL + "v2/transactions", {
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

    const response = await fetch(
      BASE_URL + `v2/transactions/${transaction_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(requestData),
      }
    );
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getCategoryTransaction() {
  const access_token = localStorage.getItem("access_token");

  try {
    const response = await fetch(BASE_URL + "v1/transactions/categories", {
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

export async function getMyEventsApi(access_token) {
  try {
    const response = await fetch(BASE_URL + "v1/events/by_role?roles=Manager", {
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
    const response = await fetch(BASE_URL + "v1/events/invitations", {
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
      BASE_URL + "v1/events/by_role?roles=Observer%2CPartner",
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
      BASE_URL + `v1/events/${event_id}/participant/confirm`,
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
      BASE_URL + `v1/events/${event_id}/participant/reject`,
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

    const response = await fetch(BASE_URL + "v1/events", {
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

    const response = await fetch(
      BASE_URL + `v1/events/${event_id}/participant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(requestData),
      }
    );
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

    const response = await fetch(BASE_URL + `v1/events/${event_id}`, {
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

    const response = await fetch(BASE_URL + `v1/receipts/qr`, {
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

export async function recoveryPasswordApi(email) {
  try {
    const response = await fetch(
      BASE_URL + `v1/auth/password/recovery?email=${email}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getReceiptApi(access_token, receipt_id) {
  try {
    const response = await fetch(
      BASE_URL + `v1/receipts?receipts_ids=${receipt_id}`,
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

export async function getAllMyAccountsApi(access_token, blocked) {
  try {
    const response = await fetch(
      BASE_URL + `v1/accounts/by_user?with_blocked=${blocked}`,
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

export async function createAccountApi(name, description, access_token) {
  try {
    const requestData = {
      name,
    };
    if (description) {
      requestData.description = description;
    }

    const response = await fetch(BASE_URL + "v1/accounts", {
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

export async function updateAccountApi(
  account_id,
  name,
  description,
  is_blocked,
  access_token
) {
  try {
    const requestData = {
      name,
      is_blocked,
    };
    if (description) {
      requestData.description = description;
    }

    const response = await fetch(BASE_URL + `v1/accounts/${account_id}`, {
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

export async function addUserAccountApi(account_id, user_id, access_token) {
  try {
    const response = await fetch(
      BASE_URL + `v1/accounts/${account_id}/addUser?user_id=${user_id}`,

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function deleteUserAccountApi(account_id, user_id, access_token) {
  try {
    const response = await fetch(
      BASE_URL + `v1/accounts/${account_id}/deleteUser/${user_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Ошибка аутентификации");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}
