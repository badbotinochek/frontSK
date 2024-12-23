export const templateElements = {
  id: `
  <div class="modalLabel">
    <label>Уникальный идентификатор</label>
  </div>
  <input 
    id="inputId" 
    class="modalInput disabled" 
  />
`,
  date: `
    <div class="modalLabel">
      <label>Дата</label>
      <label class="star">*</label>
      <label class="time">Время</label>
    </div>
    <div class="dateTimeTransaction">
      <div><input type="date" id="dateTransaction" class="requiredField"/></div>
      <div><input type="time" id="timeTransaction" /></div>
    </div>
  `,
  sourceAccount: `
    <div class="modalLabel">
      <label>Счет списания</label>
      <label class="star">*</label>
    </div>
    <div class="modalDropdown" id="modalDropdownSourceAccount">
      <input 
        class="requiredField"   
        id="modalInputSourceAccountId" 
        placeholder="Выберете счет списания" 
        readonly />
      <img
        class="modalSelectShevron"
        src="../../src/modules/transactions/asserts/chevron-down-regular-36.png"
        alt="Chevron"
        />
      <div class="modalOption" id="modalOptionAccount"></div>
    </div>
  `,
  targetaccount: `
    <div class="modalLabel">
      <label>Счет зачисления</label>
      <label class="star">*</label>
    </div> 
    <div class="modalDropdown" id="modalDropdownTargetAccount">
      <input 
      class="requiredField" 
      id="modalInputTargetAccountId" 
      placeholder="Выберете счет зачисления" 
      readonly />
      <img
      class="modalSelectShevron"
      src="../../src/modules/transactions/asserts/chevron-down-regular-36.png"
      alt="Chevron"
      />
      <div class="modalOption" id="modalOptionAccount"></div>
    </div>
  `,
  category: `
    <div class="modalLabel">
      <label>Категория</label>
      <label class="star">*</label>
    </div>
    <div class="modalDropdown" id="modalDropdownCategory">
      <input
        class="requiredField"
        id="modalInputCategoryId"
        placeholder="Выберете категорию"
        readonly
      />
      <img
      class="modalSelectShevron"
      src="../../src/modules/transactions/asserts/chevron-down-regular-36.png"
      alt="Chevron"
      />
      <div class="modalOption" id="modalOptionCategory"></div>
    </div>
  `,
  amountExpense: `
    <div class="modalLabel">
      <label>Сумма</label>
      <label class="star">*</label>
    </div>
    <div>
      <input
        id="inputAmountExpense"
        class="modalInput requiredField"
        placeholder="Введите сумму"
        autocomplete="off"
      />
    </div>
  `,
  amountIncome: `
  <div class="modalLabel">
    <label>Сумма</label>
    <label class="star">*</label>
  </div>
  <div>
    <input
      id="inputAmountIncome"
      class="modalInput requiredField"
      placeholder="Введите сумму"
      autocomplete="off"
    />
  </div>
`,
  amountTransfer: `
  <div class="modalLabel">
    <label>Сумма</label>
    <label class="star">*</label>
  </div>
  <div>
    <input
      id="inputAmountTransfer"
      class="modalInput requiredField"
      placeholder="Введите сумму"
      autocomplete="off"
    />
  </div>
  `,
  description: `
  <div class ="modalLabel "><label>Описание</label></div>
    <div>
    <textarea 
      class ="modalDescription" 
      name="description" 
      id="modalInputDescription" 
      placeholder="Введите описание"
      autocomplete="off">
    </textarea>
    </div>
  `,
  transferFee: `
    <div class="modalLabel">
      <label>Коммисия</label>
    </div>
    <div>
      <input
        id="inputTransferFee"
        class="modalInput"
        placeholder="Введите комиссию за перевод"/>
    </div>
    `,
  text: `
    <p>Выполнить действие?</p>
  `,
  buttons: {
    create: (entity) => {
      return `
        <div class="buttons">
          <button 
            type="button" 
            class="createButton disable" 
            id="buttonCreate${entity}"
            data-tooltip="Заполните обязательные параметры"
            data-tooltip-position="over">
            Создать
          </button>
          <button 
            type="button" 
            class="closeDialogButton">
            Закрыть
          </button>
        </div>
      `;
    },
    edit: (entity) => {
      return `
      <div class="buttons">
        <button 
          type="button" 
          class="editButton disable" 
           id="buttonEdit${entity}"
          data-tooltip="Измените значения"
          data-tooltip-position="over">
          Сохранить
        </button>
        <button 
          type="button" 
          class="closeDialogButton">
          Закрыть
        </button>
      </div>
    `;
    },
    view: () => `
      <div class="buttons">
        <button 
          class="createButton disable" 
          data-tooltip="В режиме просмотра кнопка неактивна"
          data-tooltip-position="over">
          Сохранить
        </button>
        <button 
          type="button" 
          class="closeDialogButton">
          Закрыть
        </button>
      </div>
    `,
    delete: () => `
      <div class="buttons">
        <button 
          type="button" 
          class="createButton">
          Да
        </button>
        <button 
          type="button" 
          class="closeDialogButton">
          Закрыть
        </button>
      </div>
    `,
  },
};
