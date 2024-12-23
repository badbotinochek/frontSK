export const debtTemplateElements = {
  id: `
        <div class="modalLabel">
          <label>Уникальный идентификатор</label>
        </div>
        <input 
          id="inputId" 
          class="modalInput disabled" 
        />
      `,
  amount: `
        <div class="modalLabel">
          <label>Сумма</label>
          <label class="star">*</label>
        </div>
        <input 
          id="inputAmount" 
          class="modalInput requiredField" 
          placeholder="Введите сумму" 
          autocomplete="off" 
        />
      `,
  currency: `
        <div class="modalLabel">
          <label>Валюта</label>
          <label class="star">*</label>
        </div>
        <input 
          id="inputCurrency" 
          class="modalInput requiredField" 
          type="text" 
          placeholder="Введите валюту (например, рубль)" 
        />
      `,
  percentageRate: `
        <div class="modalLabel">
        <label>Процентная ставка</label>
        <label class="star">*</label>
        </div>
        <input 
          id="inputPercentageRate" 
          class="modalInput requiredField" 
          placeholder="Введите процентную ставку" 
        />
      `,
  dueDate: `
        <div class="modalLabel">
          <label>Дата возврата</label>
          <label class="star">*</label>
        </div>
        <input 
          id="inputDueDate" 
          class="modalInput requiredField" 
          type="date" 
        />
      `,
  debtor: `
        <div class="modalLabel">
        <label>Должник</label>
        <label class="star">*</label>
        </div>
        <input 
          id="inputDebtor" 
          class="modalInput requiredField" 
          type="text" 
          placeholder="Введите имя должника" 
        />
      `,
  creditor: `
        <div class="modalLabel">
        <label>Займодатель</label>
        <label id=starCreditor class="star">*</label>
        </div>
        <input 
          id="inputCreditor" 
          class="modalInput requiredField" 
          type="text" 
          placeholder="Введите имя займодателя" 
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
  closedAt: `
        <div class="modalLabel">
          <label>Дата закрытия</label>
        </div>
        <input 
          id="inputClosedAt" 
          class="modalInput" 
          type="date" 
          placeholder="Выберите дату закрытия " 
        />
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
};
