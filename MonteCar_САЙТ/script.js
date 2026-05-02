document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Инициализация иконок Lucide ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- 2. Плавная прокрутка для меню ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); 
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80; // Отступ под фиксированное меню
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth" 
                });
            }
        });
    });

    // --- 3. Автовыбор услуги при клике на карточку ---
    const clickableItems = document.querySelectorAll('[data-service]');
    const serviceSelect = document.getElementById('usluga');
    const contactSection = document.getElementById('contact');

    clickableItems.forEach(item => {
        item.addEventListener('click', () => {
            const serviceName = item.getAttribute('data-service');
            
            // Выбираем услугу в выпадающем списке
            if (serviceName && serviceSelect) {
                serviceSelect.value = serviceName;
            }

            // Скроллим к форме контактов
            if (contactSection) {
                const headerOffset = 80; 
                const elementPosition = contactSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- 4. Анимация отправки формы + Telegram ---
    const form = document.getElementById('zayawka');
    const submitBtn = form ? form.querySelector('.zhdem') : null;

    if (form && submitBtn) {
        
        // Сохраняем оригинальный текст кнопки, чтобы вернуть его потом
        const originalText = submitBtn.innerText;

        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Отменяем перезагрузку страницы

            // 1. ЗАПУСК АНИМАЦИИ ЗАГРУЗКИ
            submitBtn.disabled = true; // Блокируем кнопку, чтобы не кликали дважды
            submitBtn.innerHTML = '<span class="loader"></span> Отправка...'; // Меняем текст и добавляем спиннер
            submitBtn.style.background = 'transparent'; // Убираем фон при загрузке
            submitBtn.style.borderColor = '#fff';       // Оставляем белую рамку

            // Сбор данных из полей
            const name = document.getElementById('name').value;
            const tel = document.getElementById('tel').value;
            const avto = document.getElementById('avto').value;
            
            const selectElement = document.getElementById('usluga');
            const serviceText = selectElement.options[selectElement.selectedIndex].text;

            // === НАСТРОЙКИ TELEGRAM ===
            const BOT_TOKEN = '8698193221:AAFZwm-KpUU-Emv-ZT-GVAEPqNy90gWG2Rk'; 
            const CHAT_IDS = ['7083853915', '455652720']; 
            
            const message = `
🚘 <b>Новая заявка MonteCar</b>

👤 <b>Имя:</b> ${name}
📞 <b>Телефон:</b> ${tel}
🚗 <b>Авто:</b> ${avto}
🛠 <b>Услуга:</b> ${serviceText}
            `;

            // Создаем запросы для каждого ID
            const requests = CHAT_IDS.map(id => {
                const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
                return fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: id,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });
            });

            // Отправляем все запросы
            Promise.all(requests)
                .then(responses => {
                    const anyOk = responses.some(r => r.ok);
                    
                    if (anyOk) {
                        // 2. АНИМАЦИЯ УСПЕХА
                        submitBtn.style.background = '#4ade80'; // Ярко-зеленый цвет
                        submitBtn.style.borderColor = '#4ade80'; // Зеленая рамка
                        submitBtn.style.color = '#000';          // Черный текст для контраста
                        submitBtn.innerHTML = '<i data-lucide="check" width="24" height="24"></i> Отправлено!'; // Галочка и текст
                        
                        // Пересоздаем иконки Lucide, чтобы появилась галочка
                        if (typeof lucide !== 'undefined') lucide.createIcons();

                        form.reset(); // Очищаем поля формы
                    } else {
                        alert('Ошибка при отправке. Попробуйте позже.');
                        resetButton(); // Возвращаем кнопку в исходное состояние
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Произошла ошибка сети.');
                    resetButton();
                });

            // Функция возврата кнопки в исходное состояние через 3 секунды
            function resetButton() {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.background = ''; // Сброс стиля (вернется к CSS)
                    submitBtn.style.borderColor = '';
                    submitBtn.style.color = '';
                    submitBtn.innerText = originalText;
                }, 3000);
            }
        });
    }
});