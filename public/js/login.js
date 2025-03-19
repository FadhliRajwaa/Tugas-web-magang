if (localStorage.getItem('sessionToken')) {
    window.location.href = './dashboard.html'; // Redirect ke dashboard jika sudah login
}

// Simulated user database (in a real app, this would be on the server)
const users = [
    {
        username: 'fadhli',
        // Simulated hashed password (in a real app, use bcrypt to hash this)
        // For demo purposes, we'll use a simple string. In reality, this would be a hash like:
        // bcrypt.hashSync('holi123', 10)
        password: 'hashed_123', // Pretend this is a bcrypt hash
    }
];

// Simulated hashing function (for demo purposes only)
function simulateHash(password) {
    // In a real app, use bcrypt.hashSync(password, 10)
    return 'hashed_' + password; // This is just for demo purposes
}

// Function to generate a more secure session token (for demo purposes)
function generateSessionToken(username) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return btoa(`${username}:${timestamp}:${randomString}`); // Base64 encode for simplicity
}

// Function to show error messages
const showError = (message) => {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message mt-4 p-3 bg-red-200 text-red-700 rounded-lg text-center';
    errorElement.textContent = message;

    const form = document.getElementById('login-form');
    const header = form.parentNode.querySelector('h2');
    header.parentNode.insertBefore(errorElement, form);
};

// Pemeriksaan session token saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('sessionToken')) {
        // Jika session token ada, arahkan ke dashboard
        window.location.href = './dashboard.html';
    }
});

// Login form submission
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validasi input
    if (!username || !password) {
        showError('Username dan password tidak boleh kosong!');
        return;
    }

    // Simulate hashing the input password
    const hashedPassword = simulateHash(password);

    // Find the user in the "database"
    const user = users.find(u => u.username === username && u.password === hashedPassword);

    if (user) {
        // Generate a session token
        const sessionToken = generateSessionToken(username);
        localStorage.setItem('sessionToken', sessionToken);
        localStorage.setItem('username', username);

        // Redirect to dashboard
        window.location.href = './dashboard.html';
    } else {
        showError('Username atau password salah!');
    }
});