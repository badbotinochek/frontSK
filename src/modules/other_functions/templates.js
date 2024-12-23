const templateElements = {
  date: `
      <div class="modalLabel">
        <label>Дата</label>
        <label class="star">*</label>
      </div>
      <input id="dateTransaction" class="requiredField" type="date"/>
    `,
  time: `
      <div class="modalLabel">
        <label>Время</label>
      </div>
      <input id="timeTransaction type="time"/>
    `,
  sourceAccount: `
      <div class="modalLabel">
        <label>Счет списания</label>
        <label class="star">*</label>
      </div>
      <div id="modalDropdownSourceAccount" class="modalDropdown">
        <input 
            id="modalInputSourceAccountId"     
            class="requiredField" 
            placeholder="Выберите счет" 
            readonly/>
        <img class="modalSelectShevron" src="chevron-down.png" alt="Chevron" />
        <div id="modalOptionAccount" class="modalOption"> 
        </div>
      </div>
    `,
  targetAccount: `
      <div class="modalLabel">
        <label>Счет зачисления</label>
        <label class="star">*</label>
      </div>
      <div class="modalDropdown" id="modalDropdownTargetAccount">
        <input 
        id="modalInputTargetAccountId" 
        class="requiredField" 
        placeholder="Выберите счет" 
        readonly/>
        <img class="modalSelectShevron" src="chevron-down.png" alt="Chevron" />
        <div class="modalOption" id="modalOptionAccount"></div>
      </div>
    `,
  amount: `
      <div class="modalLabel">
        <label>Сумма</label>
        <label class="star">*</label>
      </div>
      <input 
        id="inputAmount" 
        class="modalInput 
        type="number" 
        requiredField" 
        placeholder="Введите сумму"/>
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
  category: `
        <div class="modalDropdown" id="modalDropdownCategory">
        <input 
            id="modalInputCategoryId"
            class="requiredField" 
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
  transferFee: `
        <div class="modalLabel">
            <label>Коммисия</label>
        </div>
        <input
            id="inputTransferFee"
            class="modalInput"
            placeholder="Введите комиссию за перевод"/>
    `,
  buttons: {
    create: (entity) => `
        <div class="buttons">
          <button type="button" id="buttonCreate${entity}" class="createButton disable" data-tooltip="Заполните обязательные параметры">
              Создать
          </button>
          <button type="button" id="buttonCloseDialog${entity}" class="closeDialogButton">
              Закрыть
          </button>
        </div>
      `,
    edit: (entity) => `
        <div class="buttons">
            <button type="submit" id="buttonChange${entity}" class="editButton">
                Сохранить
            </button>
            <button type="button" id="buttonCloseDialog${entity}" class="closeDialogButton">
                Закрыть
            </button>
        </div>
        `,
    view: (entity) => `
        <div class="buttons">
            <button type="button" id="buttonCloseDialog${entity}" class="closeDialogButton">
                Закрыть
            </button>
        </div>
        `,
  },
};

const confirmationDialogTemplate = (action, entity) => `
  <div class="confirmation-dialog">
    <p>Вы уверены, что хотите ${
      action === "delete" ? "удалить" : "выполнить действие"
    }?</p>
    <div class="buttonsConfirmation">
      <button type="button" id="buttonConfirm${action}${entity}" class="confirmButton">Да</button>
      <button type="button" id="buttonCancel${action}${entity}" class="cancelButton">Нет</button>
    </div>
  </div>
`;
