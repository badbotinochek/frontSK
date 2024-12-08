export const formTemplates = {
  Expense: `
<div class="modalLabel">
  <label>Дата</label>
  <label class="star">*</label>
  <label class="time">Время</label>
</div>
<div class="dateTimeTransaction">
  <div><input type="date" id="dateTransaction" /></div>
  <div><input type="time" id="timeTransaction" /></div>
</div>
<div class="modalLabel">
  <label>Счет</label>
  <label class="star">*</label>
</div>
<div class="modalDropdown" id="modalDropdownAccount">
  <input placeholder="Выберете счет" id="modalInputAccount" readonly />
   <img
   class="modalSelectShevron"
   src="../../src/modules/transactions/asserts/chevron-down-regular-36.png"
   alt="Chevron"
   />
  <div class="modalOption" id="modalOptionAccount"></div>
</div>
<div class="modalLabel">
  <label>Категория</label>
  <label class="star">*</label>
</div>
<div class="modalDropdown" id="modalDropdownCategory">
  <input
    type="text"
    class="categoryBox"
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
<div class="modalLabel">
  <label>Сумма</label>
  <label class="star">*</label>
</div>
<div>
  <input
    id="sumTransaction"
    class="modalInput"
    placeholder="Введите сумму расхода"
  />
</div>
 <div class ="modalLabel "><label>Описание</label></div>
  <div>
  <textarea class ="modalDescription" name="description" id="ShowdescriptionTran" placeholder="Введите описание к расходу" disabled></textarea>
  </div>

`,
  Income: `
<label for="income-amount">Сумма дохода:</label>
<input type="number" id="income-amount" name="amount" />

<label for="income-source">Источник:</label>
<input type="text" id="income-source" name="source" />

<label for="income-date">Дата:</label>
<input type="date" id="income-date" name="date" />
`,
  Transaction: `
<label for="transaction-amount">Сумма транзакции:</label>
<input type="number" id="transaction-amount" name="amount" />

<label for="transaction-account">Счёт:</label>
<input type="text" id="transaction-account" name="account" />

<label for="transaction-date">Дата:</label>
<input type="date" id="transaction-date" name="date" />
`,
};
