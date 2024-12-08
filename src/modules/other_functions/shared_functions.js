import { createToast } from "../notifications/index.js";

export function redirectToAuth() {
  const access_token = localStorage.getItem("access_token");
  if (!access_token) {
    window.location.href = "../../pages/auth/index.html";
  }
}

export async function checkAndUpdateToken() {
  const expireAt = localStorage.getItem("expire_at");
  if (!expireAt) return;

  const expireTime = new Date(expireAt).getTime();
  const currentTime = Date.now();
  const timeLeft = expireTime - currentTime;

  if (timeLeft <= 2 * 60 * 10000) {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      await refreshAccessToken(refreshToken);
    } catch (error) {
      setTimeout(() => {
        checkAndUpdateToken();
      }, 60 * 1000);
    }
  } else if (timeLeft > 2 * 60 * 1000) {
    setTimeout(checkAndUpdateToken, timeLeft - 2 * 60 * 1000);
  }
}

export async function displayUsername() {
  const userId = localStorage.getItem("user_id");
  const userIdElement = document.getElementById("user_id");
  userIdElement.textContent = userId;
  const userName = localStorage.getItem("user_name");
  userIdElement.textContent = userName;
  userIdElement.setAttribute("data-tooltip", `Ваш ID: ${userId}`);
}

// Объект с ссылками для навигации
const navLinks = {
  transactions: "../../pages/transactions/index.html",
  events: "../../pages/events/index.html",
  accounts: "../../pages/count/index.html",
  debts: "../../pages/debts/index.html",
  exist: "/pages/auth/index.html",
};

// Функция для обработки клика
export function handleNavClick(event) {
  const target = event.currentTarget;
  const id = target.querySelector("i").id; // Получаем ID иконки

  // Проверяем наличие ссылки в объекте navLinks
  if (navLinks[id]) {
    // Перенаправление на соответствующую страницу
    if (id === "exist") {
      localStorage.clear(); // Очистка localStorage для выхода
    }
    window.location.href = navLinks[id];
  } else {
    const message = `Данная функция пока недоступна.`;
    createToast("info", message);
  }
}

let tooltipTimeout;
export function handleTooltipMouseEnter(event, isButton = false) {
  const target = event.target;
  let isButton1 = isButton;

  // Проверяем, есть ли у элемента атрибут data-tooltip
  if (target.hasAttribute("data-tooltip")) {
    const tooltipContent = target.getAttribute("data-tooltip");

    // Устанавливаем задержку перед показом тултипа
    tooltipTimeout = setTimeout(() => {
      showTooltip(target, tooltipContent, isButton1);
    }, 600); // Задержка в 600 мс
  }
}

export function handleTooltipMouseLeave(event) {
  const target = event.target;
  // Проверяем, есть ли у элемента атрибут data-tooltip
  if (target.hasAttribute("data-tooltip")) {
    clearTimeout(tooltipTimeout); // Отменяем показ тултипа, если мышь ушла
    hideTooltip(); // Скрываем тултип сразу
  }
}

