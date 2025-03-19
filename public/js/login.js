const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const validUsername = 'fadhli123';
const validPassword = 'holi123';

const showError = (message) => {
    // Hapus pesan error yang sudah ada
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Buat elemen pesan error
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message mt-4 p-3 bg-red-200 text-red-700 rounded-lg text-center';
    errorElement.textContent = message;

    // Tempatkan pesan error di antara <h2> dan <form>
    const form = document.getElementById('login-form');
    const header = form.parentNode.querySelector('h2'); // Ambil elemen <h2>
    header.parentNode.insertBefore(errorElement, form); // Sisipkan sebelum <form>
};

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === validUsername && password === validPassword) {
        window.location.href = './dashboard.html'; // Gunakan path relatif yang benar
    } else {
        showError('Username atau password salah!');
    }
});