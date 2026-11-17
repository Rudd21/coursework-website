const productionContent = [{
        path: './assets/images/2x.svg',
        text: 'Подвійте свою продуктивність'
    },
    {
        path: './assets/images/diagram-prod.svg',
        text: 'Вища ефективність кожного переказу'
    },
    {
        path: './assets/images/centra-prod.svg',
        text: 'Усі фінанси в одному місці'
    },
    {
        path: './assets/images/130-prod.svg',
        text: 'Більше активності'
    }
]

const softwareContent = [{
        path: './assets/images/pocket-software.png',
        text: 'Надійне зберігання'
    },
    {
        path: './assets/images/finger-software.png',
        text: 'Захищеність'
    },
    {
        path: './assets/images/finance-software.png',
        text: 'Пасивний дохід'
    },
    {
        path: './assets/images/family-software.png',
        text: 'Сімейні тарифи'
    }
]

const productionContainer = document.getElementById('production-content');
const softwareContainer = document.getElementById('software-cards');

productionContainer.innerHTML = productionContent.map((item) =>
    `
    <div class="prod-card">
        <img src="${item.path}" alt="">
        <p class="card-text">${item.text}</p>
    </div>
    `
).join('');

softwareContainer.innerHTML = softwareContent.map((item) =>
    `
    <div class="software-card">
        <img src="${item.path}" alt="">
        <p>${item.text}</p>
    </div>
    `
).join('');

window.addEventListener('scroll', function() {
    const nav = document.getElementById('fixed-nav');

    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

const contactList = document.getElementById('contact-list');
const showButton = document.getElementById('show-button');

showButton.addEventListener('click', function() {
    contactList.classList.toggle('d-flex')
    showButton.classList.toggle('button-close')
})

// Show/Hide Auth Buttons based on session
async function updateHeaderAuth() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    if (session) {
        // User is logged in
        const { data: profile } = await window.supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

        const isAdmin = profile && (profile.role === 'admin' || profile.role === 'staff');

        authButtons.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                ${isAdmin ? `<a href="admin.html" class="login-button" style="text-decoration: none; display: block; text-align: center; border: 1px solid var(--my-lightgreen);">Адмін</a>` : ''}
                <button id="logout-btn" class="get-started-button">Вийти</button>
            </div>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', async () => {
            await window.supabaseClient.auth.signOut();
            location.reload();
        });
    }
}

updateHeaderAuth();

const openModalBtn2 = document.getElementById('open-modal-btn2');
const modal = document.getElementById('my-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

const feedbackForm = document.getElementById('feedback-form');

if(openModalBtn1){
    openModalBtn1.addEventListener('click', openModal);
}
if(openModalBtn2){
    openModalBtn2.addEventListener('click', openModal);
}

function openModal() {
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

closeModalBtn.addEventListener('click', closeModal);

function closeModal() {
    modal.classList.remove('modal-open');
    document.body.style.overflow = '';
}

// Close modal when clicking outside of modal-content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

feedbackForm.addEventListener('submit', (e) => {

    e.preventDefault();

    alert('Форму успішно відправлено!');
    closeModal();
    feedbackForm.reset();
});