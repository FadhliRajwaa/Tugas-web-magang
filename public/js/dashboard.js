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

// Fungsi untuk menampilkan data
function renderData() {
    const data = JSON.parse(localStorage.getItem('lokasiData'));
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
    const data = {
        id: document.getElementById('dataId').value || Date.now(),
        kecamatan: document.getElementById('kecamatan').value,
        kelurahan: document.getElementById('kelurahan').value,
        alamat: document.getElementById('alamat').value,
        kodePos: document.getElementById('kodePos').value,
        fasilitas: document.getElementById('fasilitas').value ? document.getElementById('fasilitas').value.split(',').map(f => f.trim()) : [],
        mapLink: document.getElementById('mapLink').value,
        gambar: imageData
    };
    
    let storedData = JSON.parse(localStorage.getItem('lokasiData'));
    
    if (document.getElementById('dataId').value) {
        const index = storedData.findIndex(item => item.id == data.id);
        storedData[index] = data;
    } else {
        storedData.push(data);
    }
    
    try {
        localStorage.setItem('lokasiData', JSON.stringify(storedData));
        form.reset();
        document.getElementById('dataId').value = '';
        previewImage.classList.add('hidden');
        renderData();
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Penyimpanan penuh! Hapus beberapa data atau gunakan gambar dengan ukuran lebih kecil.');
        } else {
            console.error('Error saving data:', e);
        }
    }
}

// Fungsi Edit Data
window.editData = (index) => {
    const data = JSON.parse(localStorage.getItem('lokasiData'))[index];
    document.getElementById('dataId').value = data.id;
    document.getElementById('kecamatan').value = data.kecamatan;
    document.getElementById('kelurahan').value = data.kelurahan;
    document.getElementById('alamat').value = data.alamat;
    document.getElementById('kodePos').value = data.kodePos;
    document.getElementById('fasilitas').value = data.fasilitas.join(', ');
    document.getElementById('mapLink').value = data.mapLink || '';
    if (data.gambar) {
        previewImage.src = data.gambar;
        previewImage.classList.remove('hidden');
    }
};

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