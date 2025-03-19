const usernameDisplay = document.getElementById('usernameDisplay');
        const username = localStorage.getItem('username');
        if (username) {
            usernameDisplay.textContent = `Selamat datang, ${username}`;
        }

        // Handle logout
        const logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('username');
            window.location.href = './index.html';
        });

// Pemeriksaan session token secepat mungkin
if (!localStorage.getItem('sessionToken')) {
    window.location.href = './index.html'; // Redirect ke halaman login jika tidak ada session token
}

// Inisialisasi data di localStorage jika belum ada
if (!localStorage.getItem('lokasiData')) {
    localStorage.setItem('lokasiData', JSON.stringify([]));
}

const form = document.getElementById('dataForm');
const tableBody = document.getElementById('dataTable');
const imageInput = document.getElementById('gambar');
const previewImage = document.getElementById('previewImage');

// Fungsi untuk kompresi gambar
function compressImage(file, callback) {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = function(e) {
        img.src = e.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 200; // Batasi lebar gambar
            const maxHeight = 200; // Batasi tinggi gambar
            let width = img.width;
            let height = img.height;

            // Resize gambar
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL('image/jpeg', 0.7)); // Kompresi ke JPEG dengan kualitas 70%
        };
    };
    reader.readAsDataURL(file);
}

// Preview image when selected
imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        compressImage(file, function(compressedImage) {
            previewImage.src = compressedImage;
            previewImage.classList.remove('hidden');
        });
    }
});

// Function to detect if the link is a short URL
function isShortLink(mapLink) {
    if (!mapLink) return false;
    return mapLink.includes('maps.app.goo.gl');
}

// Function to validate if the link is a Google Maps link
function isGoogleMapsLink(mapLink) {
    if (!mapLink) return false;
    return mapLink.includes('google.com/maps') || mapLink.includes('maps.app.goo.gl');
}

// Function to parse latitude and longitude from Google Maps URL
function parseCoordinatesFromMapLink(mapLink) {
    if (!mapLink) {
        return { latitude: null, longitude: null, isShortLink: false, isValid: false, error: 'Link peta tidak boleh kosong.' };
    }

    // Deteksi jika link adalah link pendek (maps.app.goo.gl)
    if (isShortLink(mapLink)) {
        return { latitude: null, longitude: null, isShortLink: true, isValid: false, error: 'Link pendek (maps.app.goo.gl) tidak didukung. Silakan gunakan link panjang dari Google Maps (contoh: https://www.google.com/maps/place/.../@latitude,longitude).' };
    }

    // Validasi apakah link adalah link Google Maps
    if (!isGoogleMapsLink(mapLink)) {
        return { latitude: null, longitude: null, isShortLink: false, isValid: false, error: 'Link harus berupa link Google Maps (contoh: https://www.google.com/maps/place/.../@latitude,longitude). Link lain seperti GitHub tidak diperbolehkan.' };
    }

    // Contoh URL: https://www.google.com/maps/place/.../@-6.9667,110.4167,12z
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = mapLink.match(regex);
    if (match) {
        return {
            latitude: parseFloat(match[1]),
            longitude: parseFloat(match[2]),
            isShortLink: false,
            isValid: true,
            error: null
        };
    }

    return { latitude: null, longitude: null, isShortLink: false, isValid: false, error: 'Link Google Maps harus mengandung koordinat (contoh: @-6.9667,110.4167). Silakan periksa kembali link Anda.' };
}

