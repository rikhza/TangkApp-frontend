import React, { useRef } from 'react'
import {
    Dialog,
    DialogHeader,
    DialogBody,
    Typography,
    IconButton,
    DialogFooter,
    Button,
    Timeline,
    TimelineItem,
    TimelineConnector,
    TimelineHeader,
    TimelineIcon,
    TimelineBody,
} from '@material-tailwind/react'
import {
    PencilIcon,
    TrashIcon,
    PlusIcon,
    EyeIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline' // Import icons

import { useMaterialTailwindController } from '@/context'
import GenerateQRCode from './GenerateQRCode'

const DetailModal = ({
    berkas,
    onClose,
    handleSelesai,
    setSelectedBerkas,
    setShowUpdatePopup,
    handleDeleteBerkas,
    handleTerhenti,
}) => {
    const [controller] = useMaterialTailwindController()
    const { roleNow, token, user } = controller

    // Helper function to render fields
    const renderField = (label, value) => {
        if (value && value.$numberDecimal) {
            value = value.$numberDecimal.toString() // Convert to string
        }

        return (
            <div className="mb-4">
                <Typography
                    variant="h6"
                    className="font-semibold text-gray-900"
                >
                    {label}
                </Typography>
                <Typography variant="small" className="text-gray-700 text-sm">
                    {value || '-'}
                </Typography>
            </div>
        )
    }

    const qrCodeRef = useRef(null)

    // Fungsi untuk mencetak QR Code
    const handlePrintQRCode = () => {
        if (qrCodeRef.current) {
            const printWindow = window.open('', '_blank')

            if (printWindow) {
                // Menulis HTML untuk print window
                printWindow.document.write(
                    '<html><head><title>Print QR Code</title>'
                )
                printWindow.document.write('<style>')
                printWindow.document.write(`
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                    }
                    .qr-container {
                        display: inline-block;
                        padding: 20px;
                        border: 1px solid #ddd;
                        background-color: #fff;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                `)
                printWindow.document.write('</style></head><body>')

                // Menulis QR Code ke dalam print window
                printWindow.document.write('<div class="qr-container">')
                printWindow.document.write(qrCodeRef.current.innerHTML) // Menyalin isi QR Code
                printWindow.document.write(`<h2>${id}</h2>`) // Menambahkan ID atau informasi lain
                printWindow.document.write('</div>')

                printWindow.document.write('</body></html>')
                printWindow.document.close()

                // Menunggu sampai konten siap dan kemudian mencetaknya
                printWindow.print()
            }
        }
    }

    const renderTimeline = () => (
        <Timeline>
            {berkas.status?.map((status, index) => (
                <TimelineItem key={index}>
                    {index > 0 && <TimelineConnector />}
                    <TimelineHeader>
                        <TimelineIcon />
                        <Typography
                            variant="h6"
                            color="blue-gray"
                            className="text-lg font-bold"
                        >
                            {status.name} -{' '}
                            {new Date(status.dateIn).toLocaleDateString()}
                        </Typography>
                    </TimelineHeader>
                    <TimelineBody className="pl-8">
                        {status?.statusDetail?.map((sub, subIndex) => (
                            <div key={subIndex} className="mb-4">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-medium text-sm"
                                >
                                    <strong>{sub.nama}</strong> (
                                    {new Date(sub.dateIn).toLocaleDateString()})
                                    {sub.namaUser && (
                                        <>
                                            {' '}
                                            oleh <strong>{sub.namaUser}</strong>
                                        </>
                                    )}
                                </Typography>
                                {sub.deskripsiKendala && (
                                    <Typography
                                        variant="small"
                                        color="red"
                                        className="mt-1 text-sm font-medium"
                                    >
                                        Kendala: {sub.deskripsiKendala}
                                    </Typography>
                                )}
                                {sub.notes && (
                                    <Typography
                                        variant="small"
                                        color="green"
                                        className="mt-1 text-sm font-medium"
                                    >
                                        Catatan Selesai: {sub.notes}
                                    </Typography>
                                )}
                                {sub.status === 'Terhenti' && (
                                    <Typography
                                        variant="small"
                                        color="amber"
                                        className="mt-1 text-sm font-medium"
                                    >
                                        Status Terhenti oleh{' '}
                                        <strong>{sub.namaUser}</strong>
                                    </Typography>
                                )}
                            </div>
                        ))}
                    </TimelineBody>
                </TimelineItem>
            ))}
        </Timeline>
    )

    return (
        <Dialog open={true} handler={onClose}>
            <DialogHeader className="text-2xl font-bold border-b pb-2 relative">
                Detail Berkas
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </DialogHeader>
            <DialogBody divider className="overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border-r pr-4">
                        {renderField(
                            'Tanggal Terima',
                            new Date(berkas.tanggalTerima).toLocaleDateString()
                        )}
                        {renderField(
                            'No Berkas',
                            `${berkas.noBerkas}/${berkas.tahunBerkas}`
                        )}
                        {renderField('Nama Pemohon', berkas.namaPemohon)}
                        {berkas.PIC?.map((x, y) => (
                            <div key={y}>
                                {renderField(`Nama Kuasa`, x.namaPIC)}
                                {renderField(`Kontak Kuasa`, x.kontakPIC)}
                            </div>
                        ))}
                        {renderField(
                            'Alas Hak',
                            berkas.noHak
                                ? `${berkas.JenisHak} - ${berkas.noHak} / ${berkas.namaDesa} - ${berkas.namaKecamatan}`
                                : `${berkas.JenisHak} / ${berkas.namaDesa} - ${berkas.namaKecamatan}`
                        )}
                        {renderField('Jumlah Bidang', berkas.jumlahBidang)}
                        {renderField('Luas', berkas.luas)}
                        {renderField(
                            'Tanggal Entri',
                            new Date(berkas.dateIn).toLocaleDateString()
                        )}
                    </div>
                    <div>
                        {renderField(
                            'Status Perjalanan',
                            berkas.status[berkas.status.length - 1]?.name
                        )}
                        {renderField(
                            'Nama Petugas Ukur',
                            berkas.namaPetugasUkur
                        )}
                        {renderField(
                            'Tanggal SPS',
                            new Date(berkas.tanggalSPS).toLocaleDateString()
                        )}
                        {renderField('Petugas SPS', berkas.namaPetugasSPS)}
                        {renderField(
                            'Status Alih Media',
                            berkas.statusAlihMedia ? 'Sudah' : 'Belum'
                        )}
                        {renderField(
                            'Status Bayar PNBP',
                            berkas.statusBayarPNBP ? 'Sudah' : 'Belum'
                        )}
                    </div>
                </div>

                <div className="mt-6 border-t pt-4">
                    <div>
                        <GenerateQRCode id={berkas._id} ref={qrCodeRef} />
                    </div>
                    <Button
                        color="blue"
                        size="sm"
                        onClick={handlePrintQRCode}
                        className="mt-4"
                    >
                        Print Barcode
                    </Button>
                </div>

                <div className="mt-6 border-t pt-4">
                    <Typography
                        variant="h6"
                        className="text-lg font-bold text-gray-800 mb-4"
                    >
                        Timeline Status
                    </Typography>
                    {renderTimeline()}
                </div>
            </DialogBody>
            <DialogFooter className="show-on-mobile">
                {roleNow === 'Admin' || roleNow === 'PelaksanaEntri' ? (
                    <>
                        <IconButton
                            variant="text"
                            color="blue"
                            onClick={() => {
                                onClose()
                                setSelectedBerkas(berkas)
                                setShowUpdatePopup(true)
                            }}
                        >
                            <PencilIcon className="h-5 w-5" />
                        </IconButton>
                        <IconButton
                            variant="text"
                            color="red"
                            onClick={() => handleDeleteBerkas(berkas._id)}
                        >
                            <TrashIcon className="h-5 w-5" />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <Button
                            variant="gradient"
                            color="green"
                            size="sm"
                            onClick={() =>
                                handleSelesai(
                                    berkas._id,
                                    berkas.status[berkas.status?.length - 1]
                                        ?.statusDetail[
                                        berkas.status[berkas.status?.length - 1]
                                            ?.statusDetail?.length - 1
                                    ]?.nama,
                                    berkas
                                )
                            }
                        >
                            Selesai
                        </Button>
                        {berkas.status[berkas.status?.length - 1]?.statusDetail[
                            berkas.status[berkas.status?.length - 1]
                                ?.statusDetail?.length - 1
                        ]?.nama !== 'Terhenti' && (
                            <Button
                                variant="gradient"
                                color="red"
                                size="sm"
                                onClick={() => handleTerhenti(berkas._id)}
                            >
                                Terhenti
                            </Button>
                        )}
                    </>
                )}
            </DialogFooter>
        </Dialog>
    )
}

export default DetailModal
