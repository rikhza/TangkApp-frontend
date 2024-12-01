import React from 'react'
import { QRCode } from 'react-qrcode-logo'

const GenerateQRCode = React.forwardRef(({ id }, ref) => {
    return (
        <div ref={ref}>
            <h1>Kode QR Berkas</h1>
            <QRCode
                value={`https://tangkapp.id/dashboard/berkas/${id}`}
                size={200} // Ukuran QR Code
                bgColor="#ffffff" // Warna latar belakang
                fgColor="#003769" // Warna foreground (hitam)
                logoImage="/img/Logo.png" // Path atau URL logo
                logoWidth={60} // Lebar logo
                logoHeight={60} // Tinggi logo
                logoOpacity={1} // Opasitas logo (1 untuk tidak transparan)
                removeQrCodeBehindLogo={true} // Menghapus titik QR di belakang logo
                logoPadding={8} // Memberikan padding di sekitar logo
                logoPaddingStyle="circle" // Bentuk padding (lingkaran)
                qrStyle="dots" // Gaya modul QR (bentuk titik)
                ecLevel="H" // Level koreksi error (H untuk maksimum)
            />
        </div>
    )
})

export default GenerateQRCode
