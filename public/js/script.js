// Toggle Menu Mobile
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('max-h-0');
    mobileMenu.classList.toggle('max-h-96'); // Sesuaikan tinggi sesuai kebutuhan
});

// Tutup menu mobile saat klik di luar
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        mobileMenu.classList.add('max-h-0');
        mobileMenu.classList.remove('max-h-96');
    }
});

// Efek scroll pada navbar
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

// Smooth scroll untuk link dengan hash
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
let userLocation = null; // Simpan lokasi pengguna

// Ambil elemen DOM
const tbody = document.getElementById('dataTable');
const entriesSelect = document.getElementById('entriesPerPage');
const searchInput = document.getElementById('searchInput');
const paginationInfo = document.getElementById('paginationInfo');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

// Ambil lokasi pengguna dengan penanganan error yang lebih baik
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolokasi tidak didukung oleh browser ini.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                resolve(userLocation);
            },
            (error) => {
                let pesanError = 'Gagal mengambil lokasi.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        pesanError = 'Izin lokasi ditolak. Silakan aktifkan akses lokasi di pengaturan browser Anda.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        pesanError = 'Informasi lokasi tidak tersedia. Pastikan layanan lokasi diaktifkan di perangkat Anda.';
                        break;
                    case error.TIMEOUT:
                        pesanError = 'Permintaan lokasi habis waktu. Silakan coba lagi.';
                        break;
                    default:
                        pesanError = 'Terjadi kesalahan saat mengambil lokasi.';
                        break;
                }
                reject(new Error(pesanError));
            },
            {
                enableHighAccuracy: true, // Tingkatkan akurasi untuk perangkat mobile
                timeout: 10000, // Tunggu hingga 10 detik
                maximumAge: 0 // Jangan gunakan lokasi yang di-cache
            }
        );
    });
}

// Hitung jarak menggunakan rumus Haversine (mengembalikan jarak dalam kilometer)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius Bumi dalam kilometer
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Jarak dalam kilometer
    return distance.toFixed(2); // Bulatkan ke 2 desimal
}

// Parsing koordinat dari mapLink sebagai fallback
function parseCoordinatesFromMapLink(mapLink) {
    if (!mapLink) return { latitude: null, longitude: null };

    // Contoh URL: https://www.google.com/maps/place/.../@-6.9667,110.4167,12z
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = mapLink.match(regex);
    if (match) {
        return {
            latitude: parseFloat(match[1]),
            longitude: parseFloat(match[2])
        };
    }
    return { latitude: null, longitude: null };
}

// Ambil data dari localStorage
function getData() {
    const data = JSON.parse(localStorage.getItem('lokasiData')) || [];
    console.log('Data diambil dari localStorage:', data); // Debugging
    return data;
}

// Filter data berdasarkan pencarian
function filterData(data) {
    if (!searchTerm) return data;
    return data.filter(item => 
        item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.kelurahan.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Tampilkan data dengan pagination
async function renderData() {
    const allData = getData();
    const filteredData = filterData(allData);
    const totalEntries = filteredData.length;
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Inisialisasi jarak dengan "N/A" untuk semua item
    let distances = {};
    paginatedData.forEach(item => {
        distances[item.id] = 'N/A'; // Nilai default
    });

    // Jika lokasi pengguna tersedia, hitung jarak
    if (userLocation) {
        console.log('Lokasi pengguna:', userLocation); // Debugging
        paginatedData.forEach(item => {
            // Gunakan latitude dan longitude dari data, atau parse dari mapLink
            let lat = item.latitude;
            let lon = item.longitude;
            if (!lat || !lon) {
                const coords = parseCoordinatesFromMapLink(item.mapLink);
                lat = coords.latitude;
                lon = coords.longitude;
            }

            console.log(`Koordinat item ${item.id}: latitude=${lat}, longitude=${lon}`); // Debugging
            if (lat && lon) {
                try {
                    const distance = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        lat,
                        lon
                    );
                    distances[item.id] = `${distance} km`;
                } catch (error) {
                    console.error(`Gagal menghitung jarak untuk item ${item.id}:`, error);
                    distances[item.id] = 'N/A'; // Kembali ke "N/A" jika gagal
                }
            } else {
                console.log(`Item ${item.id} tidak memiliki koordinat, jarak diset ke N/A`);
            }
        });
    } else {
        console.log('Lokasi pengguna tidak tersedia, semua jarak diset ke N/A');
    }

    // Render tabel
    tbody.innerHTML = paginatedData.map((item, index) => {
        const distance = distances[item.id]; // Sudah pasti ada nilainya
        return `
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
                <div class="flex flex-col gap-2">
                    <a href="${item.mapLink || '#'}" target="_blank" class="inline-flex items-center text-purple-600 hover:text-purple-800 hover:underline transition-colors duration-200">
                        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Buka Peta
                    </a>
                    <span class="text-sm text-gray-600">Jarak: ${distance}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <img src="${item.gambar || 'https://via.placeholder.com/100'}" alt="Lokasi" class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md shadow-sm hover:scale-110 transition-transform duration-300">
            </td>
        </tr>
    `}).join('');

    // Perbarui informasi pagination
    paginationInfo.textContent = `Menampilkan ${startIndex + 1} - ${endIndex} dari ${totalEntries} entri`;

    // Aktifkan/nonaktifkan tombol
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

// Inisialisasi lokasi pengguna dan render data saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await getUserLocation();
        renderData();
    } catch (error) {
        console.error('Gagal mengambil lokasi pengguna:', error.message);
        // Tampilkan pesan error kepada pengguna
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-600 text-center p-4';
        errorDiv.textContent = error.message;

        // Tambahkan tombol "Coba Lagi"
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Coba Lagi';
        retryButton.className = 'text-blue-600 underline ml-2';
        retryButton.addEventListener('click', async () => {
            try {
                await getUserLocation();
                errorDiv.remove();
                renderData();
            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.appendChild(retryButton);
            }
        });
        errorDiv.appendChild(retryButton);

        document.querySelector('main').prepend(errorDiv);
        // Render data tanpa jarak jika akses lokasi gagal
        renderData();
    }
});