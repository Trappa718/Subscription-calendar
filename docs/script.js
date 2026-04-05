// ИКОНКИ (папка images/)
const iconsByDay = {
  16: "images/megafon.png",
  19: "images/vpn.png",
  22: "images/vk-music.png",
  29: "images/wifi.png"
};

const calendarDiv = document.getElementById('calendar');
const monthTitleSpan = document.getElementById('monthTitle');
const prevBtn = document.getElementById('prevMonthBtn');
const nextBtn = document.getElementById('nextMonthBtn');

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

function formatMonthYear(year, month) {
  return `${monthNames[month]} ${year}`;
}

function renderCalendar() {
  calendarDiv.innerHTML = '';
  monthTitleSpan.textContent = formatMonthYear(currentYear, currentMonth);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Пустые ячейки
  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('div');
    empty.className = 'day empty';
    calendarDiv.appendChild(empty);
  }

  // Дни месяца
  const today = new Date();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'day';

    if (currentYear === today.getFullYear() && 
        currentMonth === today.getMonth() && 
        day === today.getDate()) {
      cell.classList.add('today');
    }

    const iconContainer = document.createElement('div');
    iconContainer.className = 'day-icon';
    
    if (iconsByDay[day]) {
      const img = document.createElement('img');
      img.src = iconsByDay[day];
      img.alt = "icon";
      iconContainer.appendChild(img);
    }

    const numberSpan = document.createElement('div');
    numberSpan.className = 'day-number';
    numberSpan.textContent = day;

    cell.appendChild(iconContainer);
    cell.appendChild(numberSpan);
    calendarDiv.appendChild(cell);
  }

  // Добиваем пустыми
  const totalCells = startOffset + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remaining; i++) {
    const empty = document.createElement('div');
    empty.className = 'day empty';
    calendarDiv.appendChild(empty);
  }
}

function prevMonth() {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  renderCalendar();
}

function nextMonth() {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  renderCalendar();
}

prevBtn.onclick = prevMonth;
nextBtn.onclick = nextMonth;
renderCalendar();
