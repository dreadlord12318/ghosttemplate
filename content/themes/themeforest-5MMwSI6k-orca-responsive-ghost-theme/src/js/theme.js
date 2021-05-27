/* global hljs svg4everybody reframe GhostSearch */

'use strict';


// CONFIG

function eckoConfig(config, item) {
    if (
        typeof window[config] !== 'undefined'
        && Object.prototype.hasOwnProperty.call(window[config], item)
        && window[config][item] !== ''
    ) {
        return window[config][item];
    }
    return false;
}


// SCROLL

function scrollToTop() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
    });
}


// SVG

function configureSVG() {
    if (
        navigator.appName === 'Microsoft Internet Explorer'
        || !!(navigator.userAgent.match(/Trident/)
        || navigator.userAgent.match(/rv:11/))
        || (navigator.userAgent.includes('MSIE'))
    ) {
        if (typeof svg4everybody() !== 'undefined') {
            svg4everybody();
        }
    }
}


// IMAGE ALT

function configureImageAlt() {
    const imageElements = document.querySelectorAll('img');
    imageElements.forEach((imageElement) => {
        const imageAltAttr = imageElement.getAttribute('alt');
        if (
            typeof imageAltAttr === typeof undefined
            || imageAltAttr === false
            || imageAltAttr === null
        ) {
            const altText = imageElement.getAttribute('src').split('/').pop();
            imageElement.setAttribute('alt', altText);
        }
    });
}


// HIGHLIGHTER

function configureHighlighter() {
    const codeElements = document.querySelectorAll('pre code');
    codeElements.forEach((element) => {
        hljs.highlightBlock(element);
    });
}


// RESPONSIVE MEDIA

function configureResponsiveMedia() {
    reframe('.post-content iframe');
}


// BACK TO TOP

function bindBackToTop() {
    const backToTopElements = document.querySelectorAll('.js-back-to-top');
    if (backToTopElements) {
        backToTopElements.forEach((backToTopElement) => {
            backToTopElement.addEventListener('click', () => {
                scrollToTop();
            });
        });
    }
}


// SOCIALS

function configureSocials() {
    if (eckoConfig('ecko_theme_config', 'social_instagram')) {
        const socialInstagramElements = document.querySelectorAll('.socials__item--instagram');
        socialInstagramElements.forEach((socialInstagramElement) => {
            socialInstagramElement.setAttribute('href', eckoConfig('ecko_theme_config', 'social_instagram'));
            socialInstagramElement.style.display = 'block';
        });
    }
    if (eckoConfig('ecko_theme_config', 'social_github')) {
        const socialGithubElements = document.querySelectorAll('.socials__item--github');
        socialGithubElements.forEach((socialGithubElement) => {
            socialGithubElement.setAttribute('href', eckoConfig('ecko_theme_config', 'social_github'));
            socialGithubElement.style.display = 'block';
        });
    }
    if (eckoConfig('ecko_theme_config', 'social_linkedin')) {
        const socialLinkedinElements = document.querySelectorAll('.socials__item--linkedin');
        socialLinkedinElements.forEach((socialLinkedinElement) => {
            socialLinkedinElement.setAttribute('href', eckoConfig('ecko_theme_config', 'social_linkedin'));
            socialLinkedinElement.style.display = 'block';
        });
    }
}


// GALLERY

function configureGallery() {
    const galleryImages = document.querySelectorAll('.kg-gallery-image img');
    galleryImages.forEach((image) => {
        const container = image.closest('.kg-gallery-image');
        const width = image.attributes.width.value;
        const height = image.attributes.height.value;
        const ratio = width / height;
        container.style.flex = `${ratio} 1 0%`;
    });
}


// COMMENTS

// eslint-disable-next-line no-unused-vars, camelcase
function disqus_config() {
    this.page.url = eckoConfig('ecko_theme_base', 'ghost_absolute_url');
    this.page.identifier = eckoConfig('ecko_theme_base', 'ghost_comment_id');
}

function loadDisqus() {
    const disqusID = eckoConfig('ecko_theme_config', 'disqus_id');
    const d = document;
    const s = d.createElement('script');
    s.src = `https://${disqusID}.disqus.com/embed.js`;
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
}

function loadComments() {
    const commentsElement = document.querySelector('.comments');
    if (commentsElement) {
        const commentsViewElement = document.querySelector('.comments__title');
        const commentsDisqusElement = document.querySelector('.comments__disqus');
        commentsViewElement.style.display = 'none';
        commentsDisqusElement.style.display = 'block';
        loadDisqus();
    }
}

function configureComments() {
    const commentsElement = document.querySelector('.comments');
    if (commentsElement && eckoConfig('ecko_theme_config', 'disqus_id') && eckoConfig('ecko_theme_base', 'ghost_comment_id')) {
        commentsElement.style.display = 'block';
        if (eckoConfig('ecko_theme_config', 'disqus_autoload')) {
            loadComments();
        }
    }
}

