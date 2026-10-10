const productionContent = [{
        path: './assets/images/2x.svg',
        text: 'Double Your Productivity'
    },
    {
        path: './assets/images/diagram-prod.svg',
        text: 'Efficiency Increase Per Transfer'
    },
    {
        path: './assets/images/centra-prod.svg',
        text: 'Centralize Your Finances'
    },
    {
        path: './assets/images/130-prod.svg',
        text: 'More Activity'
    }
]

const softwareContent = [{
        path: './assets/images/pocket-software.png',
        text: 'Safe Storage'
    },
    {
        path: './assets/images/finger-software.png',
        text: 'Secure'
    },
    {
        path: './assets/images/finance-software.png',
        text: 'Earn Interest'
    },
    {
        path: './assets/images/family-software.png',
        text: 'Family Plans'
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

const openModalBtn1 = document.getElementById('open-modal-btn1');
const openModalBtn2 = document.getElementById('open-modal-btn2');
const modal = document.getElementById('my-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

const feedbackForm = document.getElementById('feedback-form');

openModalBtn1.addEventListener('click', openModal);
openModalBtn2.addEventListener('click', openModal);

function openModal() {
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

closeModalBtn.addEventListener('click', closeModal);

function closeModal() {
    modal.classList.remove('modal-open');
    document.body.style.overflow = '';
}

feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    alert('Форму успішно відправлено!');
    closeModal();
    feedbackForm.reset();
});