export function showTooltip(element, tooltipText, isButton = false) {
  const tooltip = document.getElementById("tooltip");
  const tooltipTextElem = document.getElementById("tooltipText");

  // Устанавливаем текст тултипа
  tooltipTextElem.textContent = tooltipText;

  // Показываем тултип
  tooltip.style.display = "block";
  // Получаем размеры элемента и тултипа
  const elementRect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  // Увеличиваем расстояние для кнопок
  let offset = 0;
  if (isButton) {
    offset = isButton ? 15 : 15;
  }

  // Получаем размеры экрана
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Позиционируем тултип
  let tooltipPosition = {
    top: 0,
    left: 0,
  };

  // Проверяем, есть ли достаточно места справа от элемента
  if (elementRect.right + tooltipRect.width <= window.innerWidth) {
    // Если места достаточно, размещаем тултип справа от элемента
    tooltipPosition.left = elementRect.right + offset; // Отступ от элемента
    tooltipPosition.top =
      elementRect.top + elementRect.height / 2 - tooltipRect.height / 2; // Центрируем по вертикали
  } else if (
    elementRect.bottom + tooltipRect.height + offset <=
    window.innerHeight
  ) {
    // Если места справа нет, размещаем тултип снизу от элемента
    tooltipPosition.left =
      elementRect.left + elementRect.width / 2 - tooltipRect.width / 2; // Центрируем по горизонтали
    tooltipPosition.top = elementRect.bottom + offset; // Отступ от элемента
    tooltip.classList.add("tooltip-bottom"); // Добавляем класс для размещения снизу
  }

  // Проверка на выход за пределы окна (горизонтально)
  if (tooltipPosition.left < 0) {
    tooltipPosition.left = 0; // Придвигаем к левой границе
  } else if (tooltipPosition.left + tooltipRect.width > window.innerWidth) {
    tooltipPosition.left = window.innerWidth - tooltipRect.width; // Придвигаем к правой границе
  }

  // Проверка на выход за пределы окна (вертикально)
  if (tooltipPosition.top + tooltipRect.height > window.innerHeight) {
    tooltipPosition.top = elementRect.top - tooltipRect.height - 10; // Перемещаем тултип наверх элемента
    tooltip.classList.remove("tooltip-bottom"); // Удаляем класс "снизу", если нужно стилизовать
    tooltip.classList.add("tooltip-top"); // Добавляем класс "сверху"
  }
  // Устанавливаем позицию тултипа
  tooltip.style.left = `${tooltipPosition.left}px`;
  tooltip.style.top = `${tooltipPosition.top}px`;

  // Плавное появление тултипа
  tooltip.style.opacity = "1";
}

export function hideTooltip() {
  const tooltip = document.getElementById("tooltip");

  // Убираем тултип сразу
  tooltip.style.opacity = "0"; // Плавное исчезновение
  tooltip.style.display = "none"; // Мгновенное скрытие
  tooltip.classList.remove("tooltip-bottom"); // Убираем класс для тултипа снизу
}

// preloader
const MIN_PRELOADER_DURATION = 1000;

export function hidePreloader() {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    const startTime = new Date().getTime();
    const hideTime = startTime + MIN_PRELOADER_DURATION;

    function removePreloader() {
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    }

    const currentTime = new Date().getTime();
    const delay = Math.max(0, hideTime - currentTime);

    setTimeout(removePreloader, delay);
  }
}

// Универсальная функция для открытия/закрытия справочников
let currentOpenDropdown = null;

export function toggleDropdown(event) {
  const dropdown = event.currentTarget;
  // Если кликнули на уже открытый справочник — закрыть
  if (currentOpenDropdown === dropdown) {
    dropdown.classList.remove("active");
    currentOpenDropdown = null;
    return;
  }

  // Закрыть текущий открытый справочник
  if (currentOpenDropdown) {
    currentOpenDropdown.classList.remove("active");
  }

  // Открыть текущий справочник
  dropdown.classList.add("active");
  currentOpenDropdown = dropdown;

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".dropdown") && currentOpenDropdown) {
      currentOpenDropdown.classList.remove("active");
      currentOpenDropdown = null;
    }
  });
}

export function toggleDropdown1(dropdownId) {
  const dropdown = dropdownId;
  console.log(dropdown);

  // Если кликнули на уже открытый справочник — закрыть
  if (currentOpenDropdown === dropdown) {
    dropdown.classList.remove("active");
    currentOpenDropdown = null;

    return;
  }

  // Закрыть текущий открытый справочник
  if (currentOpenDropdown) {
    currentOpenDropdown.classList.remove("active");
  }

  // Открыть текущий справочник
  dropdown.classList.add("active");
  console.log(dropdown.classList); // Должен включать "active"
  console.log(dropdown.outerHTML); // Должен показать изменённый HTML
  currentOpenDropdown = dropdown;
  console.log(currentOpenDropdown);
}
