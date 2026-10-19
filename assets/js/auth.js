const authForm = document.getElementById('auth-form');
const modalTitle = document.getElementById('modal-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authSwitch = document.getElementById('auth-switch');

let isSignUp = false;

// Buttons to open auth modal
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        openAuthModal(false);
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        openAuthModal(true);
    });
}

function openAuthModal(signup) {
    isSignUp = signup;
    feedbackForm.classList.add('d-none');
    authForm.classList.remove('d-none');
    
    updateAuthUI();
    
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

function updateAuthUI() {
    if (isSignUp) {
        modalTitle.innerText = 'Create Account';
        authSubmitBtn.innerText = 'Sign Up';
        authSwitch.innerHTML = 'Already have an account? <span>Login</span>';
    } else {
        modalTitle.innerText = 'Login to Etran';
        authSubmitBtn.innerText = 'Login';
        authSwitch.innerHTML = "Don't have an account? <span>Sign Up</span>";
    }
}

authSwitch.addEventListener('click', () => {
    isSignUp = !isSignUp;
    updateAuthUI();
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    try {
        if (isSignUp) {
            const { data, error } = await window.supabaseClient.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            alert('Реєстрація успішна! Перевірте пошту для підтвердження.');
        } else {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            alert('Вхід успішний!');
            window.location.href = './pages/admin.html';
        }
        closeModal();
    } catch (error) {
        alert('Помилка: ' + error.message);
    }
});

function closeModal() {
    modal.classList.remove('modal-open');
    document.body.style.overflow = '';
}
