import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://iqbyisyrzrcatqkxoflk.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYnlpc3lyenJjYXRxa3hvZmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNTY5MDQsImV4cCI6MjA2NjkzMjkwNH0.u49KBdYizMmZjBGrEvY4swAomHkNcAod-OoEfpm6uxs'; 
        
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadRelatedArticles(currentArticleId) {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .not('id', 'eq', currentArticleId) // Exclude the current article
        .order('created_at', { ascending: false })
        .limit(3); // Get 3 latest articles

    if (error) {
        console.error('Error fetching related articles:', error);
        return;
    }

    const relatedListContainer = document.getElementById('related-articles-list');
    relatedListContainer.innerHTML = ''; // Clear any previous content

    if (data && data.length > 0) {
        data.forEach(article => {
            const articleLink = document.createElement('a');
            articleLink.href = `artikel.html?slug=${article.slug}`;
            articleLink.className = 'article-card bg-white rounded-lg shadow-md overflow-hidden block';
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.content || '';
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            const shortContent = textContent.split(' ').slice(0, 15).join(' ') + '...';

            articleLink.innerHTML = `
                <img src="${article.featured_image_url || 'https://placehold.co/600x400/e2e8f0/475569?text=Artikel'}" alt="[Gambar] ${article.title}" class="w-full h-40 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-2 text-gray-800">${article.title}</h3>
                    <p class="text-gray-600 text-sm">${shortContent}</p>
                </div>
            `;
            relatedListContainer.appendChild(articleLink);
        });
    }
}

async function loadSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleSlug = params.get('slug');

    if (!articleSlug) {
        document.getElementById('article-container').innerHTML = '<p class="text-red-500">Error: Artikel tidak ditemukan. Pastikan link Anda benar.</p>';
        return;
    }

    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', articleSlug)
        .single();

    if (error || !data) {
        console.error('Error fetching article:', error);
        document.getElementById('article-title').textContent = 'Artikel Tidak Ditemukan';
        document.getElementById('article-content-main').innerHTML = '<p>Maaf, artikel yang Anda cari tidak dapat ditemukan.</p>';
        return;
    }

    // Populate the page with article data
    document.title = `${data.title} - SANMIN GLOBE`;
    document.getElementById('article-title').textContent = data.title;
    
    const authorEl = document.getElementById('article-author');
    if (data.author) {
        authorEl.textContent = `Oleh ${data.author} • `;
    }

    const dateEl = document.getElementById('article-date');
    dateEl.textContent = `Dipublikasikan pada ${new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;

    const imageEl = document.getElementById('article-image');
    if (data.featured_image_url) {
        imageEl.src = data.featured_image_url;
        imageEl.alt = `[Gambar] ${data.title}`;
        imageEl.classList.remove('hidden');
    }

    document.getElementById('article-content-main').innerHTML = data.content;

    // After loading the main article, load related articles
    loadRelatedArticles(data.id);
}

document.addEventListener('DOMContentLoaded', () => {
    loadSingleArticle();
});
