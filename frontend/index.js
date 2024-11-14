import { backend } from "declarations/backend";

let quill;

// Initialize Quill editor
document.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    loadPosts();
    setupEventListeners();
});

async function loadPosts() {
    showLoader();
    try {
        const posts = await backend.getAllPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
    } finally {
        hideLoader();
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = posts.map(post => `
        <article class="post">
            <h2 class="post-title">${post.title}</h2>
            <div class="post-meta">
                By ${post.author} • ${new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}
            </div>
            <div class="post-content">
                ${post.body}
            </div>
        </article>
    `).join('');
}

function setupEventListeners() {
    const modal = document.getElementById('modal');
    const newPostBtn = document.getElementById('newPostBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const postForm = document.getElementById('postForm');

    newPostBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        quill.setContents([]);
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    postForm.addEventListener('submit', handleSubmit);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

async function handleSubmit(event) {
    event.preventDefault();
    showLoader();

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = quill.root.innerHTML;

    try {
        await backend.createPost(title, content, author);
        document.getElementById('modal').style.display = 'none';
        document.getElementById('postForm').reset();
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
    } finally {
        hideLoader();
    }
}

function showLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}
