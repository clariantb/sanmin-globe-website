import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://iqbyisyrzrcatqkxoflk.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYnlpc3lyenJjYXRxa3hvZmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNTY5MDQsImV4cCI6MjA2NjkzMjkwNH0.u49KBdYizMmZjBGrEvY4swAomHkNcAod-OoEfpm6uxs'; 

let supabase;
let allProducts = [];
let allArticles = [];
let allServices = [];

// --- FETCH FUNCTIONS with Error Handling ---
async function loadProductsFromSupabase() {
    if (!supabase) return { error: { message: "Supabase client not initialized." } };
    const { data, error } = await supabase.from('products').select('id, name, category, image_url, description');
    if (error) {
        console.error('Error fetching products:', error);
        return { error };
    }
    allProducts = data || [];
    return { data };
}

async function loadArticlesFromSupabase() {
    if (!supabase) return { error: { message: "Supabase client not initialized." } };
    const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching articles:', error);
        return { error };
    }
    allArticles = data || [];
    return { data };
}

async function loadServicesFromSupabase() {
    if (!supabase) return { error: { message: "Supabase client not initialized." } };
    const { data, error } = await supabase.from('services').select('*');
    if (error) {
        console.error('Error fetching services:', error);
        return { error };
    }
    allServices = data || [];
    return { data };
}

// --- RENDER FUNCTIONS ---
function renderProducts() {
    const productContent = document.getElementById('product-content');
    const productPlaceholder = document.getElementById('product-placeholder');
    
    document.querySelectorAll('[id$="-list"]').forEach(list => {
        const category = list.id.replace('-list', '');
        const categoryProducts = allProducts.filter(p => p.category && p.category.includes(category));
        const targetElement = list;
        targetElement.innerHTML = '';
        if (categoryProducts.length === 0) {
            targetElement.innerHTML = '<p class="text-center col-span-full text-gray-500">Belum ada produk untuk kategori ini.</p>';
            return;
        }
        categoryProducts.forEach(product => {
            const listItem = document.createElement('li');
            listItem.className = 'product-item bg-white rounded-lg p-4 shadow-sm border';
            listItem.dataset.productId = product.id;
            let innerHTML = '';
            if (product.image_url) {
                innerHTML = `<div class="flex flex-col items-center text-center"><img src="${product.image_url}" alt="[Gambar ${product.name}]" class="h-24 w-24 object-cover rounded-md mb-2" onerror="this.style.display='none'"><span class="font-semibold">${product.name}</span></div>`;
            } else {
                innerHTML = `<div class="flex flex-col items-center text-center h-full justify-center p-4"><span class="font-semibold">${product.name}</span></div>`;
            }
            listItem.innerHTML = innerHTML;
            targetElement.appendChild(listItem);
        });
    });

    // Hide placeholder, show content with animation
    productPlaceholder.classList.add('hidden');
    productContent.classList.remove('hidden');
    productContent.classList.add('fade-in');
}

function renderSearchResults(query) {
     const searchResultsList = document.getElementById('search-results-list');
     searchResultsList.innerHTML = '';
     if (!query) {
        return;
     }
     const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(query));
     if (filteredProducts.length === 0) {
         searchResultsList.innerHTML = '<p class="text-center col-span-full text-gray-500">Tidak ada produk yang cocok.</p>';
         return;
     }
      filteredProducts.forEach(product => {
        const listItem = document.createElement('li');
        listItem.className = 'product-item bg-white rounded-lg p-4 shadow-sm border';
        listItem.dataset.productId = product.id;
        let innerHTML = '';
        if (product.image_url) {
            innerHTML = `<div class="flex flex-col items-center text-center"><img src="${product.image_url}" alt="[Gambar ${product.name}]" class="h-24 w-24 object-cover rounded-md mb-2" onerror="this.style.display='none'"><span class="font-semibold">${product.name}</span></div>`;
        } else {
            innerHTML = `<div class="flex flex-col items-center text-center h-full justify-center p-4"><span class="font-semibold">${product.name}</span></div>`;
        }
        listItem.innerHTML = innerHTML;
        searchResultsList.appendChild(listItem);
    });
}

