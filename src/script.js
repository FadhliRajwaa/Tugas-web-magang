// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('max-h-0');
    mobileMenu.classList.toggle('max-h-96'); // Adjust height as needed
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        mobileMenu.classList.add('max-h-0');
        mobileMenu.classList.remove('max-h-96');
    }
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('shadow-lg', 'bg-gray-900');
        nav.classList.remove('bg-gray-900/95');
    } else {
        nav.classList.remove('shadow-lg', 'bg-gray-900');
        nav.classList.add('bg-gray-900/95');
    }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// State untuk pagination dan filter
let currentPage = 1;
let entriesPerPage = 5;
let searchTerm = '';

// Ambil elemen DOM
const tbody = document.getElementById('dataTable');
const entriesSelect = document.getElementById('entriesPerPage');
const searchInput = document.getElementById('searchInput');
const paginationInfo = document.getElementById('paginationInfo');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

// Fungsi untuk mengambil data dari localStorage
function getData() {
    return JSON.parse(localStorage.getItem('lokasiData')) || [];
}

// Fungsi untuk memfilter data berdasarkan pencarian
function filterData(data) {
    if (!searchTerm) return data;
    return data.filter(item => 
        item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.kelurahan.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Fungsi untuk menampilkan data dengan pagination
function renderData() {
    const allData = getData();
    const filteredData = filterData(allData);
    const totalEntries = filteredData.length;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedData.map((item, index) => `
        <tr class="transition-all duration-300 hover:bg-purple-50 hover:shadow-md">
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">${startIndex + index + 1}</td>
            <td class="px-6 py-4">
                <div class="text-lg font-semibold text-purple-700">${item.kecamatan}</div>
                <div class="text-sm text-gray-600">${item.kelurahan}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">
                ${item.alamat}
                <div class="mt-1 text-xs text-gray-500">${item.kodePos}</div>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                    ${item.fasilitas.map(f => `<span class="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 hover:bg-purple-200 transition-colors duration-200">${f}</span>`).join('')}
                </div>
            </td>
            <td class="px-6 py-4">
                <a href="${item.mapLink || '#'}" target="_blank" class="inline-flex items-center text-purple-600 hover:text-purple-800 hover:underline transition-colors duration-200">
                    <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Buka Peta
                </a>
            </td>
            <td class="px-6 py-4">
                <img src="${item.gambar || 'https://via.placeholder.com/100'}" alt="Location" class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md shadow-sm hover:scale-110 transition-transform duration-300">
            </td>
        </tr>
    `).join('');

    // Update pagination info
    paginationInfo.textContent = `Menampilkan ${startIndex + 1} - ${endIndex} dari ${totalEntries} entri`;

    // Enable/disable buttons
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = endIndex >= totalEntries;
}

// Event listener untuk perubahan jumlah entri per halaman
entriesSelect.addEventListener('change', (e) => {
    entriesPerPage = parseInt(e.target.value);
    currentPage = 1; // Reset ke halaman pertama
    renderData();
});

// Event listener untuk pencarian
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    currentPage = 1; // Reset ke halaman pertama
    renderData();
});

// Event listener untuk tombol Previous
prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderData();
    }
});

// Event listener untuk tombol Next
nextButton.addEventListener('click', () => {
    const filteredData = filterData(getData());
    if (currentPage < Math.ceil(filteredData.length / entriesPerPage)) {
        currentPage++;
        renderData();
    }
});

// Panggil fungsi render saat halaman dimuat
document.addEventListener('DOMContentLoaded', renderData);