const blogPosts = []; // We will fetch from Supabase

let activeTag = 'All';
let searchQuery = '';
let sortOrder = 'newest';

// Function to fetch posts from Supabase
async function fetchPosts() {
    const { data, error } = await window.supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
    return data;
}

// If we are on the main page, render the latest 4 posts
async function initMainBlog() {
    const blogContainer = document.getElementById('blog-posts-container');
    if (!blogContainer) return;

    const posts = await fetchPosts();
    const displayPosts = posts.slice(0, 4);
    
    blogContainer.innerHTML = displayPosts.map(post => `
        <div class="blog-card">
            <img src="${post.image}" alt="${post.title}">
            <div class="blog-card-info">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="pages/article.html?id=${post.id}" class="read-more">Читати більше</a>
            </div>
        </div>
    `).join('');

    if (displayPosts.length === 0) {
        blogContainer.innerHTML = '<p>Поки що немає публікацій.</p>';
    }
}

// Function to render posts on blog.html
async function initBlogList() {
    const allPostsContainer = document.getElementById('all-blog-posts');
    if (!allPostsContainer) return;

    const posts = await fetchPosts();
    
    window.allBlogPosts = posts; // Save for filtering

    renderBlogList(posts);
    renderTags(posts);

    // Event Listeners for blog.html
    document.getElementById('blog-search').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderBlogList(window.allBlogPosts);
    });

    document.getElementById('sort-date').addEventListener('change', (e) => {
        sortOrder = e.target.value;
        renderBlogList(window.allBlogPosts);
    });
}

function renderBlogList(posts) {
    const allPostsContainer = document.getElementById('all-blog-posts');
    
    let filteredPosts = posts.filter(post => {
        const matchesTag = activeTag === 'All' || (post.tags && post.tags.includes(activeTag));
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTag && matchesSearch;
    });

    // Sorting
    filteredPosts.sort((a, b) => {
        return sortOrder === 'newest' 
            ? new Date(b.created_at) - new Date(a.created_at) 
            : new Date(a.created_at) - new Date(b.created_at);
    });

    allPostsContainer.innerHTML = filteredPosts.map(post => `
        <div class="blog-card">
            <img src="${post.image}" alt="${post.title}">
            <div class="blog-card-info">
                <div class="tags-container">
                    ${post.tags ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <span class="blog-date">${new Date(post.created_at).toLocaleDateString()}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="article.html?id=${post.id}" class="read-more">Читати більше</a>
            </div>
        </div>
    `).join('');

    if (filteredPosts.length === 0) {
        allPostsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem;">Нічого не знайдено за вашим запитом.</p>';
    }
}

// Function to render tags filter
function renderTags(posts) {
    const tagsContainer = document.getElementById('blog-tags');
    if (!tagsContainer) return;

    const allTags = ['All', ...new Set(posts.flatMap(post => post.tags || []))];
    
    tagsContainer.innerHTML = allTags.map(tag => `
        <span class="tag ${tag === activeTag ? 'active' : ''}" data-tag="${tag}">${tag === 'All' ? 'Всі' : tag}</span>
    `).join('');

    tagsContainer.querySelectorAll('.tag').forEach(tagEl => {
        tagEl.addEventListener('click', () => {
            activeTag = tagEl.dataset.tag;
            renderTags(posts);
            renderBlogList(posts);
        });
    });
}

// Initializations
initMainBlog();
initBlogList();

// --- COMMENTS & SUBSCRIPTIONS LOGIC ---

async function initComments(postId) {
    const list = document.getElementById('comments-list');
    const form = document.getElementById('comment-form');
    const reminder = document.getElementById('auth-reminder');
    if (!list) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    let isBanned = false;
    if (session) {
        // Перевіряємо статус бану в профілі
        const { data: profile } = await window.supabaseClient
            .from('profiles')
            .select('is_banned')
            .eq('id', session.user.id)
            .maybeSingle();
        
        isBanned = profile ? profile.is_banned : false;

        if (isBanned) {
            form.style.display = 'none';
            reminder.style.display = 'block';
            reminder.innerHTML = '<span style="color: red;">Ваш акаунт заблоковано. Ви не можете залишати коментарі.</span>';
        } else {
            form.style.display = 'block';
            reminder.style.display = 'none';
        }
    } else {
        form.style.display = 'none';
        reminder.style.display = 'block';
    }

    const { data: comments, error } = await window.supabaseClient
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

    if (error) return console.error('Error loading comments:', error);

    list.innerHTML = comments.map(c => `
        <div style="border-bottom: 1px solid #eee; padding: 1.5rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <strong style="color: var(--my-darkgreen); font-size: 0.8rem; background: #f0f0f0; padding: 2px 8px; border-radius: 4px;">ID: ${c.user_id.substring(0, 8)}...</strong>
                <small style="color: #999;">${new Date(c.created_at).toLocaleDateString()} ${new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
            </div>
            <p style="color: var(--my-gray); line-height: 1.5;">${c.content}</p>
        </div>
    `).join('');

    if (comments.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem 0;">Будьте першим, хто залишить коментар!</p>';
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const content = document.getElementById('comment-text').value;
        const { error } = await window.supabaseClient.from('comments').insert([{
            post_id: postId,
            user_id: session.user.id,
            user_email: session.user.email,
            content: content
        }]);

        if (error) alert('Помилка: ' + error.message);
        else {
            document.getElementById('comment-text').value = '';
            initComments(postId);
        }
    };
}

async function initSubscription(postTags) {
    const container = document.getElementById('sub-tags-list');
    const section = document.getElementById('subscription-section');
    const btn = document.getElementById('subscribe-btn');
    if (!container || !postTags) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';

    const { data: currentSub } = await window.supabaseClient
        .from('subscriptions')
        .select('tags')
        .eq('user_id', session.user.id)
        .maybeSingle();

    const activeTags = currentSub ? currentSub.tags : [];
    
    container.innerHTML = postTags.map(tag => `
        <label style="cursor:pointer; background: #fff; padding: 8px 15px; border-radius: 20px; border: 1px solid var(--my-green); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" value="${tag}" ${activeTags.includes(tag) ? 'checked' : ''}> ${tag}
        </label>
    `).join('');

    btn.onclick = async () => {
        const selected = Array.from(container.querySelectorAll('input:checked')).map(i => i.value);
        const { error } = await window.supabaseClient
            .from('subscriptions')
            .upsert({ user_id: session.user.id, tags: selected }, { onConflict: 'user_id' });
        
        if (error) alert('Помилка: ' + error.message);
        else alert('Налаштування підписки оновлено успішно!');
    };
}

// Single Article Logic
async function initSingleArticle() {
    if (!document.getElementById('article-content')) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    const { data: post, error } = await window.supabaseClient
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (post) {
        document.getElementById('article-title').innerText = post.title;
        document.getElementById('article-image').src = post.image;
        document.getElementById('article-date').innerText = new Date(post.created_at).toLocaleDateString();
        document.getElementById('article-body').innerHTML = post.content; // Changed to innerHTML to support formatted content
        document.title = `${post.title} | Etran`;

        // Initialize comments and subscriptions
        initComments(post.id);
        initSubscription(post.tags);
    } else {
        window.location.href = '404.html';
    }
}

initSingleArticle();
