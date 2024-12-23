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

export async function getAllMyEventsApi(access_token) {
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
  receipt_id,
  source_account_id,
  target_account_id,
  access_token,
  transfer_fee
) {
  try {
    const requestData = {
      event_id,
      type,
      category_id,
      amount,
      transaction_date,
    };

    // Если указан receipt_id, добавляем его
    if (receipt_id) {
      requestData.receipt_id = receipt_id;
    }

    // В зависимости от типа транзакции, устанавливаем правильные поля
    if (type === "Income") {
      requestData.target_account_id = target_account_id;
    } else if (type === "Expense") {
      requestData.source_account_id = source_account_id;
    } else if (type === "Transfer") {
      requestData.source_account_id = source_account_id;
      requestData.target_account_id = target_account_id;
    }

    if (description) {
      requestData.description = description;
    }

    if (transfer_fee) {
      requestData.transfer_fee = transfer_fee;
    }
    console.log(requestData);
    const response = await fetch(BASE_URL + "v2/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка при отправке данных");
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка при создании транзакции:", error.message);
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
  receipt_id,
  source_account_id,
  target_account_id,
  access_token,
  transfer_fee
) {
  try {
    const requestData = {
      event_id,
      type,
      category_id,
      amount,
      transaction_date,
    };

    // Если указан receipt_id, добавляем его
    if (receipt_id) {
      requestData.receipt_id = receipt_id;
    }
    // В зависимости от типа транзакции, устанавливаем правильные поля
    if (type === "Income") {
      requestData.target_account_id = target_account_id;
    } else if (type === "Expense") {
      requestData.source_account_id = source_account_id;
    } else if (type === "Transfer") {
      requestData.source_account_id = source_account_id;
      requestData.target_account_id = target_account_id;
    }

    if (description) {
      requestData.description = description;
    }

    if (transfer_fee) {
      requestData.transfer_fee = transfer_fee;
    }
    console.log(requestData);
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
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка при отправке данных");
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка при обновлении транзакции:", error.message);
    throw error;
  }
}

// export async function updateTransactionApi(
//   transaction_id,
//   event_id,
//   type,
//   category_id,
//   amount,
//   transaction_date,
//   description,
//   access_token
// ) {
//   try {
//     const requestData = {
//       event_id,
//       type,
//       category_id,
//       amount,
//       transaction_date,
//     };
//     if (description) {
//       requestData.description = description;
//     }

//     const response = await fetch(
//       BASE_URL + `v2/transactions/${transaction_id}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${access_token}`,
//         },
//         body: JSON.stringify(requestData),
//       }
//     );
//     if (!response.ok) {
//       throw new Error("Ошибка аутентификации");
//     }
//     return await response.json();
//   } catch (error) {
//     throw error;
//   }
// }

export async function getCategoryTransactionApi() {
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
      `${BASE_URL}v1/accounts/${account_id}/addUser?user_id=${user_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const data = await response.json(); // Парсим ответ сразу

    if (!response.ok) {
      // Если ответ неудачный, берем сообщение из detail или message
      const errorMessage =
        data?.detail ||
        data?.message ||
        `Ошибка: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Возвращаем объект с статусом и данными
    return { status: response.status, data };
  } catch (error) {
    console.error("Ошибка в API:", error.message);
    throw error; // Пробрасываем ошибку выше
  }
}

export async function TESTaddUserAccountApi(
  account_id,
  user_id,
  access_token,
  delay = 1000
) {
  try {
    // Имитация задержки
    await new Promise((resolve) => setTimeout(resolve, delay)); // Задержка в миллисекундах (по умолчанию 1000мс = 1 секунда)

    // Возвращаем объект в нужном формате
    return {
      id: account_id, // Используем переданный account_id
      created_at: "2024-12-15T07:59:15.757Z",
      updated_at: "2024-12-15T07:59:15.757Z",
      name: "string",
      description: "string",
      is_blocked: true,
      user: {
        id: user_id, // Используем переданный user_id
        created_at: "2024-12-15T07:59:15.757Z",
        name: "string",
      },
      admitted_users: [
        {
          id: user_id, // Используем переданный user_id
          created_at: "2024-12-15T07:59:15.757Z",
          name: "string",
        },
      ],
    };
  } catch (error) {
    throw error; // В случае ошибок передаем их дальше
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

export async function createLiabilityitApi(
  type,
  amount,
  currency,
  percentage_rate,
  due_date,
  debtor,
  creditor,
  description,
  access_token
) {
  try {
    const data = {
      type,
      amount,
      currency,
      percentage_rate,
      due_date,
      debtor,
      creditor,
      description,
    };

    Object.keys(data).forEach(
      (key) =>
        (data[key] === undefined || data[key] === null) && delete data[key]
    );
    console.log(data);
    const response = await fetch(BASE_URL + `v1/debts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(data),
    });
    console.log(response);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка при создании долга: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    throw error;
  }
}

export async function getAllMyLiabilityApi(access_token) {
  try {
    const response = await fetch(BASE_URL + `v1/debts/by_user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка при получении долгов: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    throw error;
  }
}

export async function updateLiabilityitApi(
  debts_id,
  type,
  amount,
  currency,
  percentage_rate,
  due_date,
  debtor,
  creditor,
  description,
  closed_at,
  access_token
) {
  try {
    const data = {
      type,
      amount,
      currency,
      percentage_rate,
      due_date,
      debtor,
      creditor,
      description,
      closed_at,
    };

    Object.keys(data).forEach((key) => {
      if (data[key] === undefined || data[key] === null || data[key] === "") {
        delete data[key];
      }
    });
    const response = await fetch(BASE_URL + `v1/debts/${debts_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(data),
    });
    console.log(response);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка при изменении долга: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    throw error;
  }
}