function bindComments() {
    const showCommentsElements = document.querySelectorAll('.js-comments-show');
    if (showCommentsElements) {
        showCommentsElements.forEach((showCommentsElement) => {
            showCommentsElement.addEventListener('click', () => {
                loadComments();
            });
        });
    }
}


// POST AUTHORS

function configurePostAuthors() {
    const postAuthorsElement = document.querySelector('.post-authors');
    const postAuthorsItemsElement = document.querySelector('.post-authors-items');
    if (postAuthorsElement && postAuthorsItemsElement.children.length <= 1) {
        postAuthorsElement.parentNode.removeChild(postAuthorsElement);
    }
}


// MENU

function bodyMouseUpNavigation(event) {
    const navigationElement = document.querySelector('.navigation');
    if (event.target !== navigationElement && !navigationElement.contains(event.target)) {
        closeNavigation();
    }
}

function closeNavigation() {
    const navigationElement = document.querySelector('.navigation');
    navigationElement.classList.remove('navigation--dropdown-active');
    document.removeEventListener('mouseup', bodyMouseUpNavigation);
}

function openNavigation() {
    const navigationElement = document.querySelector('.navigation');
    navigationElement.classList.add('navigation--dropdown-active');
    document.addEventListener('mouseup', bodyMouseUpNavigation);
}

function toggleNavigationVisibility() {
    const navigationElement = document.querySelector('.navigation');
    if (navigationElement.classList.contains('navigation--dropdown-active')) {
        closeNavigation();
    } else {
        openNavigation();
    }
}

function bindNavigation() {
    const navigationToggleElements = document.querySelectorAll('.js-navigation-toggle');
    if (navigationToggleElements) {
        navigationToggleElements.forEach((navigationToggleElement) => {
            navigationToggleElement.addEventListener('click', () => {
                toggleNavigationVisibility();
            });
        });
    }
}

// NOTIFICATIONS

