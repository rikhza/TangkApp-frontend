import React, { useState, useEffect } from "react";
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
import Select from "react-select"; // Import react-select

const PopUpUpdateUser = ({ data, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    NIK: data.NIK || "",
    nama: data.nama || "",
    role: [], // Awalnya kosong, diisi setelah transformasi data
    _id: data._id,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]); // State untuk role options
  const [controller] = useMaterialTailwindController();
  const { token } = controller;

  // Ambil daftar role dari API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('roles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const options = response.data.map((role) => ({
          value: role.nama, // Sesuaikan dengan struktur API
          label: role.nama,
        }));
        setRoleOptions(options);

        // Set nilai awal untuk role berdasarkan data user
        const selectedRoles = data.role.map((role) =>
          options.find((option) => option.value === role)
        );
        setFormData((prev) => ({ ...prev, role: selectedRoles }));
      } catch (error) {
        console.error('Error fetching roles:', error);
        alert('Gagal mengambil data role dari server.');
      }
    };

    fetchRoles();
  }, [data.role, token]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.NIK.trim()) newErrors.NIK = 'NIK tidak boleh kosong';
    if (!formData.nama.trim()) newErrors.nama = 'Nama tidak boleh kosong';
    if (formData.role.length === 0) newErrors.role = 'Role tidak boleh kosong';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    // Konversi role ke array of string sebelum dikirim ke backend
    const payload = {
      ...formData,
      role: formData.role.map((role) => role.value),
    };

    setLoading(true);
    try {
      const response = await axios.put(`user/${formData._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        onUpdateSuccess(response.data);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Gagal memperbarui user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} handler={onClose}>
      <DialogHeader>Edit User</DialogHeader>
      <DialogBody style={{ display: "grid", gap: "10px" }}>
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
        <Input
          label="Nama"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value.toUpperCase() })}
          style={{
            borderColor: errors.nama ? "red" : undefined,
          }}
        />
        {errors.nama && (
          <span style={{ color: "red", fontSize: "12px" }}>{errors.nama}</span>
        )}
        <Select
          isMulti
          name="role"
          options={roleOptions}
          value={formData.role} // Nilai dari react-select
          onChange={(selected) => setFormData({ ...formData, role: selected })}
          placeholder="Pilih Role"
          isSearchable
        />
        {errors.role && (
          <span style={{ color: "red", fontSize: "12px" }}>{errors.role}</span>
        )}
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

export default PopUpUpdateUser;
