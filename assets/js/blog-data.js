const blogPosts = [
    {
        id: 1,
        title: "The Future of Digital Banking",
        excerpt: "Discover how technology is transforming the way we handle money in 2024 and beyond.",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        date: "2024-05-15",
        image: "../assets/images/header-image.png"
    },
    {
        id: 2,
        title: "Maximizing Your Productivity",
        excerpt: "Learn the top tips and tricks to get more done in less time with Etran's tools.",
        content: "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam.",
        date: "2024-05-10",
        image: "../assets/images/card-benefit.png"
    },
    {
        id: 3,
        title: "Secure Transfers Explained",
        excerpt: "How we keep your money safe during every transaction using advanced encryption.",
        content: "Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.",
        date: "2024-05-05",
        image: "../assets/images/image-breaker.jpg"
    }
];

// If we are on the main page, render the latest 3 posts
if (document.getElementById('blog-posts-container')) {
    const blogContainer = document.getElementById('blog-posts-container');
    blogContainer.innerHTML = blogPosts.slice(0, 3).map(post => `
        <div class="blog-card">
            <img src="${post.image}" alt="${post.title}">
            <div class="blog-card-info">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="pages/article.html?id=${post.id}" class="read-more">Read More</a>
            </div>
        </div>
    `).join('');
}

// If we are on the blog list page, render all posts
if (document.getElementById('all-blog-posts')) {
    const allPostsContainer = document.getElementById('all-blog-posts');
    allPostsContainer.innerHTML = blogPosts.map(post => `
        <div class="blog-card">
            <img src="${post.image}" alt="${post.title}">
            <div class="blog-card-info">
                <span class="blog-date">${post.date}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="article.html?id=${post.id}" class="read-more">Read More</a>
            </div>
        </div>
    `).join('');
}

// If we are on a single article page, load the content based on ID
if (document.getElementById('article-content')) {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const post = blogPosts.find(p => p.id === id);

    if (post) {
        document.getElementById('article-title').innerText = post.title;
        document.getElementById('article-image').src = post.image;
        document.getElementById('article-date').innerText = post.date;
        document.getElementById('article-body').innerText = post.content;
        document.title = `${post.title} | Etran`;
    } else {
        window.location.href = '404.html';
    }
}