function renderArticles() {
    const articleListContainer = document.getElementById('article-list');
    articleListContainer.innerHTML = ''; // Clear placeholder
    if(allArticles.length === 0) {
        articleListContainer.innerHTML = '<p class="text-center col-span-full text-gray-500">Belum ada artikel yang dipublikasikan.</p>';
        return;
    }
    allArticles.forEach(article => {
        const articleLink = document.createElement('a');
        articleLink.href = `artikel.html?slug=${article.slug}`;
        articleLink.className = 'article-card bg-white rounded-lg shadow-md overflow-hidden block';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.content || '';
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const shortContent = textContent.split(' ').slice(0, 20).join(' ') + '...';
        articleLink.innerHTML = `
            <img src="${article.featured_image_url || 'https://placehold.co/600x400/e2e8f0/475569?text=Artikel'}" alt="[Gambar] ${article.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2 text-gray-800">${article.title}</h3>
                <p class="text-gray-600 mb-4">${shortContent}</p>
                <span class="text-blue-600 font-semibold hover:underline">Baca Selengkapnya &rarr;</span>
            </div>
        `;
        articleListContainer.appendChild(articleLink);
    });
    // Add fade-in animation to the container
    articleListContainer.classList.add('fade-in');
}

// --- MODAL FUNCTIONS ---
function openProductModal(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    const modal = document.getElementById('product-modal');
    modal.querySelector('#modal-product-name').textContent = product.name;
    modal.querySelector('#modal-product-description').innerHTML = product.description ? product.description : '<p>Tidak ada deskripsi.</p>';
    const img = modal.querySelector('#modal-product-image');
    if (product.image_url) {
        img.src = product.image_url;
        img.classList.remove('hidden');
    } else {
        img.classList.add('hidden');
    }
    modal.classList.remove('hidden');
}

function openServiceModal(serviceId) {
    const details = allServices.find(s => s.id === serviceId);
    if (!details) return;

    const modal = document.getElementById('service-modal');
    modal.querySelector('#modal-service-title').textContent = details.title;
    modal.querySelector('#modal-service-content').innerHTML = details.content;
    
    modal.classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const [productsResult, articlesResult, servicesResult] = await Promise.all([
        loadProductsFromSupabase(),
        loadArticlesFromSupabase(),
        loadServicesFromSupabase()
    ]);

    // Handle Product Loading 
    if (productsResult.error) {
        document.getElementById('product-display-area').innerHTML = '<p class="text-center text-red-500">Gagal memuat produk. Silakan coba lagi nanti.</p>';
    } else {
        renderProducts();
    }

    // Handle Article Loading 
    if (articlesResult.error) {
        document.getElementById('article-list').innerHTML = '<p class="text-center text-red-500">Gagal memuat artikel. Silakan coba lagi nanti.</p>';
    } else {
        renderArticles();
    }
    
    // --- UI LOGIC & EVENT LISTENERS ---
    const searchInput = document.getElementById('product-search-input');
    const productContent = document.getElementById('product-content');
    const searchResultsContainer = document.getElementById('search-results-container');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query) {
            productContent.classList.add('hidden');
            searchResultsContainer.classList.remove('hidden');
            renderSearchResults(query);
        } else {
            productContent.classList.remove('hidden');
            searchResultsContainer.classList.add('hidden');
        }
    });

    document.getElementById('modal-product-close-btn').addEventListener('click', () => closeModal('product-modal'));
    document.getElementById('product-modal').addEventListener('click', (e) => { if (e.target.id === 'product-modal') closeModal('product-modal'); });
    
    document.getElementById('modal-service-close-btn').addEventListener('click', () => closeModal('service-modal'));
    document.getElementById('service-modal').addEventListener('click', (e) => { if (e.target.id === 'service-modal') closeModal('service-modal'); });
    
    document.body.addEventListener('click', (e) => {
        const productItem = e.target.closest('.product-item');
        if (productItem) {
            openProductModal(productItem.dataset.productId);
        }
        
        const serviceItem = e.target.closest('.service-item');
        if (serviceItem) {
            openServiceModal(serviceItem.dataset.serviceId);
        }
    });

    document.getElementById('mobile-menu-button').addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.dataset.target).classList.add('active');
        });
    });
    
    const heroCategoryLinks = document.querySelectorAll('.hero-category-link');
    heroCategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetCategory = this.dataset.target;
            const targetTabButton = document.querySelector(`.tab-btn[data-target="${targetCategory}"]`);
            if (targetTabButton) {
                targetTabButton.click();
            }
            document.getElementById('produk').scrollIntoView({ behavior: 'smooth' });
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    document.querySelectorAll('.scroll-animate').forEach(section => {
        observer.observe(section);
    });
});

