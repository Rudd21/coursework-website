const loginForm = document.getElementById('admin-login-form');
const authSection = document.getElementById('admin-auth');
const dashboardSection = document.getElementById('admin-dashboard');
const postsTableBody = document.getElementById('admin-posts-list');

const postModal = document.getElementById('post-modal');
const deleteModal = document.getElementById('delete-modal');

const postForm = document.getElementById('post-form');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
let currentDeleteId = null;

// 1. Check Session on Load
async function checkSession() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    if (session) {
        const isAdmin = await verifyAdminRole(session.user.id);
        if (isAdmin) {
            showDashboard();
        } else {
            alert('Доступ заборонено. Ви не є адміністратором.');
            await window.supabaseClient.auth.signOut();
        }
    }
}
// 2. Login Handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            alert('Помилка входу: ' + error.message);
            return;
        }
        const isAdmin = await verifyAdminRole(data.user.id);
        if (isAdmin) {
            showDashboard();
        } else {
            alert('Цей акаунт не має прав адміністратора.');
            await window.supabaseClient.auth.signOut();
        }
    });
}
// 3. Role Verification
async function verifyAdminRole(userId) {
    const { data, error } = await window.supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    if (error || !data) return false;
    
    window.userRole = data.role; // Save role globally
    return data.role === 'admin' || data.role === 'staff';
}
function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'flex';
    
    // Setup Navigation
    const navItems = document.querySelectorAll('.admin-nav-item[data-section]');
    const views = document.querySelectorAll('.admin-view');

    // Hide Users tab for Staff
    const usersNavItem = document.querySelector('.admin-nav-item[data-section="users-section"]');
    if (window.userRole === 'staff' && usersNavItem) {
        usersNavItem.style.display = 'none';
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            
            // Toggle classes
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Toggle views
            views.forEach(v => v.style.display = 'none');
            document.getElementById(sectionId).style.display = 'block';

            // Load specific data
            if (sectionId === 'blog-section') loadPosts();
            if (sectionId === 'admin-section') loadStaff();
            if (sectionId === 'users-section') loadUsers();
        });
    });

    loadPosts();
}

// --- STAFF & USERS MANAGEMENT ---

async function loadStaff() {
    const { data, error } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'staff'])
        .order('role');

    if (error) return console.error(error);

    const list = document.getElementById('admin-staff-list');
    list.innerHTML = data.map(profile => `
        <tr style="border-bottom: 1px solid var(--my-background-gray);">
            <td style="padding: 1rem 0;">${profile.email}</td>
            <td><span class="role-badge role-${profile.role}">${profile.role.toUpperCase()}</span></td>
            <td>
                ${profile.role === 'staff' && window.userRole === 'admin' ? 
                    `<button onclick="updateRole('${profile.id}', 'user')" style="color: #ff6b6b; border:none; background:none; cursor:pointer;">Зняти Staff</button>` : ''}
            </td>
        </tr>
    `).join('');

    // Setup Add Staff Section
    const addStaffContainer = document.getElementById('add-staff-container');
    const isAdmin = window.userRole === 'admin';
    
    if (isAdmin) {
        addStaffContainer.style.display = 'block';
        const showFormBtn = document.getElementById('show-add-staff-form');
        const formWrap = document.getElementById('add-staff-form-wrap');
        const userSelect = document.getElementById('user-to-staff-select');
        
        showFormBtn.onclick = async () => {
            showFormBtn.style.display = 'none';
            formWrap.style.display = 'flex';
            
            // Fetch users to populate select
            const { data: users } = await window.supabaseClient
                .from('profiles')
                .select('id, email')
                .eq('role', 'user');
            
            userSelect.innerHTML = users.map(u => `<option value="${u.id}">${u.email}</option>`).join('');
            if (users.length === 0) {
                userSelect.innerHTML = '<option disabled>Немає доступних користувачів</option>';
            }
        };

        document.getElementById('confirm-add-staff').onclick = async () => {
            const userId = userSelect.value;
            if (userId) {
                await updateRole(userId, 'staff');
                formWrap.style.display = 'none';
                showFormBtn.style.display = 'block';
            }
        };
    }
}

