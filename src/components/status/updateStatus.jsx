import React, { useState } from 'react'
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Button,
} from '@material-tailwind/react'
import axios from '../../api/apiTangkApp'
import { useMaterialTailwindController } from '@/context'

const PopUpUpdateStatus = ({ data, onClose, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        indexStatus: data.indexStatus || '',
        nama: data.nama || '',
        _id: data._id,
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [controller] = useMaterialTailwindController()
    const { token } = controller

    const validateForm = () => {
        const newErrors = {}
        console.log(formData.indexStatus, formData.nama)

        if (!formData.indexStatus) {
            newErrors.indexStatus = 'Index Status tidak boleh kosong'
        }
        if (!formData.nama.trim()) {
            newErrors.nama = 'Nama Status tidak boleh kosong'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleUpdate = async () => {
        if (!validateForm()) return

        setLoading(true)
        try {
            const response = await axios.put(
                `status/${formData._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            if (response.status === 200) {
                onUpdateSuccess(response.data)
            }
        } catch (error) {
            alert('Gagal memperbarui status.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={true} handler={onClose}>
            <DialogHeader>Edit Status</DialogHeader>
            <DialogBody>
                <Input
                    label="Index Status"
                    type="number"
                    value={formData.indexStatus}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            indexStatus: e.target.value,
                        })
                    }
                    style={{
                        borderColor: errors.indexStatus ? 'red' : undefined,
                    }}
                />
                {errors.indexStatus && (
                    <span style={{ color: 'red', fontSize: '12px' }}>
                        {errors.indexStatus}
                    </span>
                )}
                <Input
                    label="Nama Status"
                    value={formData.nama}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            nama: e.target.value,
                        })
                    }
                    style={{
                        borderColor: errors.nama ? 'red' : undefined,
                    }}
                />
                {errors.nama && (
                    <span style={{ color: 'red', fontSize: '12px' }}>
                        {errors.nama}
                    </span>
                )}
            </DialogBody>
            <DialogFooter>
                <Button variant="text" onClick={onClose}>
                    Batal
                </Button>
                <Button
                    variant="gradient"
                    onClick={handleUpdate}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Simpan'}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}

export default PopUpUpdateStatus