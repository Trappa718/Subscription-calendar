let subscriptions = [];
let currentYear = 2026;
let currentMonth = 2;
let selectedDay = null;

function loadSubscriptions() {
    const stored = localStorage.getItem('subscription_calendar_app');
    if (stored) {
        try {
            subscriptions = JSON.parse(stored);
        } catch(e) { subscriptions = []; }
    }
    if (subscriptions.length === 0) {
        subscriptions = [
            { id: Date.now() + 1, name: "YouTube Premium", price: 399, dayOfMonth: 8 },
            { id: Date.now() + 2, name: "Apple Music", price: 169, dayOfMonth: 13 },
            { id: Date.now() + 3, name: "Кинопоиск", price: 299, dayOfMonth: 22 },
            { id: Date.now() + 4, name: "PS Plus", price: 599, dayOfMonth: 28 }
        ];
        saveSubscriptions();
    }
}

function saveSubscriptions() {
    localStorage.setItem('subscription_calendar_app', JSON.stringify(subscriptions));
}

function addSubscription(name, price, day) {
    if (!name.trim()) name = "Без названия";
    const priceNum = parseFloat(price);
    const finalPrice = isNaN(priceNum) ? 0 : priceNum;
    const newSub = {
        id: Date.now(),
        name: name.trim(),
        price: finalPrice,
        dayOfMonth: parseInt(day)
    };
    subscriptions.push(newSub);
    saveSubscriptions();
    renderAll();
}

function deleteSubscription(id) {
    subscriptions = subscriptions.filter(sub => sub.id !== id);
    saveSubscriptions();
    renderAll();
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayIndex(year, month) {
    let firstDay = new Date(year, month, 1);
    let dayOfWeek = firstDay.getDay();
    if (dayOfWeek === 0) return 6;
    return dayOfWeek - 1;
}

function buildCalendar(year, month) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayIndex(year, month);
    const totalCells = 42;
    const calendarDays = [];
    const prevMonthDays = getDaysInMonth(year, month - 1);
    
    for (let i = 0; i < totalCells; i++) {
        let dayNumber = null;
        let isCurrentMonth = true;
        let cellMonth = month;
        let cellYear = year;
        
        if (i < firstDayIndex) {
            const prevDate = prevMonthDays - (firstDayIndex - i) + 1;
            dayNumber = prevDate;
            isCurrentMonth = false;
            let prevMonth = month - 1;
            let prevYear = year;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear = year - 1;
            }
            cellMonth = prevMonth;
            cellYear = prevYear;
        } else if (i >= firstDayIndex + daysInMonth) {
            const nextIndex = i - (firstDayIndex + daysInMonth);
            dayNumber = nextIndex + 1;
            isCurrentMonth = false;
            let nextMonth = month + 1;
            let nextYear = year;
            if (nextMonth > 11) {
                nextMonth = 0;
                nextYear = year + 1;
            }
            cellMonth = nextMonth;
            cellYear = nextYear;
        } else {
            dayNumber = i - firstDayIndex + 1;
            isCurrentMonth = true;
            cellMonth = month;
            cellYear = year;
        }
        
        const subsForDay = subscriptions.filter(sub => sub.dayOfMonth === dayNumber);
        calendarDays.push({
            dayNumber,
            isCurrentMonth,
            fullDate: { year: cellYear, month: cellMonth, day: dayNumber },
            hasSubscriptions: subsForDay.length > 0,
            subscriptionsCount: subsForDay.length,
            subsList: subsForDay
        });
    }
    return calendarDays;
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    monthYearDisplay.innerText = `${monthNames[currentMonth]} ${currentYear}`;
    
    const daysData = buildCalendar(currentYear, currentMonth);
    grid.innerHTML = '';
    
    daysData.forEach((cell) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-cell';
        if (!cell.isCurrentMonth) dayDiv.classList.add('empty');
        
        const isSelected = (selectedDay && selectedDay.year === cell.fullDate.year && 
                            selectedDay.month === cell.fullDate.month && 
                            selectedDay.day === cell.fullDate.day);
        if (isSelected) dayDiv.classList.add('selected');
        
        const numberSpan = document.createElement('div');
        numberSpan.className = 'day-number';
        numberSpan.innerText = cell.dayNumber;
        dayDiv.appendChild(numberSpan);
        
        if (cell.hasSubscriptions) {
            if (cell.subscriptionsCount === 1) {
                const dot = document.createElement('div');
                dot.className = 'subscription-dot';
                dayDiv.appendChild(dot);
            } else if (cell.subscriptionsCount >= 2) {
                const multiBadge = document.createElement('div');
                multiBadge.className = 'badge-multi';
                multiBadge.innerText = `${cell.subscriptionsCount}`;
                dayDiv.appendChild(multiBadge);
            }
        }
        
        dayDiv.addEventListener('click', () => {
            if (!cell.isCurrentMonth) {
                if (cell.fullDate.month !== currentMonth || cell.fullDate.year !== currentYear) {
                    currentMonth = cell.fullDate.month;
                    currentYear = cell.fullDate.year;
                    selectedDay = null;
                    renderCalendar();
                    setTimeout(() => {
                        selectedDay = { year: cell.fullDate.year, month: cell.fullDate.month, day: cell.dayNumber };
                        renderCalendar();
                        renderSubscriptionsPanel(selectedDay);
                    }, 0);
                } else {
                    selectedDay = { year: cell.fullDate.year, month: cell.fullDate.month, day: cell.dayNumber };
                    renderCalendar();
                    renderSubscriptionsPanel(selectedDay);
                }
            } else {
                selectedDay = { year: cell.fullDate.year, month: cell.fullDate.month, day: cell.dayNumber };
                renderCalendar();
                renderSubscriptionsPanel(selectedDay);
            }
        });
        
        grid.appendChild(dayDiv);
    });
    
    if (!selectedDay) {
        const today = new Date();
        if (today.getFullYear() === currentYear && today.getMonth() === currentMonth) {
            selectedDay = { year: currentYear, month: currentMonth, day: today.getDate() };
        } else {
            selectedDay = { year: currentYear, month: currentMonth, day: 1 };
        }
        renderSubscriptionsPanel(selectedDay);
    } else {
        renderSubscriptionsPanel(selectedDay);
    }
}

