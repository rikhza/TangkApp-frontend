import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from '@material-tailwind/react';
import axios from '../../api/apiTangkApp';
import { useMaterialTailwindController } from '@/context';
import Select from 'react-select'; // Import react-select

const PopUpInsertUser = ({ onClose, onInsertSuccess }) => {
  const [formData, setFormData] = useState({
    NIK: '',
    nama: '',
    password: '',
    role: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]); // State untuk menyimpan roles dari database
  const [controller] = useMaterialTailwindController();
  const { token } = controller;

  useEffect(() => {
    fetchRoles(); // Ambil roles ketika komponen di-mount
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roleOptions = response.data.map((role) => ({
        value: role.nama,
        label: role.nama,
      }));
      setRoles(roleOptions); // Simpan ke state roles
    } catch (error) {
      console.error('Gagal mengambil roles:', error);
      alert('Gagal mengambil roles dari server.');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.NIK.trim()) newErrors.NIK = 'NIK tidak boleh kosong';
    if (!formData.nama.trim()) newErrors.nama = 'Nama tidak boleh kosong';
    if (formData.role.length === 0) newErrors.role = 'Role tidak boleh kosong';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInsert = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Konversi role menjadi array nilai string
      formData.role = formData.role.map((item) => item.value);

      // Mengirim data ke API
      const response = await axios.post('user/create', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Memastikan respons berhasil
      if (response.status === 201) {
        onInsertSuccess(response.data);
      } else {
        alert(`Gagal menambahkan user: ${response.statusText}`);
      }
    } catch (error) {
      // Penanganan error lebih jelas
      if (error.response) {
        console.error('Error Response:', error.response.data);
        alert(
          `Gagal menambahkan user: ${
            error.response.data.message || error.response.status
          }`
        );
      } else {
        console.error('Error Message:', error.message);
        alert('Gagal menambahkan user. Terjadi masalah jaringan atau server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} handler={onClose}>
      <DialogHeader>Tambah User</DialogHeader>
      <DialogBody style={{ display: 'grid', gap: '10px' }}>
        <Input
          label="NIK"
          value={formData.NIK}
          onChange={(e) => setFormData({ ...formData, NIK: e.target.value })}
          style={{
            borderColor: errors.NIK ? 'red' : undefined,
          }}
        />
        {errors.NIK && (
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.NIK}</span>
        )}
        <Input
          label="Nama"
          value={formData.nama}
          onChange={(e) =>
            setFormData({ ...formData, nama: e.target.value.toUpperCase() })
          }
          style={{
            borderColor: errors.nama ? 'red' : undefined,
          }}
        />
        {errors.nama && (
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.nama}</span>
        )}
        <Input
          label="Password (Opsional)"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <Select
          isMulti
          name="role"
          options={roles} // Gunakan roles dari database
          value={formData.role}
          onChange={(selected) => setFormData({ ...formData, role: selected })}
          getOptionLabel={(e) => e.label} // Customize label for options
          getOptionValue={(e) => e.value} // Customize value for options
          placeholder="Pilih Role"
          isSearchable
        />
        {errors.role && (
          <span style={{ color: 'red', fontSize: '12px' }}>{errors.role}</span>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" onClick={onClose}>
          Batal
        </Button>
        <Button variant="gradient" onClick={handleInsert} disabled={loading}>
          {loading ? 'Loading...' : 'Tambah'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default PopUpInsertUser;