// Fungsi untuk menampilkan data
function renderData() {
    const data = JSON.parse(localStorage.getItem('lokasiData')) || [];
    tableBody.innerHTML = '';
    
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors group';
        row.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                    <button onclick="editData(${index})" class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteData(${index})" class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
            <td class="px-4 py-4 font-medium text-gray-900">${item.kecamatan}</td>
            <td class="px-4 py-4 text-gray-600">${item.kelurahan}</td>
            <td class="px-4 py-4 text-gray-600 max-w-xs">
                <div class="text-sm">${item.alamat}</div>
                <div class="text-xs text-gray-400 mt-1">${item.kodePos}</div>
            </td>
            <td class="px-4 py-4">
                <div class="flex flex-wrap gap-2 max-w-xs">
                    ${item.fasilitas.map(f => `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${f}
                        </span>
                    `).join('')}
                </div>
            </td>
            <td class="px-4 py-4">
                ${item.mapLink ? `
                    <a href="${item.mapLink}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800">
                        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                        </svg>
                        <span class="hidden md:inline">Peta</span>
                    </a>
                ` : '-'}
            </td>
            <td class="px-4 py-4">
                <div class="relative group cursor-pointer">
                    <img src="${item.gambar || 'https://via.placeholder.com/100'}" 
                         alt="Lokasi" 
                         class="w-16 h-16 object-cover rounded-lg shadow-sm transform transition-all group-hover:scale-110">
                    <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity rounded-lg"></div>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Fungsi untuk menambah/mengupdate data
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const file = imageInput.files[0];
    
    if (file) {
        compressImage(file, function(compressedImage) {
            saveData(compressedImage);
        });
    } else {
        const existingImage = document.getElementById('dataId').value 
            ? JSON.parse(localStorage.getItem('lokasiData')).find(item => item.id == document.getElementById('dataId').value).gambar 
            : '';
        saveData(existingImage);
    }
});

function saveData(imageData) {
    const mapLink = document.getElementById('mapLink')?.value || '';
    const { latitude, longitude, isShortLink, isValid, error } = parseCoordinatesFromMapLink(mapLink);

    // Jika link tidak valid, tampilkan error dan hentikan penyimpanan
    if (!isValid) {
        alert(error);
        return; // Hentikan penyimpanan
    }

    const data = {
        id: document.getElementById('dataId')?.value || Date.now(),
        kecamatan: document.getElementById('kecamatan')?.value || '',
        kelurahan: document.getElementById('kelurahan')?.value || '',
        alamat: document.getElementById('alamat')?.value || '',
        kodePos: document.getElementById('kodePos')?.value || '',
        fasilitas: document.getElementById('fasilitas')?.value ? document.getElementById('fasilitas').value.split(',').map(f => f.trim()) : [],
        mapLink: mapLink,
        latitude: latitude,
        longitude: longitude,
        gambar: imageData
    };
    
    let storedData = JSON.parse(localStorage.getItem('lokasiData')) || [];
    
    if (document.getElementById('dataId')?.value) {
        const index = storedData.findIndex(item => item.id == data.id);
        if (index !== -1) {
            storedData[index] = data;
        } else {
            console.warn('Data ID not found for editing:', data.id);
            storedData.push(data);
        }
    } else {
        storedData.push(data);
    }
    
    try {
        localStorage.setItem('lokasiData', JSON.stringify(storedData));
        console.log('Data saved to localStorage:', storedData);
        form.reset();
        document.getElementById('dataId').value = '';
        previewImage.classList.add('hidden');
        renderData();
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        alert('Gagal menyimpan data: ' + e.message);
    }
}



