document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const sidebarToggler = document.querySelector(".sidebar-toggler");

    // Toggle sidebar collapsed state (só se existir)
    if (sidebarToggler && sidebar) {
        sidebarToggler.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }

    // Highlight current page in navigation: usa ends-with selector para casar hrefs absolutos ou relativos
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const currentLink = document.querySelector(`.nav-link[href$="${currentPage}"]`);
    if (currentLink) currentLink.classList.add("active");
});
