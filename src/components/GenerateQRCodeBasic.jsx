import QRCode from 'react-qr-code' // Default import

const GenerateQRCode = ({ id }) => {
    return (
        <div>
            <h1>Kode QR Berkas</h1>
            <QRCode
                value={`https://tangkapp.id/dashboard/berkas/${id}`} // Use backticks here
                size={256}
            />
        </div>
    )
}

export default GenerateQRCode