async function loadUsers() {
    const { data, error } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Load Users Error:", error);
        return;
    }

    const list = document.getElementById('admin-users-list');
    list.innerHTML = data.map(user => {
        // Додаємо захист від порожньої дати
        const dateStr = user.created_at 
            ? new Date(user.created_at).toLocaleDateString() 
            : 'Невідомо';

        return `
            <tr style="border-bottom: 1px solid var(--my-background-gray); ${user.is_banned ? 'background: #fff0f0;' : ''}">
                <td style="padding: 1rem 0;">
                    ${user.email} 
                    ${user.is_banned ? '<span style="color: red; font-size: 0.7rem; font-weight: bold;">[BANNED]</span>' : ''}
                </td>
                <td style="font-size: 0.7rem; color: #999;">${user.id}</td>
                <td>${dateStr}</td>
                <td>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="updateRole('${user.id}', 'staff')" style="color: var(--my-green); border:none; background:none; cursor:pointer;">Назначити</button>
                        <button onclick="toggleBan('${user.id}', ${user.is_banned})" style="color: ${user.is_banned ? '#4a90e2' : '#ff6b6b'}; border:none; background:none; cursor:pointer; font-weight: bold;">
                            ${user.is_banned ? 'Розбанити' : 'Забанити'}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Додайте функцію toggleBan:
async function toggleBan(userId, currentStatus) {
    const { error } = await window.supabaseClient
        .from('profiles')
        .update({ is_banned: !currentStatus })
        .eq('id', userId);

    if (error) alert(error.message);
    else loadUsers();
}

// Зробіть її глобальною
window.toggleBan = toggleBan;

async function updateRole(userId, newRole) {
    const { error } = await window.supabaseClient
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) alert(error.message);
    else {
        loadStaff();
        loadUsers();
    }
}

// Make globally accessible for onclick
window.updateRole = updateRole;

// 4. Load Data
async function loadPosts() {
    const { data, error } = await window.supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    const isAdmin = window.userRole === 'admin';

    postsTableBody.innerHTML = data.map(post => `
        <tr style="border-bottom: 1px solid var(--my-background-gray);">
            <td style="padding: 1rem 0;">${post.title}</td>
            <td>${new Date(post.created_at).toLocaleDateString()}</td>
            <td><span style="background: #e1f5fe; color: #0288d1; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Опубліковано</span></td>
            <td>
                <button class="edit-btn" data-id="${post.id}" style="background: none; border: none; color: var(--my-green); cursor: pointer; margin-right: 10px;">Редагувати</button>
                ${isAdmin ? `<button class="delete-btn" data-id="${post.id}" style="background: none; border: none; color: #ff6b6b; cursor: pointer;">Видалити</button>` : ''}
            </td>
        </tr>
    `).join('');
    // Attach listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    
    if (isAdmin) {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
        });
    }
}

// CRUD Operations
document.getElementById('add-post-btn').addEventListener('click', () => {
    postForm.reset();
    document.getElementById('post-id').value = '';
    document.getElementById('modal-form-title').innerText = 'Створити статтю';
    document.getElementById('post-image-preview').style.display = 'none';
    postModal.style.display = 'flex';
});

async function openEditModal(id) {
    const { data: post, error } = await window.supabaseClient.from('posts').select('*').eq('id', id).single();
    if (error) return alert('Помилка завантаження статті');

    document.getElementById('post-id').value = post.id;
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-excerpt').value = post.excerpt;
    document.getElementById('post-content').value = post.content;
    document.getElementById('post-tags').value = post.tags ? post.tags.join(', ') : '';
    document.getElementById('post-image-url').value = post.image;
    
    if (post.image) {
        const preview = document.getElementById('post-image-preview');
        preview.src = post.image;
        preview.style.display = 'block';
    }

    document.getElementById('modal-form-title').innerText = 'Редагувати статтю';
    postModal.style.display = 'flex';
}

function openDeleteModal(id) {
    currentDeleteId = id;
    deleteModal.style.display = 'flex';
}

confirmDeleteBtn.addEventListener('click', async () => {
    const { error } = await window.supabaseClient.from('posts').delete().eq('id', currentDeleteId);
    if (error) alert('Помилка видалення: ' + error.message);
    else {
        deleteModal.style.display = 'none';
        loadPosts();
    }
});

// Image Upload Logic
document.getElementById('post-image-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { data, error } = await window.supabaseClient.storage
        .from('blog-assets')
        .upload(filePath, file);

    if (error) {
        alert('Помилка завантаження фото: ' + error.message);
        return;
    }

    const { data: { publicUrl } } = window.supabaseClient.storage
        .from('blog-assets')
        .getPublicUrl(filePath);

    document.getElementById('post-image-url').value = publicUrl;
    const preview = document.getElementById('post-image-preview');
    preview.src = publicUrl;
    preview.style.display = 'block';
});

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('post-id').value;
    const postData = {
        title: document.getElementById('post-title').value,
        excerpt: document.getElementById('post-excerpt').value,
        content: document.getElementById('post-content').value,
        tags: document.getElementById('post-tags').value.split(',').map(t => t.trim()),
        image: document.getElementById('post-image-url').value
    };

    let result;
    if (id) {
        result = await window.supabaseClient.from('posts').update(postData).eq('id', id);
    } else {
        // Додаємо .select() щоб отримати створений об'єкт
        result = await window.supabaseClient.from('posts').insert([postData]).select();
        
        // Якщо пост створено успішно — запускаємо розсилку через Edge Function
        if (!result.error && result.data) {
            const newPost = result.data[0];
            notifySubscribers(newPost);
        }
    }

    if (result.error) {
        alert('Помилка збереження: ' + result.error.message);
    } else {
        postModal.style.display = 'none';
        loadPosts();
    }
});

// --- EMAIL NOTIFICATIONS (Edge Function) ---

async function notifySubscribers(post) {
    console.log('Викликаємо Edge Function для розсилки...');

    try {
        const { data, error } = await window.supabaseClient.functions.invoke('notify-subscribers', {
            body: { post }
        });

        if (error) throw error;
        console.log('Відповідь сервера розсилки:', data);
    } catch (err) {
        console.error('Помилка при виклику Edge Function:', err);
    }
}

checkSession();
