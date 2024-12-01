import React, { useState, useEffect } from 'react'
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
import Select from 'react-select' // Import react-select

const PopUpUpdateRole = ({ data, onClose, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        _id: data._id, // Make sure to include the ID for update
        nama: data.nama || '',
        accessStatus: data.accessStatus?.map((status) => status._id) || [], // Array to hold selected access status IDs
        kategoriBerkas: data.kategoriBerkas || '', // Add kategoriBerkas to the formData
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [statusData, setStatusData] = useState([]) // State to store status data
    const [controller] = useMaterialTailwindController()
    const { token } = controller

    useEffect(() => {
        fetchStatus() // Fetch status when the component mounts
    }, [])

    const fetchStatus = async () => {
        try {
            const response = await axios.get('status', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setStatusData(response.data || []) // Store status data
        } catch (error) {
            console.error('Failed to fetch status:', error)
            alert('Failed to fetch status data from the server.')
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.nama.trim()) newErrors.nama = 'Role name cannot be empty'
        if (formData.accessStatus.length === 0)
            newErrors.accessStatus = 'At least one access status is required'
        if (!formData.kategoriBerkas)
            newErrors.kategoriBerkas = 'Please select a category for Berkas' // Validate kategoriBerkas
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleUpdate = async () => {
        if (!validateForm()) return

        setLoading(true)
        try {
            // Before submitting, map the accessStatus IDs to full status objects
            const updatedAccessStatus = formData.accessStatus.map((id) => {
                return statusData.find((status) => status._id === id) // Find full status by _id
            })

            // Update formData with the full accessStatus objects
            const dataToSubmit = {
                ...formData,
                accessStatus: updatedAccessStatus,
            }

            // Send the updated data to the API
            const response = await axios.put(
                `roles/${formData._id}`,
                dataToSubmit,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            // Ensure successful response
            if (response.status === 200) {
                onUpdateSuccess(response.data)
            } else {
                alert(`Failed to update role: ${response.statusText}`)
            }
        } catch (error) {
            // Handle error
            if (error.response) {
                console.error('Error Response:', error.response.data)
                alert(
                    `Failed to update role: ${
                        error.response.data.message || error.response.status
                    }`
                )
            } else {
                console.error('Error Message:', error.message)
                alert(
                    'Failed to update role. There was a network or server issue.'
                )
            }
        } finally {
            setLoading(false)
        }
    }

    // Options for the kategoriBerkas dropdown
    const kategoriBerkasOptions = [
        { value: 'rutin', label: 'Rutin' },
        { value: 'alih-media', label: 'Alih-Media' },
    ]

    return (
        <Dialog open={true} handler={onClose}>
            <DialogHeader>Edit Role</DialogHeader>
            <DialogBody style={{ display: 'grid', gap: '10px' }}>
                <Input
                    label="Role Name"
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

                {/* Select Multiple Access Status */}
                <Select
                    isMulti
                    name="accessStatus"
                    options={statusData.map((status) => ({
                        value: status._id, // Using _id as value
                        label: status.nama, // Using nama as label
                    }))} // Map status data to options
                    value={formData.accessStatus.map((id) => ({
                        value: id,
                        label:
                            statusData.find((status) => status._id === id)
                                ?.nama || '',
                    }))} // Set the selected value based on formData.accessStatus
                    onChange={(selected) =>
                        setFormData({
                            ...formData,
                            accessStatus: selected.map((item) => item.value), // Store only the selected ids
                        })
                    }
                    placeholder="Select Access Status"
                    isSearchable
                />
                {errors.accessStatus && (
                    <span style={{ color: 'red', fontSize: '12px' }}>
                        {errors.accessStatus}
                    </span>
                )}

                {/* Select Kategori Berkas */}
                <Select
                    name="kategoriBerkas"
                    options={kategoriBerkasOptions} // Use predefined options for kategoriBerkas
                    value={kategoriBerkasOptions.find(
                        (option) => option.value === formData.kategoriBerkas
                    )}
                    onChange={(selected) =>
                        setFormData({
                            ...formData,
                            kategoriBerkas: selected.value,
                        })
                    }
                    placeholder="Select Kategori Berkas"
                />
                {errors.kategoriBerkas && (
                    <span style={{ color: 'red', fontSize: '12px' }}>
                        {errors.kategoriBerkas}
                    </span>
                )}
            </DialogBody>
            <DialogFooter>
                <Button variant="text" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="gradient"
                    onClick={handleUpdate}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Update Role'}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}

export default PopUpUpdateRole