function getParameterByName(name) {
    const url = window.location.href;
    const id = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${id}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function openNotification() {
    const notificationElement = document.querySelector('.notification');
    notificationElement.classList.add('notification--active');
    document.body.classList.add('has-notification');
}

function closeNotification() {
    const notificationElement = document.querySelector('.notification');
    document.body.classList.remove('has-notification');
    notificationElement.classList.remove('notification--active');
}

function bindNotification() {
    const notificationElement = document.querySelector('.notification');
    if (notificationElement) {
        notificationElement.addEventListener('click', closeNotification);
    }
}

function configureNotification() {
    const notificationElement = document.querySelector('.notification');
    if (notificationElement) {
        const actionParam = getParameterByName('action');
        const stripeParam = getParameterByName('stripe');
        if (actionParam === 'signup') {
            window.location = `${window.location.origin}/membership/?action=checkout`;
        }
        if (actionParam === 'subscribe') {
            notificationElement.classList.add('notification--subscribe-success');
            document.body.classList.add('subscribe-success');
            openNotification();
        }
        if (actionParam === 'checkout') {
            notificationElement.classList.add('notification--signup-success');
            document.body.classList.add('signup-success');
            openNotification();
        }
        if (actionParam === 'signin') {
            notificationElement.classList.add('notification--signin-success');
            document.body.classList.add('signin-success');
            openNotification();
        }
        if (stripeParam === 'success') {
            notificationElement.classList.add('notification--checkout-success');
            document.body.classList.add('checkout-success');
            openNotification();
        }
    }
}


// WIDGET - SEARCH

function configureWidgetSearch() {
    const widgetSearchElement = document.querySelector('.widget-search');
    if (widgetSearchElement && eckoConfig('ecko_theme_config', 'search_api_key')) {
        widgetSearchElement.style.display = 'block';
    }
}


// WIDGET - ADVERTISMENT

function configureWidgetAdvertisment() {
    const widgetAdvertismentElement = document.querySelector('.widget-advertisment');
    if (widgetAdvertismentElement) {
        const widgetAdvertismentExampleElement = document.querySelector('.widget-advertisment__example');
        if (!widgetAdvertismentExampleElement) {
            widgetAdvertismentElement.style.display = 'block';
        }
        if (eckoConfig('ecko_theme_config', 'demo')) {
            widgetAdvertismentElement.style.display = 'block';
            widgetAdvertismentExampleElement.style.display = 'flex';
        }
    }
}


// SEARCH

function showLoadingSearch() {
    const searchLoadingElement = document.querySelector('.search__loading');
    const searchMagnifyElement = document.querySelector('.search__magnify');
    searchMagnifyElement.style.display = 'none';
    searchLoadingElement.style.display = 'flex';
}

function hideLoadingSearch() {
    const searchLoadingElement = document.querySelector('.search__loading');
    const searchMagnifyElement = document.querySelector('.search__magnify');
    searchLoadingElement.style.display = 'none';
    searchMagnifyElement.style.display = 'flex';
}

function openSearch() {
    if (window.outerWidth < 880) {
        window.location = `${eckoConfig('ecko_theme_base', 'ghost_site_url')}/search/`;
        return;
    }
    const searchElement = document.querySelector('.search');
    const searchInputElement = document.querySelector('.search__input');
    if (!eckoConfig('ecko_theme_base', 'ghost_post_title') || eckoConfig('ecko_theme_base', 'ghost_post_title').toLowerCase() !== 'search') {
        searchElement.classList.add('search--enabled');
        document.addEventListener('mouseup', bodyMouseUpSearch);
    }
    setTimeout(() => {
        searchInputElement.focus();
    }, 500);
}

function closeSearch() {
    const searchElement = document.querySelector('.search');
    searchElement.classList.remove('search--enabled');
    document.removeEventListener('mouseup', bodyMouseUpSearch);
}

function bodyMouseUpSearch(event) {
    const searchContainerElement = document.querySelector('.search__container');
    if (event.target !== searchContainerElement && !searchContainerElement.contains(event.target)) {
        closeSearch();
    }
}

function bindSearch() {
    const searchOpenElements = document.querySelectorAll('.js-search-open');
    const searchCloseElements = document.querySelectorAll('.js-search-close');
    const searchMagnifyElement = document.querySelector('.search__magnify');
    const searchInputElement = document.querySelector('.search__input');
    if (searchOpenElements) {
        searchOpenElements.forEach((searchOpenElement) => {
            searchOpenElement.addEventListener('click', openSearch);
        });
    }
    if (searchCloseElements) {
        searchCloseElements.forEach((searchCloseElement) => {
            searchCloseElement.addEventListener('click', closeSearch);
        });
    }
    if (searchMagnifyElement) {
        searchMagnifyElement.addEventListener('click', () => {
            searchInputElement.focus();
        });
    }
}

function configureSearch() {
    if (eckoConfig('ecko_theme_config', 'search_api_key')) {
        const navigationSearchElement = document.querySelector('.navigation__search');
        const searchLowerElement = document.querySelector('.search__lower');
        const searchInputElement = document.querySelector('.search__input');
        const searchCountElement = document.querySelector('.search__count');
        const searchResultsElement = document.querySelector('.search__results');
        navigationSearchElement.style.display = 'block';
        window.ghostSearch = new GhostSearch({
            url: eckoConfig('ecko_theme_base', 'ghost_site_url'),
            key: eckoConfig('ecko_theme_config', 'search_api_key'),
            input: '.search__input',
            results: '.search__results',
            version: 'v3',
            api: {
                parameters: {
                    fields: ['title', 'slug', 'primary_tag', 'published_at', 'primary_author'],
                    include: ['tags', 'authors'],
                },
            },
            template: (result) => {
                const url = eckoConfig('ecko_theme_base', 'ghost_site_url');
                let date = new Date(result.published_at);
                date = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
                let category = '';
                let author = '';
                if (result.primary_tag) category = result.primary_tag.name;
                if (result.primary_author) author = result.primary_author.name;
                return `<a href="${url}/${result.slug}/" class="search__result">
                    <span class="search__category">${category}</span>
                    <span class="search__title">${result.title}</span>
                    <span class="search__meta">${date} <span class="search__bull">•</span> ${author}</span>
                </a>`;
            },
            on: {
                beforeFetch: () => {
                    showLoadingSearch();
                },
                afterFetch: () => {
                    hideLoadingSearch();
                },
                beforeDisplay: () => {
                    showLoadingSearch();
                },
                afterDisplay: (results) => {
                    hideLoadingSearch();
                    if (!searchInputElement.value.length) {
                        searchLowerElement.style.display = 'none';
                    } else {
                        const resultsCount = results.length;
                        searchLowerElement.style.display = 'block';
                        searchCountElement.innerHTML = resultsCount;
                        if (resultsCount) {
                            searchResultsElement.style.display = 'grid';
                        } else {
                            searchResultsElement.style.display = 'none';
                        }
                    }
                },
            },
        });
    }
}


// INITIALIZE

function initReady() {
    configureSVG();
    configureImageAlt();
}

function initLoad() {
    setTimeout(() => {
        configureHighlighter();
        configureResponsiveMedia();
        configureSocials();
        configureComments();
        configureGallery();
        configurePostAuthors();
        configureNotification();
        configureSearch();
        configureWidgetSearch();
        configureWidgetAdvertisment();
        bindComments();
        bindNavigation();
        bindNotification();
        bindBackToTop();
        bindSearch();
    }, 400);
}

if (document.attachEvent ? document.readyState === 'complete' : document.readyState === 'loading') {
    initReady();
    initLoad();
} else {
    document.addEventListener('DOMContentLoaded', initReady());
    document.addEventListener('load', initLoad());
}
