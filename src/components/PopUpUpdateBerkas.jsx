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

const PopUpUpdateBerkas = ({ data, onClose, onUpdateSuccess }) => {
    const currentYear = new Date().getFullYear()

    const [formData, setFormData] = useState({
        ...data,
        tahunBerkas: currentYear,
        pemohonBaru: false,
    })

    const [dropdownData, setDropdownData] = useState({
        kegiatan: [],
        pemohon: [],
        jenisHak: [],
        desa: [],
        petugasUkur: [],
        petugasSPS: [],
    })

    const [loading, setLoading] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')

    const popupRef = useRef(null)

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

    useEffect(() => {
        if (alertMessage && popupRef.current) {
            popupRef.current.scrollTop = 0 // Scroll ke atas saat ada pesan error
        }
    }, [alertMessage])

    const handleUpdate = async () => {
        const requiredFields = [
            'idBerkas',
            'noBerkas',
            'tahunBerkas',
            'tanggalTerima',
            'idKegiatan',
            'namaSubsek',
            'namaKegiatan',
            'idPemohon',
            'namaPemohon',
            'idJenisHak',
            'JenisHak',
            'idDesa',
            'namaDesa',
            'namaKecamatan',
        ]

        const missingFields = requiredFields.filter((field) => !formData[field])
        if (missingFields.length > 0) {
            setAlertMessage('Harap isi semua kolom yang wajib diisi!')
            return
        }

        setLoading(true)
        try {
            setFormData({
                ...formData,
                noBerkas: formData.noBerkas.toString(),
            })
            const response = await axios.put(
                `berkas/update/${formData._id}`,
                formData
            )
            if (response.status === 200) {
                onUpdateSuccess(response.data)
                onClose()
            }
        } catch (error) {
            console.error('Gagal memperbarui data:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            open={true}
            handler={onClose}
            className="w-full max-w-screen-lg"
        >
            <DialogHeader>Update Berkas</DialogHeader>
            <DialogBody divider className="overflow-y-auto max-h-[80vh] px-6">
                {alertMessage && (
                    <Alert color="red" className="mb-4">
                        {alertMessage}
                    </Alert>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Tanggal Terima */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Tanggal Terima
                        </Typography>
                        <Input
                            type="date"
                            className="w-full"
                            value={formData.tanggalTerima}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    tanggalTerima: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* No Berkas */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            No Berkas
                        </Typography>
                        <Input
                            disabled
                            type="number"
                            className="w-full"
                            value={formData.noBerkas}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    noBerkas: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Tahun */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Tahun
                        </Typography>
                        <Input
                            disabled
                            type="text"
                            className="w-full"
                            value={formData.tahunBerkas}
                            readOnly
                        />
                    </div>

                    {/* Kegiatan */}
                    <div className="col-span-full">
                        <Typography className="text-sm text-gray-600 mb-1">
                            Kegiatan
                        </Typography>
                        <Select
                            className="w-full"
                            options={dropdownData.kegiatan
                                .filter(
                                    (item) =>
                                        item.namaSubsek ===
                                        'Survei dan Pemetaan'
                                )
                                .map((item) => ({
                                    label: item.namaKegiatan,
                                    value: item._id,
                                }))}
                            value={{
                                label: formData.namaKegiatan,
                                value: formData.idKegiatan,
                            }}
                            onChange={(selected) => {
                                const item = dropdownData.kegiatan.find(
                                    (k) => k._id === selected.value
                                )
                                setFormData({
                                    ...formData,
                                    idKegiatan: item._id,
                                    namaSubsek: item.namaSubsek,
                                    namaKegiatan: item.namaKegiatan,
                                })
                            }}
                        />
                    </div>

                    {/* Pemohon */}
                    <div className="col-span-full">
                        <Typography className="text-sm text-gray-600 mb-1">
                            Pemohon
                        </Typography>
                        <Select
                            className="w-full"
                            options={dropdownData.pemohon}
                            value={{
                                label: formData.namaPemohon,
                                value: formData.idPemohon,
                            }}
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
                                        idPemohon: selected.value,
                                        namaPemohon: selected.label,
                                    })
                                }
                            }}
                        />
                        {formData.pemohonBaru && (
                            <Input
                                className="w-full"
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
                    </div>

                    {/* Tipe Hak */}
                    <div className="col-span-full">
                        <Typography className="text-sm text-gray-600 mb-1">
                            Tipe Hak
                        </Typography>
                        <Select
                            className="w-full"
                            options={dropdownData.jenisHak.map((item) => ({
                                label: item.JenisHak,
                                value: item._id,
                            }))}
                            value={{
                                label: formData.JenisHak,
                                value: formData.idJenisHak,
                            }}
                            onChange={(selected) => {
                                const item = dropdownData.jenisHak.find(
                                    (jh) => jh._id === selected.value
                                )
                                setFormData({
                                    ...formData,
                                    idJenisHak: item._id,
                                    JenisHak: item.JenisHak,
                                })
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* No Hak */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            No Hak
                        </Typography>
                        <Input
                            type="number"
                            className="w-full"
                            value={formData.noHak}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    noHak: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Desa - Kecamatan */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Desa - Kecamatan
                        </Typography>
                        <Select
                            className="w-full"
                            options={dropdownData.desa.map((item) => ({
                                label: `${item.namaDesa} - ${item.namaKecamatan}`,
                                value: item._id,
                            }))}
                            value={{
                                label: `${formData.namaDesa} - ${formData.namaKecamatan}`,
                                value: formData.idDesa,
                            }}
                            onChange={(selected) => {
                                const item = dropdownData.desa.find(
                                    (d) => d._id === selected.value
                                )
                                setFormData({
                                    ...formData,
                                    idDesa: item._id,
                                    namaDesa: item.namaDesa,
                                    namaKecamatan: item.namaKecamatan,
                                })
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* Tanggal SPS */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Tanggal SPS
                        </Typography>
                        <Input
                            type="date"
                            className="w-full"
                            value={formData.tanggalSPS}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    tanggalSPS: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Petugas SPS */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Petugas SPS
                        </Typography>
                        <Select
                            className="w-full"
                            options={dropdownData.petugasSPS.map((item) => ({
                                label: item.nama,
                                value: item._id,
                            }))}
                            value={{
                                label: formData.namaPetugasSPS,
                                value: formData.idPetugasSPS,
                            }}
                            onChange={(selected) => {
                                const item = dropdownData.petugasSPS.find(
                                    (sps) => sps._id === selected.value
                                )
                                setFormData({
                                    ...formData,
                                    idPetugasSPS: item?._id || '',
                                    namaPetugasSPS: item?.nama || '',
                                })
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* Nama Kuasa */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Nama Kuasa
                        </Typography>
                        <Input
                            type="text"
                            className="w-full"
                            value={formData?.namaPIC || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    namaPIC: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Kontak Kuasa */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Kontak Kuasa (WhatsApp)
                        </Typography>
                        <Input
                            type="tel"
                            className="w-full"
                            value={formData?.kontakPIC || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    kontakPIC: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-4">
                    {/* Petugas Ukur */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Petugas Ukur
                        </Typography>
                        <Select
                            className="w-full"
                            options={dropdownData.petugasUkur.map((item) => ({
                                label: item.nama,
                                value: item._id,
                            }))}
                            value={{
                                label: formData.namaPetugasUkur,
                                value: formData.idPetugasUkur,
                            }}
                            onChange={(selected) => {
                                const item = dropdownData.petugasUkur.find(
                                    (ukur) => ukur._id === selected.value
                                )
                                setFormData({
                                    ...formData,
                                    idPetugasUkur: item?._id || '',
                                    namaPetugasUkur: item?.nama || '',
                                })
                            }}
                        />
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
                    onClick={handleUpdate}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Update'}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}

export default PopUpUpdateBerkas
