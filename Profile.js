async function loadSharedNavbar(){
    const script = document.createElement('script');
    script.src='shared/navbar.js';
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', function() {
    loadSharedNavbar();
});
