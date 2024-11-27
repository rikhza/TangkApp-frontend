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
    NIK: data.NIK || "", // Berikan nilai default berupa string kosong
    nama: data.nama || "", // Berikan nilai default berupa string kosong
    _id: data._id, // Pastikan _id diterima apa adanya
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [controller] = useMaterialTailwindController();
  const { token } = controller;

  const validateForm = () => {
    const newErrors = {};
    if (!String(formData.NIK).trim()) newErrors.NIK = "NIK tidak boleh kosong";
    if (!String(formData.nama).trim()) newErrors.nama = "Nama tidak boleh kosong";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `petugas-ukur/${formData._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        onUpdateSuccess();
      }
    } catch (error) {
      alert("Gagal memperbarui petugas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} handler={onClose}>
      <DialogHeader>Edit Petugas Ukur</DialogHeader>
      <DialogBody style={{ display: "grid", gap: "10px" }}>
        <div>
          <Input
            label="NIK"
            value={formData.NIK}
            onChange={(e) => setFormData({ ...formData, NIK: e.target.value })}
            style={{
              borderColor: errors.NIK ? "red" : undefined,
            }}
          />
          {errors.NIK && (
            <span style={{ color: "red", fontSize: "12px" }}>{errors.NIK}</span>
          )}
        </div>
        <div>
          <Input
            label="Nama"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            style={{
              borderColor: errors.nama ? "red" : undefined,
            }}
          />
          {errors.nama && (
            <span style={{ color: "red", fontSize: "12px" }}>{errors.nama}</span>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" onClick={onClose}>
          Batal
        </Button>
        <Button variant="gradient" onClick={handleUpdate} disabled={loading}>
          {loading ? "Loading..." : "Simpan"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default PopUpUpdatePetugas;
