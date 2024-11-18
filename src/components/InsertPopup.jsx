import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Button,
    Typography,
    Alert,
} from "@material-tailwind/react";
import Select from "react-select";
import axios from "../api/apiTangkApp";
import { useMaterialTailwindController } from "@/context";

const PopUpInsertBerkas = ({ onClose, onInsertSuccess }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);

    const [controller] = useMaterialTailwindController();
    const { user } = controller;
    const [alertMessage, setAlertMessage] = useState("");

    const [formData, setFormData] = useState({
        idBerkas: "",
        noBerkas: "",
        tahunBerkas: currentYear,
        tanggalTerima: "",
        idKegiatan: "",
        namaSubsek: "",
        namaKegiatan: "",
        idPemohon: "",
        namaPemohon: "",
        pemohonBaru: false,
        idJenisHak: "",
        JenisHak: "",
        noHak: "",
        idDesa: "",
        namaDesa: "",
        namaKecamatan: "",
        idPetugasUkur: "",
        namaPetugasSPS: "",
        tanggalSPS: "",
        statusAlihMedia: false,
        statusBayarPNBP: false,
        PIC: [], 
        idUser: user._id
    });

    const [newPIC, setNewPIC] = useState({ namaPIC: "", kontakPIC: "" }); // Menampung input PIC baru

    const [dropdownData, setDropdownData] = useState({
        kegiatan: [],
        pemohon: [],
        jenisHak: [],
        desa: [],
        petugasUkur: [],
    });

    useEffect(() => {
        if (formData.noBerkas && formData.tahunBerkas) {
            setFormData((prev) => ({
                ...prev,
                idBerkas: `${formData.noBerkas}${formData.tahunBerkas}`,
            }));
        }
    }, [formData.noBerkas, formData.tahunBerkas]);

    const [loading, setLoading] = useState(false);

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [kegiatanRes, pemohonRes, jenisHakRes, desaRes, petugasUkurRes] =
                    await Promise.all([
                        axios.get("berkas/kegiatan"),
                        axios.get("berkas/pemohon"),
                        axios.get("berkas/jenisHak"),
                        axios.get("berkas/desa"),
                        axios.get("berkas/petugasUkur"),
                    ]);

                setDropdownData({
                    kegiatan: kegiatanRes.data,
                    pemohon: [
                        { label: "Belum Terdaftar", value: "baru", isNew: true },
                        ...pemohonRes.data.map((item) => ({
                            label: item.namaPemohon,
                            value: item.idPemohon,
                        })),
                    ],
                    jenisHak: jenisHakRes.data,
                    desa: desaRes.data,
                    petugasUkur: petugasUkurRes.data,
                });
            } catch (error) {
                console.error("Gagal mengambil data dropdown:", error);
            }
        };

        fetchDropdownData();
    }, []);

    const handleInsertPIC = () => {
        if (newPIC.namaPIC && newPIC.kontakPIC) {
            setFormData((prev) => ({
                ...prev,
                PIC: [...prev.PIC, { ...newPIC }],
            }));
            setNewPIC({ namaPIC: "", kontakPIC: "" }); // Reset input PIC
        }
    };

    const handleRemovePIC = (index) => {
        setFormData((prev) => ({
            ...prev,
            PIC: prev.PIC.filter((_, i) => i !== index),
        }));
    };

    const handleInsert = async () => {
        const {
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
            namaPetugasSPS,
            tanggalSPS,
        } = formData;

        // Validasi semua kolom wajib kecuali PIC
        if (
            !idBerkas ||
            !noBerkas ||
            !tahunBerkas ||
            !tanggalTerima ||
            !idKegiatan ||
            !namaSubsek ||
            !namaKegiatan ||
            !idPemohon ||
            !namaPemohon ||
            !idJenisHak ||
            !JenisHak ||
            !noHak ||
            !idDesa ||
            !namaDesa ||
            !namaKecamatan ||
            !namaPetugasSPS ||
            !tanggalSPS
        ) {
            setAlertMessage("Harap isi semua kolom yang wajib diisi!");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post("berkas/insert", formData);
            if (response.status === 200) {
                onInsertSuccess(response.data); // Kirim data baru ke parent
                onClose(); // Tutup popup
            }
        } catch (error) {
            console.error("Gagal menambahkan data:", error);
        } finally {
            setLoading(false);
        }
    };
    const popupRef = useRef(null);
    useEffect(() => {
        if (alertMessage && popupRef.current) {
            popupRef.current.scrollTop = 0; // Scroll ke atas saat ada pesan error
        }
    }, [alertMessage]);
    return (
        <Dialog open={true} handler={onClose} >
            <DialogHeader>Tambah Berkas Baru</DialogHeader>
            <DialogBody divider className="overflow-y-auto max-h-[80vh]"  ref={popupRef}>
                {alertMessage && (
                    <Alert color="red" className="mb-4">
                        {alertMessage}
                    </Alert>
                )}
                <div className="grid gap-4">
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            ID Berkas
                        </Typography>
                        <Input
                            label="ID Berkas"
                            name="idBerkas"
                            value={formData.idBerkas}
                            onChange={(e) => setFormData({ ...formData, idBerkas: e.target.value })}
                            disabled
                        />
                    </div>
                    <Input
                        label="No Berkas"
                        name="noBerkas"
                        type="number"
                        value={formData.noBerkas}
                        onChange={(e) => setFormData({ ...formData, noBerkas: e.target.value })}
                    />
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Tahun
                        </Typography>
                        <Select
                            options={years.map((year) => ({ label: year, value: year }))}
                            placeholder="Pilih Tahun"
                            defaultInputValue={currentYear}
                            onChange={(selected) =>
                                setFormData({ ...formData, tahunBerkas: selected.value })
                            }
                        />
                    </div>
                    <Input
                        label="Tanggal Terima"
                        name="tanggalTerima"
                        type="date"
                        value={formData.tanggalTerima}
                        onChange={(e) => setFormData({ ...formData, tanggalTerima: e.target.value })}
                    />

                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Kegiatan
                        </Typography>
                        <Select
                            options={dropdownData.kegiatan.map((item) => ({
                                label: item.namaKegiatan,
                                value: item.idKegiatan,
                            }))}
                            placeholder="Pilih Kegiatan"
                            onChange={(selected) => {
                                const item = dropdownData.kegiatan.find(
                                    (k) => k.idKegiatan === selected.value
                                );
                                setFormData({
                                    ...formData,
                                    idKegiatan: item.idKegiatan,
                                    namaSubSek: item.namaSubsek,
                                    namaKegiatan: item.namaKegiatan,
                                });
                            }}
                        />
                    </div>

                    {/* Dropdown Pemohon dengan Auto-complete */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Pemohon
                        </Typography>
                        <Select
                            options={dropdownData.pemohon}
                            placeholder="Pilih atau Tambah Pemohon"
                            onChange={(selected) => {
                                if (selected.isNew) {
                                    setFormData({ ...formData, pemohonBaru: true, idPemohon: "", namaPemohon: "" });
                                } else {
                                    setFormData({
                                        ...formData,
                                        pemohonBaru: false,
                                        idPemohon: selected.value,
                                        namaPemohon: selected.label,
                                    });
                                }
                            }}
                        />
                        {/* Input Nama Pemohon Baru */}
                        {formData.pemohonBaru && (
                            <Input
                                label="Nama Pemohon Baru"
                                value={formData.namaPemohon}
                                onChange={(e) => setFormData({ ...formData, namaPemohon: e.target.value })}
                            />
                        )}
                    </div>

                    {/* Dropdown Jenis Hak */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Jenis Hak
                        </Typography>
                        <Select
                            options={dropdownData.jenisHak.map((item) => ({
                                label: item.JenisHak,
                                value: item.idJenisHak,
                            }))}
                            placeholder="Pilih Jenis Hak"
                            onChange={(selected) => {
                                const item = dropdownData.jenisHak.find(
                                    (jh) => jh.idJenisHak === selected.value
                                );
                                setFormData({ ...formData, idJenisHak: item.idJenisHak, JenisHak: item.JenisHak });
                            }}
                        />
                    </div>

                    <Input
                        label="No Hak"
                        value={formData.noHak}
                        type="number"
                        onChange={(e) => setFormData({ ...formData, noHak: e.target.value })}
                    />
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Kecamatan
                        </Typography>
                        <Input label="Nama Kecamatan" value={formData.namaKecamatan} disabled />
                    </div>
                    {/* Dropdown Desa */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Desa
                        </Typography>
                        <Select
                            options={dropdownData.desa.map((item) => ({
                                label: item.namaDesa,
                                value: item.idDesa,
                            }))}
                            placeholder="Pilih Desa"
                            onChange={(selected) => {
                                const item = dropdownData.desa.find((d) => d.idDesa === selected.value);
                                setFormData({
                                    ...formData,
                                    idDesa: item.idDesa,
                                    namaDesa: item.namaDesa,
                                    namaKecamatan: item.namaKecamata,
                                });
                            }}
                        />
                    </div>

                    <Input
                        label="Nama Petugas SPS"
                        value={formData.namaPetugasSPS}
                        onChange={(e) => setFormData({ ...formData, namaPetugasSPS: e.target.value })}
                    />

                    <Input
                        label="Tanggal SPS"
                        type="date"
                        value={formData.tanggalSPS}
                        onChange={(e) => setFormData({ ...formData, tanggalSPS: e.target.value })}
                    />

                    {/* Dropdown Petugas Ukur */}
                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Petugas Ukur
                        </Typography>
                        <Select
                            options={dropdownData.petugasUkur.map((item) => ({
                                label: item.nama,
                                value: item.idPetugasUkur,
                            }))}
                            placeholder="Pilih Petugas Ukur"
                            onChange={(selected) => {
                                const item = dropdownData.petugasUkur.find(
                                    (pu) => pu.idPetugasUkur === selected.value
                                );
                                setFormData({ ...formData, idPetugasUkur: item.idPetugasUkur });
                            }}
                        />
                    </div>

                    <div>
                        <Typography className="text-sm text-gray-600 mb-1">
                            Tambahkan PIC (Person in Charge)
                        </Typography>
                        <div className="flex gap-2">
                            <Input
                                label="Nama PIC"
                                value={newPIC.namaPIC}
                                onChange={(e) =>
                                    setNewPIC({ ...newPIC, namaPIC: e.target.value })
                                }
                            />
                            <Input
                                label="Kontak PIC"
                                value={newPIC.kontakPIC}
                                onChange={(e) =>
                                    setNewPIC({ ...newPIC, kontakPIC: e.target.value })
                                }
                            />
                            <Button
                                variant="gradient"
                                color="blue"
                                onClick={handleInsertPIC}
                            >
                                Tambah PIC
                            </Button>
                        </div>
                        <ul className="mt-2">
                            {formData.PIC.map((pic, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between mb-2"
                                >
                                    <Typography>
                                        {pic.namaPIC} - {pic.kontakPIC}
                                    </Typography>
                                    <Button
                                        variant="text"
                                        color="red"
                                        onClick={() => handleRemovePIC(index)}
                                    >
                                        Hapus
                                    </Button>
                                </li>
                            ))}
                        </ul>
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
                    onClick={handleInsert}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Tambah"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default PopUpInsertBerkas;