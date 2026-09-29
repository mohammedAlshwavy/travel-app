/* ==========================================================================
   رحلاتي PRO - Engine & Booking State Management
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initSearchAndFilters();
    initUniversalBookingButtons();
    renderDashboardBookings();
    initCheckoutPage();
});

/* --------------------------------------------------------------------------
   1. إدارة المظهر (Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const target = current === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', target);
            localStorage.setItem('app-theme', target);
            
            if (themeIcon) {
                themeIcon.className = target === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
            
            showToast(target === 'dark' ? 'تم تفعيل الوضع الداكن 🌙' : 'تم تفعيل الوضع النهاري ☀️');
        });
    }
}

/* --------------------------------------------------------------------------
   2. القائمة الجانبية للهواتف المحمولة
   -------------------------------------------------------------------------- */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav-links');
    if (btn && nav) {
        btn.addEventListener('click', () => nav.classList.toggle('active'));
    }
}

/* --------------------------------------------------------------------------
   3. الفلترة والترتيب الفوري للنتائج (Live Filtering)
   -------------------------------------------------------------------------- */
function initSearchAndFilters() {
    // محاكاة نموذج البحث الرئيسي
    const forms = document.querySelectorAll('.real-search-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const origText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري البحث...`;
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = origText;
                submitBtn.disabled = false;
                showToast('تم تحديث نتائج البحث وفقاً لمدخلاتك ✨');
            }, 800);
        });
    });

    // الفلترة الفورية عند التغيير في الخيارات الجانبية
    const filterInputs = document.querySelectorAll('.filter-sidebar input, .filter-sidebar select');
    filterInputs.forEach(input => {
        input.addEventListener('change', () => {
            const cards = document.querySelectorAll('.result-card');
            cards.forEach(card => card.style.opacity = '0.4');
            
            setTimeout(() => {
                cards.forEach(card => card.style.opacity = '1');
                showToast('تم تطبيق الفلترة الفورية');
            }, 300);
        });
    });
}

/* --------------------------------------------------------------------------
   4. التقاط أزرار الحجز ونقل البيانات إلى صفحة الدفع (booking.html)
   -------------------------------------------------------------------------- */
function initUniversalBookingButtons() {
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.real-book-btn');
        if (!btn) return;

        e.preventDefault();
        const card = btn.closest('.result-card');
        if (!card) return;

        const title = card.querySelector('h2, h3')?.innerText || 'خدمة سفر مؤكدة';
        const price = card.querySelector('.price')?.innerText || '500 ر.س';
        const spec = card.querySelector('.room-spec, .flight-type, .pickup-loc')?.innerText || 'تفاصيل حجز قياسي';
        
        // تحديد نوع الخدمة بناءً على الصفحة الحالية
        let type = 'flight';
        if (window.location.pathname.includes('hotel')) type = 'hotel';
        if (window.location.pathname.includes('car')) type = 'car';

        const pendingBooking = { title, price, spec, type };
        localStorage.setItem('pending_booking', JSON.stringify(pendingBooking));
        
        // التحويل المباشر لصفحة الدفع والتأكيد
        window.location.href = 'booking.html';
    });
}

/* --------------------------------------------------------------------------
   5. صفحة الدفع وتأكيد الحجز (booking.html)
   -------------------------------------------------------------------------- */
function initCheckoutPage() {
    const checkoutSummary = document.getElementById('checkout-summary');
    if (!checkoutSummary) return;

    const pending = JSON.parse(localStorage.getItem('pending_booking'));
    if (!pending) {
        checkoutSummary.innerHTML = `
            <h3>لا يوجد حجز معلق حالياً</h3>
            <p style="color: var(--text-muted); margin-top: 5px;">يرجى العودة واختيار رحلة أو فندق أو سيارة أولاً.</p>
        `;
        return;
    }

    checkoutSummary.innerHTML = `
        <h3>${pending.title}</h3>
        <p style="color: var(--text-muted); margin: 8px 0;">${pending.spec}</p>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary); margin-top: 10px;">
            المبلغ الإجمالي: ${pending.price}
        </div>
    `;

    const payForm = document.getElementById('checkout-form');
    if (payForm) {
        payForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // توليد رمز حجز فريد بحسب الخدمة
            const prefix = pending.type === 'hotel' ? 'HTL-' : pending.type === 'car' ? 'CAR-' : 'FL-';
            const bookingId = prefix + Math.floor(10000 + Math.random() * 90000);

            const newBooking = {
                id: bookingId,
                type: pending.type,
                title: pending.title,
                info: pending.spec,
                date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
                price: pending.price
            };

            let bookings = JSON.parse(localStorage.getItem('user_bookings')) || [];
            bookings.unshift(newBooking);
            localStorage.setItem('user_bookings', JSON.stringify(bookings));
            localStorage.removeItem('pending_booking');

            showToast(`تمت عملية الدفع وتأكيد الحجز (#${bookingId}) بنجاح! 🚀`);
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);
        });
    }
}

