const API_KEY = "1d3a0eefa97b499d8fbc4ee93eeb40b7";
const url = "https://newsapi.org/v2/everything?q=";

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");
const cardsContainer = document.getElementById("cards-container");
const newsCardTemplate = document.getElementById("template-news-card");
const navItems = document.querySelectorAll(".nav-item");
const hamburgerMenu = document.querySelector(".hamburger-menu");
const navLinks = document.querySelector(".nav-links");

let curSelectedNav = null;

window.addEventListener("load", () => fetchNews("Technology"));

function reload() {
    window.location.reload();
}

async function fetchNews(query) {
    try {
        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        bindData(data.articles);
    } catch (error) {
        console.error("Error fetching news:", error);
        cardsContainer.innerHTML = `<p class="error-message">Failed to load news. Please try again later.</p>`;
    }
}

function bindData(articles) {
    cardsContainer.innerHTML = "";
    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage;
    newsImg.alt = article.title;
    newsTitle.textContent = article.title;
    newsDesc.textContent = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });
    newsSource.textContent = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

function onNavItemClick(id) {
    fetchNews(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = document.getElementById(id);
    curSelectedNav.classList.add("active");
}

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

searchText.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchButton.click();
    }
});

navItems.forEach(item => {
    item.addEventListener("click", () => {
        onNavItemClick(item.id);
        if (window.innerWidth <= 768) {
            toggleMobileMenu();
        }
    });
});

hamburgerMenu.addEventListener("click", toggleMobileMenu);

function toggleMobileMenu() {
    navLinks.classList.toggle("active");
    hamburgerMenu.classList.toggle("active");
}

window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        navLinks.classList.remove("active");
        hamburgerMenu.classList.remove("active");
    }
});

// Dark mode toggle
const darkModeToggle = document.createElement("button");
darkModeToggle.textContent = "🌙";
darkModeToggle.classList.add("dark-mode-toggle");
document.body.appendChild(darkModeToggle);

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});

// Infinite scrolling
let page = 1;
let loading = false;

window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loading) {
        loadMoreNews();
    }
});

async function loadMoreNews() {
    if (loading) return;
    loading = true;
    page++;
    const query = curSelectedNav ? curSelectedNav.id : searchText.value || "Technology";
    try {
        const res = await fetch(`${url}${query}&page=${page}&apiKey=${API_KEY}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        bindData(data.articles);
    } catch (error) {
        console.error("Error fetching more news:", error);
    } finally {
        loading = false;
    }
}