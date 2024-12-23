export const accountsTemplateElements = {
  id: `
          <div class="modalLabel">
            <label>Уникальный идентификатор</label>
          </div>
          <input 
            id="inputId" 
            class="modalInput disabled" 
          />
        `,
  name: `
          <div class="modalLabel">
            <label>Наименование</label>
            <label class="star">*</label>
          </div>
          <input 
            id="inputName" 
            class="modalInput requiredField" 
            placeholder="Введите название" 
            autocomplete="off" 
          />
        `,
  description: `
        <div class="modalLabel">
          <label>Описание</label>
        </div>
        <textarea 
          id="modalInputDescription" 
          class="modalDescription" 
          placeholder="Введите описание">
        </textarea>
      `,
  status: `
        <div class="modalLabel">
        <label>Статус</label>
        <label class="star">*</label>
        </div>
        <div class="modalDropdown" id="modalDropdownStatus">
            <input 
                class="modalInput requiredField"   
                id="modalInputStatus" 
                readonly />
            <img
                class="modalSelectShevron"
                src="../../src/modules/transactions/asserts/chevron-down-regular-36.png"
                alt="Chevron"
                />
            <div class="modalOption" id="modalOptionStatus">
                <li data-blocked="true">Активный</li>
                <li data-blocked="false">Архивный</li>
            </div>
        </div>
    `,
  coowners: `
      <div class="modalLabel">
        <label>Совладельцы счета</label>
      </div>
      <div class="tableContainerAccount">
        <table class="customTableAccount">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Имя</th>
              <th class="smallRow">Действия</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    `,
  buttons: {
    create: `
            <div class="buttons">
              <button 
                type="button" 
                class="createButton disable" 
                data-tooltip="Заполните обязательные параметры"
                data-tooltip-position="over"
              >
                Создать
              </button>
              <button 
                type="button" 
                id="buttonCloseDialogDebt" 
                class="closeDialogButton"
              >
                Закрыть
              </button>
            </div>
          `,
    edit: `
            <div class="buttons">
              <button 
               type="button" 
                class="editButton disable" 
                data-tooltip="Заполните обязательные параметры"
                data-tooltip-position="over"
              >
                Сохранить
              </button>
              <button 
                type="button" 
                id="buttonCloseDialogDebt" 
                class="closeDialogButton"
              >
                Закрыть
              </button>
            </div>
          `,
    view: `
            <div class="buttons">
              <button 
                class="viewButton disable" 
                data-tooltip="В режиме просмотра кнопка неактивна"
                data-tooltip-position="over"
              >
                Сохранить
              </button>
              <button 
                type="button" 
                id="buttonCloseDialogDebt" 
                class="closeDialogButton"
              >
                Закрыть
              </button>
            </div>
          `,
  },
  shareButton: `
            <div class="buttons">
              <button 
                id="openModalAddUserButton" 
                class="createButton">
                Поделиться счетом
              </button>
            </div>
          `,
};
export const addUserTemplateElements = {
  addUser: `
          <div class="modalLabel">
            <label>Уникальный идентификатор пользователя</label> 
            <label class="star">*</label>
          </div>
          <div>
            <input 
              id="inputIdUser" 
              class="modalInput requiredField" 
              placeholder="Введите ID пользователя" 
              autocomplete="off" 
          </div>
          <div class="buttons">
            <button 
              class="createButton disable"
              data-tooltip="Заполните обязательные параметры"
              data-tooltip-position="over"
              >
              Сохранить
            </button>
            <button 
              id="closeAdditionalModal" 
              type="button" 
              class="closeDialogButton"
              >
              Закрыть
            </button>
          </div>
        `,
};

export const deleteUserTemplateElements = {
  deleteUser: `
         <p>Выполнить действие?</p>
        <div class="buttons">
            <button 
              class="createButton"
              >
              Да
            </button>
            <button 
              id="closeAdditionalModal" 
              type="button" 
              class="closeDialogButton"
              >
              Закрыть
            </button>
          </div>
        `,
};
