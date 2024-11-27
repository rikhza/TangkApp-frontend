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

const PopUpInsertPetugas = ({ onClose, onInsertSuccess }) => {
  const [formData, setFormData] = useState({
    NIK: "",
    nama: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [controller] = useMaterialTailwindController();
  const { token } = controller;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.NIK.trim()) newErrors.NIK = "NIK tidak boleh kosong";
    if (!formData.nama.trim()) newErrors.nama = "Nama tidak boleh kosong";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInsert = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post("petugas-ukur", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        onInsertSuccess(response.data);
      }
    } catch (error) {
      alert("Gagal menambahkan petugas.");
    } finally {
      setLoading(false);
      onInsertSuccess();
    }
  };

  return (
      <Dialog open={true} handler={onClose}>
          <DialogHeader>Tambah Petugas Ukur</DialogHeader>
          <DialogBody style={{ display: 'grid', gap: '10px' }}>
              <div>
                  <Input
                      label="NIK"
                      type="number"
                      value={formData.NIK}
                      onChange={(e) =>
                          setFormData({ ...formData, NIK: e.target.value })
                      }
                      style={{
                          borderColor: errors.NIK ? 'red' : undefined,
                      }}
                  />
                  {errors.NIK && (
                      <span style={{ color: 'red', fontSize: '12px' }}>
                          {errors.NIK}
                      </span>
                  )}
              </div>
              <div>
                  <Input
                      label="Nama"
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
              </div>
          </DialogBody>
          <DialogFooter>
              <Button variant="text" onClick={onClose}>
                  Batal
              </Button>
              <Button
                  variant="gradient"
                  onClick={handleInsert}
                  disabled={loading}
              >
                  {loading ? 'Loading...' : 'Tambah'}
              </Button>
          </DialogFooter>
      </Dialog>
  )
};

export default PopUpInsertPetugas;
