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
  const userIdElement = document.getElementById("userId");
  userIdElement.textContent = userId;
  const userName = localStorage.getItem("user_name");
  userIdElement.textContent = userName;
  userIdElement.setAttribute("data-tooltip", `Ваш ID: ${userId}`);
}

// Объект с ссылками для навигации
const navLinks = {
  transactions: "../../pages/transactions/index.html",
  events: "../../pages/events/index.html",
  accounts: "../../pages/accounts/index.html",
  debts: "../../pages/debts/index.html",
  exist: "../../pages/auth/index.html",
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

export function handleTooltipMouseEnter(event) {
  const target = event.target;

  // Проверяем, есть ли у элемента атрибут data-tooltip
  if (target.hasAttribute("data-tooltip")) {
    const tooltipContent = target.getAttribute("data-tooltip");
    const tooltip = document.getElementById("tooltip");

    // Устанавливаем текст тултипа
    const tooltipTextElem = document.getElementById("tooltipText");
    tooltipTextElem.textContent = tooltipContent;
    const tooltipPosition = calculateTooltipPosition(target, tooltip);

    // Устанавливаем задержку перед показом тултипа
    tooltipTimeout = setTimeout(() => {
      // Показываем тултип с нужной позицией
      showTooltip(tooltip, tooltipPosition);
    }, 600);
  }
}

// Функция для вычисления позиции тултипа
export function calculateTooltipPosition(element, tooltip) {
  // Получаем размеры тултипа после того, как текст добавлен
  tooltip.style.display = "block";
  tooltip.style.visibility = "hidden";
  // Получаем размеры тултипа после того, как текст добавлен
  const tooltipRect = tooltip.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  // Сразу же скрываем тултип обратно
  tooltip.style.display = "none";
  tooltip.style.visibility = "visible";

  let offset = 3; // Отступ для всех элементов по умолчанию
  const position = element.getAttribute("data-tooltip-position");

  let tooltipPosition = {
    top: 0,
    left: 0,
  };

  // Логика позиционирования тултипа в зависимости от значения data-tooltip-position
  if (position === "bottom") {
    tooltipPosition.left =
      elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
    tooltipPosition.top = elementRect.bottom + offset; // Расстояние от элемента
  } else if (position === "right") {
    tooltipPosition.left = elementRect.right + offset; // Расстояние от правого края
    tooltipPosition.top =
      elementRect.top + elementRect.height / 2 - tooltipRect.height / 2; // Центрируем по вертикали
  } else if (position === "over") {
    let offset = 20;

    tooltipPosition.left =
      elementRect.left + elementRect.width / 2 - tooltipRect.width / 2; // Центр тултипа
    tooltipPosition.top = elementRect.top - tooltipRect.height - offset;
  } else {
    // По умолчанию размещаем тултип справа
    tooltipPosition.left = elementRect.right + offset;
    tooltipPosition.top =
      elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
  }
  return tooltipPosition;
}

// Функция для отображения тултипа с позицией
export function showTooltip(tooltip, tooltipPosition) {
  // Исправляем позицию тултипа, если он выходит за пределы экрана
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const tooltipRect = tooltip.getBoundingClientRect();

  if (tooltipPosition.left < 0) {
    tooltipPosition.left = 0; // Левый край экрана
  } else if (tooltipPosition.left + tooltipRect.width > screenWidth) {
    tooltipPosition.left = screenWidth - tooltipRect.width; // Правый край экрана
  }

  if (tooltipPosition.top + tooltipRect.height > screenHeight) {
    tooltipPosition.top = tooltipPosition.top - tooltipRect.height - 3; // Перемещаем вверх
  }

  // Устанавливаем позицию тултипа
  tooltip.style.left = `${tooltipPosition.left}px`;
  tooltip.style.top = `${tooltipPosition.top}px`;

  // Показываем тултип (прозрачность и display)
  tooltip.style.display = "block";
  tooltip.style.opacity = "1";
}

export function handleTooltipMouseLeave(event) {
  const target = event.target;
  // Проверяем, есть ли у элемента атрибут data-tooltip
  if (target.hasAttribute("data-tooltip")) {
    clearTimeout(tooltipTimeout); // Отменяем показ тултипа, если мышь ушла
    hideTooltip(); // Скрываем тултип сразу
  }
}

// export function showTooltip(element, tooltipText, isButton = false) {
//   const tooltip = document.getElementById("tooltip");
//   const tooltipTextElem = document.getElementById("tooltipText");

//   // Устанавливаем текст тултипа
//   tooltipTextElem.textContent = tooltipText;

//   // Показываем тултип
//   tooltip.style.display = "block";
//   // Получаем размеры элемента и тултипа
//   const elementRect = element.getBoundingClientRect();
//   const tooltipRect = tooltip.getBoundingClientRect();

//   // Увеличиваем расстояние для кнопок
//   let offset = 0;
//   if (isButton) {
//     offset = isButton ? 15 : 15;
//   }

//   // Получаем размеры экрана
//   const screenWidth = window.innerWidth;
//   const screenHeight = window.innerHeight;

//   // Позиционируем тултип
//   let tooltipPosition = {
//     top: 0,
//     left: 0,
//   };

//   // Проверяем, есть ли достаточно места справа от элемента
//   if (elementRect.right + tooltipRect.width <= window.innerWidth) {
//     // Если места достаточно, размещаем тултип справа от элемента
//     tooltipPosition.left = elementRect.right + offset; // Отступ от элемента
//     tooltipPosition.top =
//       elementRect.top + elementRect.height / 2 - tooltipRect.height / 2; // Центрируем по вертикали
//   } else if (
//     elementRect.bottom + tooltipRect.height + offset <=
//     window.innerHeight
//   ) {
//     // Если места справа нет, размещаем тултип снизу от элемента
//     tooltipPosition.left =
//       elementRect.left + elementRect.width / 2 - tooltipRect.width / 2; // Центрируем по горизонтали
//     tooltipPosition.top = elementRect.bottom + offset; // Отступ от элемента
//     tooltip.classList.add("tooltip-bottom"); // Добавляем класс для размещения снизу
//   }

//   // Проверка на выход за пределы окна (горизонтально)
//   if (tooltipPosition.left < 0) {
//     tooltipPosition.left = 0; // Придвигаем к левой границе
//   } else if (tooltipPosition.left + tooltipRect.width > window.innerWidth) {
//     tooltipPosition.left = window.innerWidth - tooltipRect.width; // Придвигаем к правой границе
//   }

//   // Проверка на выход за пределы окна (вертикально)
//   if (tooltipPosition.top + tooltipRect.height > window.innerHeight) {
//     tooltipPosition.top = elementRect.top - tooltipRect.height - 10; // Перемещаем тултип наверх элемента
//     tooltip.classList.remove("tooltip-bottom"); // Удаляем класс "снизу", если нужно стилизовать
//     tooltip.classList.add("tooltip-top"); // Добавляем класс "сверху"
//   }
//   // Устанавливаем позицию тултипа
//   tooltip.style.left = `${tooltipPosition.left}px`;
//   tooltip.style.top = `${tooltipPosition.top}px`;

//   // Плавное появление тултипа
//   tooltip.style.opacity = "1";
// }

// export function showTooltip(element, tooltipText, isButton = false) {
//   const tooltip = document.getElementById("tooltip");
//   const tooltipTextElem = document.getElementById("tooltipText");

//   // Устанавливаем текст тултипа
//   tooltipTextElem.textContent = tooltipText;

//   // Показываем тултип
//   tooltip.style.display = "block";

//   // Получаем размеры элемента и тултипа
//   const elementRect = element.getBoundingClientRect();
//   const tooltipRect = tooltip.getBoundingClientRect();

//   // Увеличиваем расстояние для кнопок
//   let offset = isButton ? 15 : 3;

//   // // Определяем позицию тултипа
//   const position = element.getAttribute("data-tooltip-position");
//   let tooltipPosition = {
//     top: 0,
//     left: 0,
//   };

//   // if (position === "bottom") {
//   //   let offset = 10;
//   //   // Размещаем тултип снизу от элемента
//   //   tooltipPosition.left =
//   //     elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
//   //   tooltipPosition.top = elementRect.bottom + offset; // Отступ снизу
//   //   tooltip.classList.add("tooltip-bottom"); // Стилизация для "снизу"
//   //   tooltip.classList.remove("tooltip-top");
//   // } else {
//   //   // Размещаем тултип справа от элемента (по умолчанию)
//   //   tooltipPosition.left = elementRect.right + offset;
//   //   tooltipPosition.top =
//   //     elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
//   //   tooltip.classList.remove("tooltip-bottom");
//   //   tooltip.classList.add("tooltip-right"); // Стилизация для "справа"
//   // }

//   // Проверяем выход тултипа за пределы экрана
//   const screenWidth = window.innerWidth;
//   const screenHeight = window.innerHeight;

//   // Исправляем позицию тултипа, если он выходит за экран
//   if (tooltipPosition.left < 0) {
//     tooltipPosition.left = 0; // Левый край экрана
//   } else if (tooltipPosition.left + tooltipRect.width > screenWidth) {
//     tooltipPosition.left = screenWidth - tooltipRect.width; // Правый край экрана
//   }

//   if (tooltipPosition.top + tooltipRect.height > screenHeight) {
//     tooltipPosition.top = elementRect.top - tooltipRect.height - offset; // Перемещаем вверх
//     tooltip.classList.remove("tooltip-bottom");
//     tooltip.classList.add("tooltip-top");
//   }

//   // Устанавливаем позицию тултипа
//   tooltip.style.left = `${tooltipPosition.left}px`;
//   tooltip.style.top = `${tooltipPosition.top}px`;

//   // Плавное появление тултипа
//   tooltip.style.opacity = "1";
//   console.log(tooltip);
// }

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

// Закрытие любого диалогового окна
export function closeDialog() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}
