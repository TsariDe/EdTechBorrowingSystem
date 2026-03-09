// Sidebar toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// Auto-dismiss alerts after 5 seconds
document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
        alert.style.transition = 'opacity 0.4s';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 400);
    }, 5000);
});

// Set today as min date for date inputs
document.querySelectorAll('input[type="date"][name="dateNeeded"], input[type="date"][name="dateToReturn"]').forEach(input => {
    const today = new Date().toISOString().split('T')[0];
    input.min = today;
});
