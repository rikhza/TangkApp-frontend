import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Button,
    Typography,
    Alert,
    Switch,
    Textarea,
} from '@material-tailwind/react'
import Select from 'react-select'
import axios from '../api/apiTangkApp'

const PopUpSelesai = ({ data, onClose, onCompleteSuccess }) => {
    const [formData, setFormData] = useState({
        ...data,
        statusBayarPNBP: true,
        notes: '',
    })
    const [dropdownData, setDropdownData] = useState({
        petugasUkur: [],
    })
    const [loading, setLoading] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')

    const handleComplete = async () => {
        // Validasi form: pastikan tanggal selesai diisi
        if (!formData.idPetugasUkur) {
            setAlertMessage('Petugas ukur wajib diisi!')
            return
        }

        setLoading(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulasi delay API
            onCompleteSuccess(formData)
            onClose()
        } catch (error) {
            console.error('Gagal menyelesaikan proses:', error)
            setAlertMessage('Terjadi kesalahan, silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [petugasUkurRes] = await Promise.all([
                    axios.get('berkas/petugasUkur'),
                ])

                setDropdownData({
                    petugasUkur: petugasUkurRes.data,
                })
            } catch (error) {
                console.error('Gagal mengambil data dropdown:', error)
            }
        }

        fetchDropdownData()
    }, [])

    return (
        <Dialog open={true} handler={onClose}>
            <DialogHeader>Selesaikan Proses</DialogHeader>
            <DialogBody
                divider
                className="overflow-y-auto max-h-[80vh] px-4 sm:px-6"
                style={{ overflow: 'visible' }}
            >
                {alertMessage && (
                    <Alert color="red" className="mb-4">
                        {alertMessage}
                    </Alert>
                )}
                <div className="grid grid-cols-1 gap-6">
                    {/* Tanggal Selesai */}
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
                                    idPetugasUkur: item._id,
                                    namaPetugasUkur: item.nama,
                                })
                            }}
                        />
                    </div>

                    {/* Keterangan */}
                    <div>
                        {data.statusTerhenti === 'Terhenti' && (
                            <Textarea
                                value={formData.notes}
                                label="Catatan Terhenti"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notes: e.target.value,
                                    })
                                }
                            />
                        )}
                    </div>
                    <div>
                        <Switch
                            value={formData.statusBayarPNBP}
                            label="Status PNBP"
                            defaultChecked
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
                    color="green"
                    onClick={handleComplete}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Selesai'}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}

export default PopUpSelesai