/* --------------------------------------------------------------------------
   6. عرض وإدارة الحجوزات وإحصائياتها (dashboard.html)
   -------------------------------------------------------------------------- */
function renderDashboardBookings() {
    const list = document.getElementById('dynamic-booking-list');
    if (!list) return;

    let bookings = JSON.parse(localStorage.getItem('user_bookings')) || [];

    // تحديث الأرقام الإحصائية
    const fCount = bookings.filter(b => b.type === 'flight').length;
    const hCount = bookings.filter(b => b.type === 'hotel').length;
    const cCount = bookings.filter(b => b.type === 'car').length;

    if (document.getElementById('stat-flights')) document.getElementById('stat-flights').innerText = fCount;
    if (document.getElementById('stat-hotels')) document.getElementById('stat-hotels').innerText = hCount;
    if (document.getElementById('stat-cars')) document.getElementById('stat-cars').innerText = cCount;

    // حالة عدم وجود حجوزات
    if (bookings.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding: 50px 20px;" class="card-box">
                <i class="fa-solid fa-suitcase-rolling" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 15px;"></i>
                <h3>لا توجد حجوزات نشطة حالياً</h3>
                <p style="color: var(--text-muted); margin-top: 5px;">ابدأ باستكشاف الخيارات واحجز رحلتك القادمة الآن!</p>
            </div>`;
        return;
    }

    // بناء كروت الحجوزات
    let html = '';
    bookings.forEach(item => {
        html += `
            <div class="result-card" data-id="${item.id}">
                <div>
                    <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
                        <span style="background:var(--primary-light); color:var(--primary); padding:3px 10px; border-radius:6px; font-weight:700; font-size:0.85rem;">حجز مؤكد</span>
                        <small style="color:var(--text-muted);">رقم الحجز: #${item.id}</small>
                    </div>
                    <h2>${item.title}</h2>
                    <p style="color: var(--text-muted); margin-top:4px;">${item.info}</p>
                    <small style="color: var(--text-muted); display:block; margin-top:6px;">تاريخ الحجز: ${item.date}</small>
                </div>
                <div class="price-box">
                    <span class="price">${item.price}</span>
                    <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
                        <button class="action-btn primary" onclick="window.print()"><i class="fa-solid fa-print"></i> طباعة</button>
                        <button class="action-btn secondary" onclick="openEditModal('${item.id}')"><i class="fa-solid fa-pen"></i> تعديل</button>
                        <button class="action-btn danger" onclick="deleteBooking('${item.id}')"><i class="fa-solid fa-trash"></i> إلغاء</button>
                    </div>
                </div>
            </div>`;
    });
    list.innerHTML = html;
}

/* --------------------------------------------------------------------------
   7. ميزة تعديل الحجز (Edit Booking Modal Functions)
   -------------------------------------------------------------------------- */
function openEditModal(id) {
    let bookings = JSON.parse(localStorage.getItem('user_bookings')) || [];
    let item = bookings.find(b => b.id === id);
    if (item) {
        document.getElementById('edit-booking-id').value = item.id;
        document.getElementById('edit-booking-title').value = item.title;
        document.getElementById('edit-booking-info').value = item.info;
        document.getElementById('edit-booking-date').value = item.date;
        document.getElementById('editModal').style.display = 'flex';
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'none';
}

function saveBookingEdit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-booking-id').value;
    let bookings = JSON.parse(localStorage.getItem('user_bookings')) || [];
    let idx = bookings.findIndex(b => b.id === id);

    if (idx !== -1) {
        bookings[idx].title = document.getElementById('edit-booking-title').value;
        bookings[idx].info = document.getElementById('edit-booking-info').value;
        bookings[idx].date = document.getElementById('edit-booking-date').value;

        localStorage.setItem('user_bookings', JSON.stringify(bookings));
        closeEditModal();
        renderDashboardBookings();
        showToast('تم حفظ التعديلات الجديدة بنجاح! ✏️');
    }
}

/* --------------------------------------------------------------------------
   8. إلغاء الحجز ديناميكياً
   -------------------------------------------------------------------------- */
function deleteBooking(id) {
    if (confirm(`هل أنت متأكد من إلغاء الحجز رقم (#${id})؟`)) {
        let bookings = JSON.parse(localStorage.getItem('user_bookings')) || [];
        bookings = bookings.filter(b => b.id !== id);
        localStorage.setItem('user_bookings', JSON.stringify(bookings));
        renderDashboardBookings();
        showToast('تم إلغاء الحجز وتحديث القائمة 🗑️');
    }
}

/* --------------------------------------------------------------------------
   9. نظام الإشعارات المنبثقة (Toast Notifications)
   -------------------------------------------------------------------------- */
function showToast(msg) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add('toast-show');
    
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('toast-show');
    }, 3000);
}