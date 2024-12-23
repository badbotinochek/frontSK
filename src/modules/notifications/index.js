const notifications = document.querySelector(".notifications");

const toastDetails = {
  timer: 5000,
  success: {
    icon: "bx bxs-chevron-down-circle",
    title: "Success:",
  },
  error: {
    icon: "bx bxs-x-circle",
    title: "Error:",
  },
  warning: {
    icon: "bx bxs-error",
    title: "Warning:",
  },
  info: {
    icon: "bx bxs-info-circle",
    title: "Info:",
  },
};

const removeToast = (toast) => {
  toast.classList.add("hide");
  if (toast.timeoutId) clearTimeout(toast.timeoutId);
  setTimeout(() => toast.remove(), 500);
};

const createToast = (id, text) => {
  const { icon, title } = toastDetails[id];
  const toast = document.createElement("li");
  toast.className = `toast ${id}`;
  toast.innerHTML = `<div class="column">
                            <i class="${icon}"></i>
                            <span class="title"> ${text}</span>
                        </div>
                        <i class="bx bx-x" onclick="handleRemoveToast(this)"></i>`;
  notifications.appendChild(toast);
  toast.timeoutId = setTimeout(() => removeToast(toast), toastDetails.timer);
};

window.handleRemoveToast = (element) => {
  removeToast(element.parentElement);
};

export { createToast };
