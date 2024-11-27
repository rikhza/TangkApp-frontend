import React, { useState, useEffect, useRef } from 'react'
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Button,
    Typography,
    Alert,
} from '@material-tailwind/react'
import Select from 'react-select'
import axios from '../api/apiTangkApp'
import { useMaterialTailwindController } from '@/context'

const PopUpInsertBerkas = ({ onClose, onInsertSuccess }) => {
    const currentYear = new Date().getFullYear()
    const years = Array.from(
        { length: currentYear - 2020 + 1 },
        (_, i) => 2020 + i
    )

    const [controller] = useMaterialTailwindController()
    const { user } = controller
    const [alertMessage, setAlertMessage] = useState('')
    const [validationErrors, setValidationErrors] = useState({})
    const [selectedSubsek, setSelectedSubsek] = useState(null)
    const [selectedKegiatan, setSelectedKegiatan] = useState(null)

    const [formData, setFormData] = useState({
        idBerkas: '',
        noBerkas: '',
        tahunBerkas: currentYear,
        tanggalTerima: new Date().toISOString().split('T')[0], // Default tanggal hari ini
        idKegiatan: '',
        namaSubsek: 'Survei dan Pemetaan',
        namaKegiatan: '',
        idPemohon: '',
        namaPemohon: '',
        pemohonBaru: false,
        idJenisHak: '',
        JenisHak: '',
        noHak: '-',
        idDesa: '',
        namaDesa: '',
        namaKecamatan: '',
        idPetugasUkur: '',
        namaPetugasUkur: '',
        jumlahBidang: 1,
        luas: '',
        idPetugasSPS: '',
        namaPetugasSPS: '',
        tanggalSPS: '',
        statusAlihMedia: false,
        statusBayarPNBP: false,
        // PIC: [{ namaPIC: '', kontakPIC: '' }],
        namaPIC: '',
        kontakPIC: '',
        idUser: user._id,
    })

    // const [newPIC, setNewPIC] = useState({ namaPIC: '', kontakPIC: '' }) // Menampung input PIC baru

    const [dropdownData, setDropdownData] = useState({
        kegiatan: [],
        pemohon: [],
        jenisHak: [],
        desa: [],
        petugasUkur: [],
        petugasSPS: [],
    })

    useEffect(() => {
        if (formData.noBerkas && formData.tahunBerkas) {
            setFormData((prev) => ({
                ...prev,
                idBerkas: `${formData.noBerkas}${formData.tahunBerkas}`,
            }))
        }
    }, [formData.noBerkas, formData.tahunBerkas])

    const [loading, setLoading] = useState(false)

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [
                    kegiatanRes,
                    pemohonRes,
                    jenisHakRes,
                    desaRes,
                    petugasUkurRes,
                    petugasSPSRes,
                ] = await Promise.all([
                    axios.get('berkas/kegiatan'),
                    axios.get('berkas/pemohon'),
                    axios.get('berkas/jenisHak'),
                    axios.get('berkas/desa'),
                    axios.get('berkas/petugasUkur'),
                    axios.get('berkas/petugasSPS'),
                ])

                setDropdownData({
                    kegiatan: kegiatanRes.data,
                    pemohon: [
                        {
                            label: 'Belum Terdaftar',
                            value: 'baru',
                            isNew: true,
                        },
                        ...pemohonRes.data.map((item) => ({
                            label: item.namaPemohon,
                            value: item._id,
                        })),
                    ],
                    jenisHak: jenisHakRes.data,
                    desa: desaRes.data,
                    petugasUkur: petugasUkurRes.data,
                    petugasSPS: petugasSPSRes.data,
                })
            } catch (error) {
                console.error('Gagal mengambil data dropdown:', error)
            }
        }

        fetchDropdownData()
    }, [])

    const subsekOptions = [
        ...new Set(dropdownData.kegiatan.map((item) => item.namaSubsek)),
    ].map((namaSubsek) => ({ label: namaSubsek, value: namaSubsek }))

    const kegiatanOptions = dropdownData.kegiatan
        .filter((item) => item.namaSubsek === 'Survei dan Pemetaan') // Filter kegiatan berdasarkan subsek
        .map((item) => ({
            label: item.namaKegiatan,
            value: item._id,
        }))

    const handleInsert = async (print) => {
        let {
            idBerkas,
            noBerkas,
            tahunBerkas,
            tanggalTerima,
            idKegiatan,
            namaSubsek,
            namaKegiatan,
            idPemohon,
            namaPemohon,
            idJenisHak,
            JenisHak,
            noHak,
            idDesa,
            namaDesa,
            namaKecamatan,
            jumlahBidang,
            luas,
            tanggalSPS,
            namaPIC,
            kontakPIC,
            pemohonBaru,
            idPetugasSPS,
            namaPetugasSPS,
            idPetugasUkur,
            namaPetugasUkur,
        } = formData

        // Validasi semua kolom wajib
        const errors = {}
        if (!noBerkas) errors.noBerkas = 'No Berkas wajib diisi.'
        if (!tanggalTerima) errors.tanggalTerima = 'Tanggal Terima wajib diisi.'
        if (!idKegiatan) errors.idKegiatan = 'Kegiatan wajib dipilih.'
        if (!namaSubsek) errors.namaSubsek = 'Nama Seksi wajib diisi.'
        if (!namaKegiatan) errors.namaKegiatan = 'Nama Kegiatan wajib diisi.'
        if (!pemohonBaru && !idPemohon)
            errors.idPemohon = 'Pemohon wajib dipilih.'
        if (!pemohonBaru && !namaPemohon)
            errors.namaPemohon = 'Nama Pemohon Baru wajib diisi.'
        if (!idJenisHak) errors.idJenisHak = 'Jenis Hak wajib dipilih.'
        if (!JenisHak) errors.JenisHak = 'Nama Jenis Hak wajib diisi.'
        // if (!noHak) errors.noHak = 'No Hak wajib diisi.'
        if (!noHak) {
            noHak = '-'
        }
        if (!idDesa) errors.idDesa = 'Desa wajib dipilih.'
        if (!namaDesa) errors.namaDesa = 'Nama Desa wajib diisi.'
        if (!namaKecamatan) errors.namaKecamatan = 'Nama Kecamatan wajib diisi.'
        if (!jumlahBidang || jumlahBidang < 1)
            errors.jumlahBidang = 'Jumlah Bidang minimal 1.'
        if (!luas || luas <= 0)
            errors.luas = 'Luas wajib diisi dan harus lebih dari 0.'
        if (!idPetugasSPS) errors.idPetugasSPS = 'Petugas SPS Wajib dipilih.'
        if (!namaPetugasSPS)
            errors.namaPetugasSPS = 'Petugas SPS wajib dipilih.'
        if (!tanggalSPS) errors.tanggalSPS = 'Tanggal SPS wajib diisi.'
        if (!namaPIC) errors.namaPIC = 'Nama Kuasa wajib diisi.'
        if (!kontakPIC) errors.kontakPIC = 'Kontak Kuasa wajib diisi.'
        // if (!idPetugasUkur) errors.idPetugasUkur = 'Petugas Ukur Wajib dipilih.'
        // Jika ada error, simpan ke state dan hentikan proses
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            setAlertMessage('Harap periksa semua field yang wajib diisi!')
            return
        }

        setFormData({
            ...formData,
            noBerkas: formData.noBerkas.toString(),
        })
        setValidationErrors({}) // Reset error jika validasi berhasil
        setLoading(true)
        try {
            const response = await axios.post('berkas/insert', formData)
            if (response.status === 200) {
                onInsertSuccess(response.data, print)
                onClose()
            }
        } catch (error) {
            setValidationErrors(errors)
            // setAlertMessage(error.response.data.error)
            console.error('Gagal menambahkan data:', error)
        } finally {
            setLoading(false)
        }
    }

    const popupRef = useRef(null)
    useEffect(() => {
        if (alertMessage && popupRef.current) {
            popupRef.current.scrollTop = 0 // Scroll ke atas saat ada pesan error
        }
    }, [alertMessage])

    return (
        <Dialog
            open={true}
            handler={onClose}
            className="w-full max-w-screen-lg"
        >
            <DialogHeader>Tambah Berkas Baru</DialogHeader>
            <DialogBody divider className="overflow-y-auto max-h-[80vh] px-6">
                {alertMessage && (
                    <Alert color="red" className="mb-4">
                        {alertMessage}
                    </Alert>
                )}

                {/* Layout Grid Responsif */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Tanggal Terima */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.tanggalTerima
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Tanggal Terima
                        </Typography>
                        <Input
                            name="tanggalTerima"
                            type="date"
                            value={formData.tanggalTerima}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    tanggalTerima: e.target.value,
                                })
                            }
                            className={`w-full ${
                                validationErrors.tanggalTerima
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.tanggalTerima && (
                            <Typography className="text-red-500 text-sm mt-1">
                                {validationErrors.tanggalTerima}
                            </Typography>
                        )}
                    </div>
                    {/* No Berkas */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.noBerkas
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            No Berkas
                        </Typography>
                        <Input
                            name="noBerkas"
                            type="number"
                            value={formData.noBerkas}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    noBerkas: e.target.value,
                                })
                            }
                            className={`w-full ${
                                validationErrors.noBerkas
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.noBerkas && (
                            <Typography className="text-red-500 text-sm mt-1">
                                {validationErrors.noBerkas}
                            </Typography>
                        )}
                    </div>
                    {/* Tahun Berkas */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.tahunBerkas
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Tahun Berkas
                        </Typography>
                        <Input
                            name="tahunBerkas"
                            type="text"
                            value={formData.tahunBerkas}
                            className={`w-full ${
                                validationErrors.tahunBerkas
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                    </div>

                    {/* Kegiatan */}
                    <div className="col-span-full">
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.idKegiatan
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Kegiatan
                        </Typography>
                        <Select
                            options={dropdownData.kegiatan
                                .filter(
                                    (item) =>
                                        item.namaSubsek ===
                                        'Survei dan Pemetaan'
                                ) // Filter hanya untuk subsek "Survei dan Pemetaan"
                                .map((item) => ({
                                    label: item.namaKegiatan,
                                    value: item._id,
                                }))}
                            placeholder="Pilih Kegiatan"
                            onChange={(selected) => {
                                const item = dropdownData.kegiatan.find(
                                    (k) => k._id === selected?.value
                                )
                                setFormData({
                                    ...formData,
                                    idKegiatan: item?._id || '',
                                    namaKegiatan: item?.namaKegiatan || '',
                                })
                            }}
                            className={`w-full ${
                                validationErrors.idKegiatan
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.idKegiatan && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Kegiatan wajib dipilih.
                            </Typography>
                        )}
                    </div>

                    {/* Pemohon */}
                    <div className="col-span-full">
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.idPemohon
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Pemohon
                        </Typography>
                        <Select
                            options={dropdownData.pemohon}
                            placeholder="Pilih Pemohon"
                            onChange={(selected) => {
                                if (selected.isNew) {
                                    setFormData({
                                        ...formData,
                                        pemohonBaru: true,
                                        idPemohon: '',
                                        namaPemohon: '',
                                    })
                                } else {
                                    setFormData({
                                        ...formData,
                                        pemohonBaru: false,
                                        idPemohon: selected?.value || '',
                                        namaPemohon: selected?.label || '',
                                    })
                                }
                            }}
                        />
                        {formData.pemohonBaru && (
                            <Input
                                label="Nama Pemohon Baru"
                                value={formData.namaPemohon}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        namaPemohon:
                                            e.target.value.toUpperCase(),
                                    })
                                }
                            />
                        )}
                        {validationErrors.idPemohon && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Pemohon wajib dipilih.
                            </Typography>
                        )}
                    </div>

                    {/* Tipe Hak */}
                    <div className="col-span-full">
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.idJenisHak
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Tipe Hak
                        </Typography>
                        <Select
                            options={dropdownData.jenisHak.map((item) => ({
                                label: item.JenisHak,
                                value: item._id,
                            }))}
                            placeholder="Pilih Tipe Hak"
                            onChange={(selected) => {
                                const item = dropdownData.jenisHak.find(
                                    (jh) => jh._id === selected?.value
                                )
                                setFormData({
                                    ...formData,
                                    idJenisHak: item?._id || '',
                                    JenisHak: item?.JenisHak || '',
                                })
                            }}
                            className={`w-full ${
                                validationErrors.idJenisHak
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.idJenisHak && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Tipe Hak wajib dipilih.
                            </Typography>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* No Hak */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.noHak
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Nomor
                        </Typography>
                        <Input
                            name="noHak"
                            type="number"
                            placeholder="-"
                            value={formData.noHak}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    noHak: e.target.value,
                                })
                            }
                            className={`w-full ${
                                validationErrors.noHak
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.noHak && (
                            <Typography className="text-red-500 text-sm mt-1">
                                No Hak wajib diisi.
                            </Typography>
                        )}
                    </div>

                    {/* Desa-Kecamatan */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.idDesa
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Letak Tanah
                        </Typography>
                        <Select
                            options={dropdownData.desa.map((item) => ({
                                label: `${item.namaDesa} - ${item.namaKecamatan}`,
                                value: item._id,
                            }))}
                            placeholder="Pilih Desa-Kecamatan"
                            onChange={(selected) => {
                                const item = dropdownData.desa.find(
                                    (d) => d._id === selected?.value
                                )
                                setFormData({
                                    ...formData,
                                    idDesa: item?._id || '',
                                    namaDesa: item?.namaDesa || '',
                                    namaKecamatan: item?.namaKecamatan || '',
                                })
                            }}
                            className={`w-full ${
                                validationErrors.idDesa
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.idDesa && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Desa wajib dipilih.
                            </Typography>
                        )}
                    </div>

                    {/* Baris Baru */}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* Jumlah Bidang */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.jumlahBidang
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Jumlah Bidang
                        </Typography>
                        <Input
                            name="jumlahBidang"
                            type="number"
                            defaultValue={1}
                            value={formData.jumlahBidang}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    jumlahBidang: parseInt(e.target.value, 10),
                                })
                            }
                            className={`w-full ${
                                validationErrors.jumlahBidang
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.jumlahBidang && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Jumlah Bidang wajib diisi.
                            </Typography>
                        )}
                    </div>

                    {/* Luas */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.luas
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Luas (m²)
                        </Typography>
                        <Input
                            name="luas"
                            type="number"
                            value={formData.luas || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    luas: parseFloat(e.target.value),
                                })
                            }
                            className={`w-full ${
                                validationErrors.luas
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.luas && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Luas wajib diisi.
                            </Typography>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* Tanggal SPS */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.tanggalSPS
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Tanggal SPS
                        </Typography>
                        <Input
                            name="tanggalSPS"
                            type="date"
                            value={formData.tanggalSPS}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    tanggalSPS: e.target.value,
                                })
                            }
                            className={`w-full ${
                                validationErrors.tanggalSPS
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.tanggalSPS && (
                            <Typography className="text-red-500 text-sm mt-1">
                                {validationErrors.tanggalSPS}
                            </Typography>
                        )}
                    </div>

                    {/* Petugas SPS */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.idPetugasSPS
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Petugas SPS
                        </Typography>
                        <Select
                            options={dropdownData.petugasSPS.map((item) => ({
                                label: item.namaPetugas,
                                value: item._id,
                            }))}
                            placeholder="Pilih Petugas SPS"
                            onChange={(selected) => {
                                const item = dropdownData.petugasSPS.find(
                                    (sps) => sps._id === selected?.value
                                )
                                setFormData({
                                    ...formData,
                                    idPetugasSPS: item?._id || '',
                                    namaPetugasSPS: item?.namaPetugas || '',
                                })
                            }}
                            className={`w-full ${
                                validationErrors.idPetugasSPS
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.idPetugasSPS && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Petugas SPS wajib dipilih.
                            </Typography>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* Kontak Kuasa */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.kontakPIC
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Kontak Kuasa (WhatsApp)
                        </Typography>
                        <Input
                            name="kontakPIC"
                            type="tel"
                            value={formData.kontakPIC}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    kontakPIC: e.target.value,
                                })
                            }
                            className={`w-full ${
                                validationErrors.kontakPIC
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.kontakPIC && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Kontak Kuasa wajib diisi.
                            </Typography>
                        )}
                    </div>

                    {/* Nama Kuasa */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.namaPIC
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Nama Kuasa
                        </Typography>
                        <Input
                            name="namaPIC"
                            value={formData.namaPIC}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    namaPIC: e.target.value,
                                })
                            }
                            className={`w-full ${
                                validationErrors.namaPIC
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.namaPIC && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Nama Kuasa wajib diisi.
                            </Typography>
                        )}
                    </div>

                    {/* Baris Baru */}
                </div>
                <div className="grid grid-cols-1 mt-4">
                    {/* Petugas Ukur */}
                    <div>
                        <Typography
                            className={`text-sm mb-1 ${
                                validationErrors.idPetugasUkur
                                    ? 'text-red-500'
                                    : 'text-gray-600'
                            }`}
                        >
                            Petugas Ukur
                        </Typography>
                        <Select
                            options={dropdownData.petugasUkur.map((item) => ({
                                label: item.nama,
                                value: item._id,
                            }))}
                            placeholder="Pilih Petugas Ukur"
                            onChange={(selected) => {
                                const item = dropdownData.petugasUkur.find(
                                    (pu) => pu._id === selected?.value
                                )
                                setFormData({
                                    ...formData,
                                    idPetugasUkur: item?._id || '',
                                    namaPetugasUkur: item?.nama || '',
                                })
                            }}
                            className={`w-full ${
                                validationErrors.idPetugasUkur
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        {validationErrors.idPetugasUkur && (
                            <Typography className="text-red-500 text-sm mt-1">
                                Petugas Ukur wajib dipilih.
                            </Typography>
                        )}
                    </div>
                </div>
            </DialogBody>
            <DialogFooter>
                <Button
                    variant="text"
                    color="red"
                    onClick={onClose}
                    className="mr-2"
                >
                    Batal
                </Button>
                <Button
                    variant="gradient"
                    color="blue"
                    onClick={() => handleInsert(false)}
                    disabled={loading}
                    className="mr-2"
                >
                    {loading ? 'Loading...' : 'Tambah'}
                </Button>
                <Button
                    variant="gradient"
                    color="blue"
                    onClick={() => handleInsert(true)}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Tambah dan Print'}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}

export default PopUpInsertBerkas