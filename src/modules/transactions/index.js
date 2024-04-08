const BASE_URL = "https://bsikpg.duckdns.org/api/v1/";
const form = {
  button: document.querySelector(".get-button"),
  start_date: document.getElementById("start-date"),
  end_date: document.getElementById("end-date"),
  input: document.querySelector(".text-box"),
  delete: document.querySelector(".delete-button"),
};

const modalElement = document.getElementById("modal");

let buttonClicked = false;

// Функция, которая добавляет данные в таблицу
function populateTableWithData(data) {}

form.button.addEventListener("click", async () => {
  if (buttonClicked) {
    return;
  }
  buttonClicked = true;
  form.button.disabled = true;

  const start_date = new Date(form.start_date.value);
  const end_date = new Date(form.end_date.value);
  const formattedStartDate =
    start_date.toISOString().slice(0, 10) + "T00:00:00Z";
  const formattedEndDate = end_date.toISOString().slice(0, 10) + "T23:59:59Z";
  const event_id = localStorage.getItem("event");
  const limit = 10;
  const offset = 0;

  try {
    const responseData = await transacions(
      formattedStartDate,
      formattedEndDate,
      event_id,
      limit,
      offset
    );
    setTimeout(() => {
      form.button.disabled = false;
      buttonClicked = false;
    }, 1000);

    console.log(responseData);
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    // Перебираем полученные данные и добавляем строки в таблицу
    responseData.forEach((transaction) => {
      const date = new Date(transaction.created_at);
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      const hours = ("0" + date.getHours()).slice(-2);
      const minutes = ("0" + date.getMinutes()).slice(-2);
      const seconds = ("0" + date.getSeconds()).slice(-2);
      const formattedTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;

      let type;
      let receipt_id;
      const user_id = parseInt(localStorage.getItem("user_id"), 10);
      let user;

      if (transaction.type === "Income") {
        type = "Расход";
      } else {
        type = transaction.type;
      }

      if (transaction.receipt_id === null) {
        receipt_id = "";
      } else {
        receipt_id = transaction.receipt_id;
      }

      if (transaction.user_id === user_id) {
        user = "Вы";
        console.log(transaction.user_id);
      } else {
        user = transaction.user_id;
      }

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
            <td>${transaction.number}</td>
            <td>${formattedTime}</td>
            <td>${type}</td>
            <td>${transaction.category}</td>
            <td>${transaction.amount + " р"}</td>
            <td>${user}</td>
            <td>${receipt_id}</td>
            <td><img src="../../crs/modules/transactions/asserts/ri-delete-bin-6-line.png" alt="Иконка" class="icon" data-transaction-id="${
              transaction.id
            }"></td>
        `;

      tbody.appendChild(newRow);
    });
    const icons = document.querySelectorAll(".icon");

    icons.forEach(function (icon) {
      icon.addEventListener("click", function () {
        const transactionId = icon.getAttribute("data-transaction-id");
        console.log(12);
        modalElement.showModal();
      });
    });
  } catch (error) {
    console.error("Произошла ошибка:", error);
    alert("Произошла ошибка при обращении к серверу.");
    setTimeout(() => {
      form.button.disabled = false;
      buttonClicked = false;
    }, 1000);
  }
});

async function transacions(start_date, end_date, event_id, limit, offset) {
  try {
    const params = new URLSearchParams({
      start: start_date,
      end: end_date,
      event_id: event_id,
      limit: limit,
      offset: offset,
    });

    const fullUrl = `${BASE_URL}transactions/all?${params}`;
    const access_token = localStorage.getItem("access_token");
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

function removeFocus() {
  const focusedElement = document.activeElement;
  if (focusedElement) {
    focusedElement.blur();
  }
}

document.querySelectorAll(".nav-link2").forEach(function (element) {
  element.addEventListener("click", function () {
    localStorage.removeItem("rememberMe");
    window.location.href = "../auth/index.html";
  });
});

let eventList = [];

const userId = localStorage.getItem("user_id");
const userIdElement = document.getElementById("user_id");
userIdElement.textContent = userId;

async function fetchData() {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(BASE_URL + "events/by_filter", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    data.forEach((event) => {
      const eventId = event.id;
      const eventName = event.name;
      var lista = document.querySelector(".option");
      // Создаем элемент списка
      var listItem = document.createElement("li");
      listItem.textContent = eventName;
      listItem.setAttribute("data-id", eventId);
      lista.appendChild(listItem);
    });

    // Вызываем функцию foo() после добавления элементов списка
    foo();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}
console.log(eventList);

document.addEventListener("DOMContentLoaded", fetchData);

document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  sidebar.addEventListener("mouseenter", function () {
    this.classList.remove("close");
  });

  sidebar.addEventListener("mouseleave", function () {
    this.classList.add("close");
  });
});

const foo = () => {
  const list = document.querySelector(".option");
  const input = document.querySelector(".text-box");
  console.log(list);
  for (let i = 0; i < list.children.length; i++) {
    list?.children[i].addEventListener("click", (e) => {
      const selectedId = list.children[i].getAttribute("data-id");
      const selectedValue = list.children[i].innerHTML;
      input.value = selectedValue;
      localStorage.setItem("event", selectedId);
      console.log(input.value);
      console.log(localStorage.getItem("value"));
    });
  }
};

const dropdown = document.querySelector(".dropdown");
const option = document.querySelector(".option");

dropdown.addEventListener("click", function (event) {
  dropdown.classList.toggle("active");
  event.stopPropagation(); // Предотвращаем всплытие события, чтобы оно не срабатывало на document
});

document.addEventListener("click", function (event) {
  if (!option.contains(event.target)) {
    dropdown.classList.remove("active");
  }
});

//Функциональность для заполнения периода по умолчанию

document.addEventListener("DOMContentLoaded", function () {
  // Функция для получения даты в формате YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Получаем текущую дату
  const currentDate = new Date();

  // Устанавливаем первый день текущего месяца
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const formattedFirstDay = formatDate(firstDayOfMonth);
  document.getElementById("start-date").value = formattedFirstDay;

  // Устанавливаем последний день текущего месяца
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const formattedLastDay = formatDate(lastDayOfMonth);
  document.getElementById("end-date").value = formattedLastDay;
});
