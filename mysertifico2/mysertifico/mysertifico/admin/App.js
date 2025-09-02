import React, { useState, useEffect, useCallback } from 'react';

// Komponen untuk ikon berdasarkan status
const StatusIcon = ({ isOnline, connectionType }) => {
    if (!isOnline) {
        return <i className="ri-wifi-off-line text-2xl text-red-500"></i>;
    }
    if (connectionType === 'slow') {
        return <i className="ri-slow-down-line text-2xl text-yellow-500"></i>;
    }
    return <i className="ri-wifi-line text-2xl text-green-500"></i>;
};

// Komponen untuk memaparkan popup status sambungan
const ConnectionStatusPopup = ({ isOnline, connectionType, isVisible }) => {
    if (!isVisible) return null;

    let bgColor, textColor, title, message;

    if (!isOnline) {
        bgColor = 'bg-red-100 dark:bg-red-900';
        textColor = 'text-red-800 dark:text-red-200';
        title = "Sambungan Terputus";
        message = "Anda kini di luar talian. Aplikasi tidak dapat dijalankan sehingga sambungan dipulihkan.";
    } else if (connectionType === 'slow') {
        bgColor = 'bg-yellow-100 dark:bg-yellow-900';
        textColor = 'text-yellow-800 dark:text-yellow-200';
        title = "Sambungan Perlahan";
        message = "Capaian internet anda dikesan perlahan. Aplikasi mungkin tidak berfungsi dengan optimum.";
    } else {
        bgColor = 'bg-green-100 dark:bg-green-900';
        textColor = 'text-green-800 dark:text-green-200';
        title = "Kembali Dalam Talian";
        message = "Sambungan internet anda telah stabil. Aplikasi sedia untuk digunakan.";
    }

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <div className={`flex items-start gap-4 p-4 rounded-lg shadow-lg max-w-sm ${bgColor} ${textColor}`}>
                <div className="flex-shrink-0">
                    <StatusIcon isOnline={isOnline} connectionType={connectionType} />
                </div>
                <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-sm mt-1">{message}</p>
                </div>
            </div>
        </div>
    );
};


// Komponen utama aplikasi
export default function App() {
    // State untuk mengurus status sambungan
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [connectionType, setConnectionType] = useState('good');
    const [showPopup, setShowPopup] = useState(true); // Tunjuk popup pada mulanya

    // Fungsi untuk mengemas kini status sambungan
    const updateConnectionStatus = useCallback(() => {
        setIsOnline(navigator.onLine);
        
        // Periksa Network Information API jika disokong
        if (navigator.connection) {
            const { effectiveType } = navigator.connection;
            if (effectiveType.includes('2g') || effectiveType === 'slow-2g') {
                setConnectionType('slow');
            } else {
                setConnectionType('good');
            }
        } else {
            // Fallback jika API tidak disokong
            setConnectionType(navigator.onLine ? 'good' : 'slow');
        }
        
        // Tunjukkan popup apabila status berubah
        setShowPopup(true);

        // Sembunyikan popup "Kembali Dalam Talian" selepas beberapa saat
        if (navigator.onLine && connectionType !== 'slow') {
            setTimeout(() => setShowPopup(false), 5000);
        }

    }, [connectionType]);

    useEffect(() => {
        // Tambah event listeners untuk memantau perubahan status
        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);
        
        if (navigator.connection) {
            navigator.connection.addEventListener('change', updateConnectionStatus);
        }

        // Panggil sekali semasa komponen dimuatkan untuk mendapatkan status awal
        updateConnectionStatus();

        // Membersihkan event listeners apabila komponen 'unmount'
        return () => {
            window.removeEventListener('online', updateConnectionStatus);
            window.removeEventListener('offline', updateConnectionStatus);
            if (navigator.connection) {
                navigator.connection.removeEventListener('change', updateConnectionStatus);
            }
        };
    }, [updateConnectionStatus]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center p-4">
            
            {/* Kandungan utama aplikasi anda akan diletakkan di sini */}
            <div className="text-center">
                <i className="ri-apps-2-line text-6xl text-primary mb-4"></i>
                <h1 className="text-3xl font-bold">MySertifico App</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                    Status Sambungan Semasa: 
                    {isOnline ? 
                        <span className={`font-semibold ${connectionType === 'slow' ? 'text-yellow-500' : 'text-green-500'}`}>
                            {connectionType === 'slow' ? ' Perlahan' : ' Stabil'}
                        </span> 
                        : 
                        <span className="font-semibold text-red-500"> Luar Talian</span>
                    }
                </p>
                <p className="mt-4 max-w-md mx-auto">
                    Ini adalah ruang untuk komponen utama aplikasi anda. Logik pengesanan internet berjalan di latar belakang.
                </p>
            </div>

            {/* Popup status sambungan */}
            <ConnectionStatusPopup 
                isOnline={isOnline} 
                connectionType={connectionType} 
                isVisible={showPopup} 
            />
        </div>
    );
}