function renderSubscriptionsPanel(dateObj) {
    if (!dateObj) return;
    const { year, month, day } = dateObj;
    const monthNamesLocal = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const label = `${day} ${monthNamesLocal[month]} ${year}`;
    document.getElementById('selectedDateLabel').innerText = label;
    
    const daySubs = subscriptions.filter(sub => sub.dayOfMonth === day);
    const container = document.getElementById('subscriptionsListContainer');
    if (daySubs.length === 0) {
        container.innerHTML = `<div class="empty-subscriptions">✨ Нет платежей на этот день<br>Нажмите «+», чтобы добавить</div>`;
        return;
    }
    
    container.innerHTML = '';
    daySubs.forEach(sub => {
        const subDiv = document.createElement('div');
        subDiv.className = 'sub-item';
        const iconLetter = sub.name.charAt(0).toUpperCase();
        subDiv.innerHTML = `
            <div class="sub-icon">${iconLetter}</div>
            <div class="sub-info">
                <div class="sub-name">${escapeHtml(sub.name)}</div>
                <div class="sub-price">${sub.price > 0 ? sub.price + ' ₽' : 'Бесплатно'}</div>
            </div>
            <div class="sub-date-badge">${sub.dayOfMonth} число</div>
            <button class="delete-sub-btn" data-id="${sub.id}" style="background: none; border: none; font-size: 20px; cursor: pointer; color:#9E9E9E;">🗑️</button>
        `;
        container.appendChild(subDiv);
    });
    
    document.querySelectorAll('.delete-sub-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            if (confirm('Удалить подписку?')) deleteSubscription(id);
        });
    });
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderAll() {
    renderCalendar();
}

function populateDaySelect() {
    const select = document.getElementById('subDaySelect');
    select.innerHTML = '<option value="" disabled selected>— день списания —</option>';
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = `${i} число`;
        select.appendChild(option);
    }
}

const modal = document.getElementById('modal');
const openBtn = document.getElementById('openModalBtn');
const cancelBtn = document.getElementById('cancelModalBtn');
const confirmBtn = document.getElementById('confirmAddBtn');

openBtn.addEventListener('click', () => {
    document.getElementById('subName').value = '';
    document.getElementById('subPrice').value = '';
    document.getElementById('subDaySelect').value = '';
    modal.style.display = 'flex';
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

confirmBtn.addEventListener('click', () => {
    const name = document.getElementById('subName').value;
    const price = document.getElementById('subPrice').value;
    const day = document.getElementById('subDaySelect').value;
    if (!day) {
        alert('Выберите день списания');
        return;
    }
    addSubscription(name, price, day);
    modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

const monthHeaderDiv = document.getElementById('monthYearDisplay');
const navDiv = document.createElement('div');
navDiv.style.display = 'flex';
navDiv.style.gap = '12px';
navDiv.style.alignItems = 'center';
const prevBtn = document.createElement('button');
prevBtn.innerText = '◀';
prevBtn.style.background = '#F0F2F5';
prevBtn.style.border = 'none';
prevBtn.style.borderRadius = '30px';
prevBtn.style.width = '36px';
prevBtn.style.height = '36px';
prevBtn.style.fontSize = '18px';
prevBtn.style.cursor = 'pointer';
const nextBtn = document.createElement('button');
nextBtn.innerText = '▶';
nextBtn.style.cssText = prevBtn.style.cssText;
navDiv.appendChild(prevBtn);
navDiv.appendChild(nextBtn);
monthHeaderDiv.parentNode.insertBefore(navDiv, monthHeaderDiv.nextSibling);

prevBtn.addEventListener('click', () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    }
    currentMonth = newMonth;
    currentYear = newYear;
    selectedDay = null;
    renderAll();
});

nextBtn.addEventListener('click', () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    }
    currentMonth = newMonth;
    currentYear = newYear;
    selectedDay = null;
    renderAll();
});

loadSubscriptions();
populateDaySelect();
currentYear = 2026;
currentMonth = 2;
selectedDay = null;
renderAll();
