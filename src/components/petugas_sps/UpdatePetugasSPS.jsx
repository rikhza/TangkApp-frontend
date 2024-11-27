import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";
import axios from "../../api/apiTangkApp";
import { useMaterialTailwindController } from "@/context";

const PopUpUpdatePetugas = ({ data, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
      nama: data.nama || '',
      _id: data._id,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [controller] = useMaterialTailwindController()
  const { token } = controller

  const validateForm = () => {
      const newErrors = {}
      if (!formData.nama.trim())
          newErrors.nama = 'Nama Petugas tidak boleh kosong'
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
  }

  const handleUpdate = async () => {
      if (!validateForm()) return

      setLoading(true)
      try {
          const response = await axios.put(
              `petugas-sps/${formData._id}`,
              formData,
              {
                  headers: { Authorization: `Bearer ${token}` },
              }
          )
          if (response.status === 200) {
              onUpdateSuccess(response.data)
          }
      } catch (error) {
          alert('Gagal memperbarui petugas.')
      } finally {
          setLoading(false)
      }
  }

  return (
      <Dialog open={true} handler={onClose}>
          <DialogHeader>Edit Petugas SPS</DialogHeader>
          <DialogBody>
              <Input
                  label="Nama Petugas"
                  value={formData.nama}
                  onChange={(e) =>
                      setFormData({
                          ...formData,
                          nama: e.target.value.toUpperCase(),
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
};

export default PopUpUpdatePetugas;