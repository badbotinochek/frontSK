export const eventsTemplateElements = {
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
  period: `            
            <div class="modalLabel">
                <label>Дата начала</label>
                <label class="star">*</label>
                <label class="dateEndEventLabel">Дата окончания</label>
            </div>
                <div class="dateTime">
                <div>
                    <input 
                    type="date" 
                    id="dateStartEvent" 
                    class=" requiredField"
                    />
                </div>
                <div>
                    <input 
                    type="date" 
                    id="dateEndEvent" 
                    />
                </div>
            </div>
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

  participant: `
        <div class="modalLabel">
          <label>Участники</label>
        </div>
        <div class="tableContainerParticipant">
          <table class="customTableParticipant">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Имя</th>
                <th>Роли</th>
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
                  class="closeDialogButton"
                >
                  Закрыть
                </button>
              </div>
            `,
  },
  addParticipantButton: `
              <div class="buttons">
                <button 
                  id="openModalAddParticipanButton" 
                  class="createButton">
                  Добавить участника
                </button>
              </div>
            `,
};
export const addParticipantTemplateElements = {
  addParticipant: `
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
            <div class="modalLabel">
                <label>Статус</label>
                <label class="star">*</label>
            </div>
                <div class="modalDropdown" id="modalDropdownRole">
            <input 
                class="modalInput requiredField"   
                id="modalInputStatus" 
                readonly />
            <img
                class="modalSelectShevron"
                src="../../src/modules/transactions/asserts/chevron-down-regular-36.png"
                alt="Chevron"
                />
            <div class="modalOption" id="modalOptionRole">
                <li data-role="Manager">Менеджер</li>
                <li data-role="Partner">Партнер</li>
                <li data-role="Observer">Контролёр</li>
            </div>
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