// Fungsi Edit Data dengan Modal
window.editData = (index) => {
    const data = JSON.parse(localStorage.getItem('lokasiData'))[index];
    
    // Membuat elemen modal dengan transisi awal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto opacity-0 scale-95 transition-all duration-300 ease-in-out';
    modalContent.innerHTML = `
        <h3 class="text-2xl font-bold mb-6 text-gray-900 transform transition-all duration-300">Edit Lokasi</h3>
        <form id="modalForm" class="space-y-6">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
                    <input type="text" id="modalKecamatan" value="${data.kecamatan}" required
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Kelurahan</label>
                    <input type="text" id="modalKelurahan" value="${data.kelurahan}" required
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Kode Pos</label>
                    <input type="text" id="modalKodePos" value="${data.kodePos}" required
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                    <input type="text" id="modalAlamat" value="${data.alamat}" required
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Fasilitas (pisahkan dengan koma)</label>
                    <input type="text" id="modalFasilitas" value="${data.fasilitas.join(', ')}"
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Link Peta</label>
                    <input type="url" id="modalMapLink" value="${data.mapLink || ''}"
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                    <p class="text-xs text-gray-500 mt-1">Gunakan link panjang dari Google Maps yang mengandung koordinat (contoh: https://www.google.com/maps/place/.../@latitude,longitude).</p>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Gambar</label>
                    <div class="flex items-center gap-4">
                        <div class="relative group flex-1">
                            <input type="file" id="modalGambar" accept="image/*"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                            <div class="px-4 py-2 rounded-lg border border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-50 transition-all duration-200">
                                <span class="text-gray-600">Ubah Gambar</span>
                            </div>
                        </div>
                        <img id="modalPreview" src="${data.gambar || 'https://via.placeholder.com/100'}" 
                            class="w-16 h-16 object-cover rounded-lg border transform transition-all duration-300 hover:scale-110">
                    </div>
                </div>
            </div>
            <div class="flex justify-end gap-4 pt-6">
                <button type="button" id="modalBatal" class="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5">
                    Batal
                </button>
                <button type="submit" id="modalSimpan" class="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 flex items-center">
                    <span>Simpan Perubahan</span>
                </button>
            </div>
        </form>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Animasi masuk modal
    setTimeout(() => {
        modalOverlay.classList.add('bg-opacity-50');
        modalContent.classList.add('opacity-100', 'scale-100');
    }, 10);

    // Handle preview gambar dengan animasi
    const modalGambar = modalContent.querySelector('#modalGambar');
    const modalPreview = modalContent.querySelector('#modalPreview');
    
    modalGambar.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            modalPreview.style.opacity = '0';
            compressImage(file, function(compressedImage) {
                modalPreview.src = compressedImage;
                modalPreview.animate([
                    { opacity: 0, transform: 'scale(0.95)' },
                    { opacity: 1, transform: 'scale(1)' }
                ], {
                    duration: 300,
                    easing: 'ease-in-out'
                });
            });
        }
    });

    // Handle submit form dengan animasi loading
    const modalForm = modalContent.querySelector('#modalForm');
    modalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const mapLink = modalContent.querySelector('#modalMapLink').value;
        const { isShortLink, isValid, error, latitude, longitude } = parseCoordinatesFromMapLink(mapLink);

        // Jika link tidak valid, tampilkan error dan hentikan penyimpanan
        if (!isValid) {
            alert(error);
            return; // Hentikan penyimpanan
        }

        const submitButton = modalContent.querySelector('#modalSimpan');
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Menyimpan...
        `;

        const updatedData = {
            ...data,
            kecamatan: modalContent.querySelector('#modalKecamatan').value,
            kelurahan: modalContent.querySelector('#modalKelurahan').value,
            alamat: modalContent.querySelector('#modalAlamat').value,
            kodePos: modalContent.querySelector('#modalKodePos').value,
            fasilitas: modalContent.querySelector('#modalFasilitas').value.split(',').map(f => f.trim()),
            mapLink: mapLink,
            latitude: latitude,
            longitude: longitude,
            gambar: modalPreview.src
        };

        let storedData = JSON.parse(localStorage.getItem('lokasiData'));
        const index = storedData.findIndex(item => item.id === data.id);
        storedData[index] = updatedData;
        localStorage.setItem('lokasiData', JSON.stringify(storedData));
        
        renderData();
        closeModal(modalOverlay, modalContent);
    });

    // Handle tombol batal
    modalContent.querySelector('#modalBatal').addEventListener('click', () => {
        closeModal(modalOverlay, modalContent);
    });

    // Tutup modal saat klik di luar
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal(modalOverlay, modalContent);
        }
    });
};

// Fungsi untuk menutup modal dengan animasi
function closeModal(overlay, content) {
    overlay.classList.remove('bg-opacity-50');
    content.classList.remove('opacity-100', 'scale-100');
    content.classList.add('opacity-0', 'scale-95');
    setTimeout(() => overlay.remove(), 300);
}

// Fungsi Hapus Data
window.deleteData = (index) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        let storedData = JSON.parse(localStorage.getItem('lokasiData'));
        storedData.splice(index, 1);
        localStorage.setItem('lokasiData', JSON.stringify(storedData));
        renderData();
    }
};

// Initial render
renderData();