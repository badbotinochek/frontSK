class Toast {
  constructor() {
    this.toastDetails = {
      timer: 500,
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
    this.toast = document.createElement("li");
    this.notifications = document.querySelector(".notifications");
  }

  createToast = (id, text) => {
    const notifications = this.notifications;
    const toast = this.toast;
    const { icon, title } = this.toastDetails[id];

    toast.className = `toast ${id}`;
    toast.innerHTML = `<div class="column">
                            <i class="${icon}"></i>
                            <span class="title">${title} ${text}</span>
                          </div>
                          <i class="bx bx-x" onclick="this.removeToast(this.notifications)"></i>`;
    notifications.appendChild(toast);
  };

  removeToast = () => {
    // залогировать
    const toast = this.toast;
    toast.timeoutId = setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 500);
    }, this.toastDetails.timer);

    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }
    // Реализовать при помощи CSS
  };
}

export const toast = new Toast();
