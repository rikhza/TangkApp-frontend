import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  IconButton,
  Button,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon } from "@heroicons/react/24/outline"; // Import icons
import { useMaterialTailwindController } from "@/context";
import { useEffect, useState } from "react";
import axios from "../../api/apiTangkApp"; // Import Axios instance
import PopUpInsertBerkas from "@/components/InsertPopup";
import DetailModal from "@/components/detailPopUp"; // Import the detail modal
import PopUpUpdateBerkas from "@/components/PopUpUpdateBerkas";

export function Tables() {
  const [controller] = useMaterialTailwindController();
  const { roleNow, token } = controller;

  const [berkasData, setBerkasData] = useState([]); // State untuk data berkas
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [showPopup, setShowPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedBerkas, setSelectedBerkas] = useState(null); // State for selected berkas for detail modal

  const processBerkasData = (data) => {
    return data.map((berkas) => {
      const lastStatus =
        berkas.status?.statusDetail &&
        berkas.status.statusDetail[berkas.status.statusDetail.length - 1];

      const lastSubStatus =
        lastStatus?.subStatus &&
        lastStatus.subStatus[lastStatus.subStatus.length - 1];

      return {
        ...berkas,
        lastStatusName: lastStatus?.nama || "N/A",
        lastSubStatusName: lastSubStatus?.nama || "N/A",
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          "berkas",
          { role: roleNow },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Role: roleNow,
            },
          }
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          const processedData = processBerkasData(response.data);
          setBerkasData(processedData);
        } else {
          throw new Error("Data tidak valid atau kosong.");
        }
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleNow, token]);

  const renderActionButtons = (berkas) => {
    if (roleNow === "Admin") {
      return (
        <>
          {/* <IconButton variant="text" color="blue" onClick={() => setSelectedBerkas(berkas)}>
            <EyeIcon className="h-5 w-5" />
          </IconButton> */}
<IconButton
    variant="text"
    color="blue"
    onClick={() => setShowUpdatePopup(true)}
>
    <PencilIcon className="h-5 w-5" />
</IconButton>
{showUpdatePopup && (
    <PopUpUpdateBerkas
        data={berkas} // Data berkas yang dipilih
        onClose={() => setShowUpdatePopup(false)}
        onUpdateSuccess={(updatedData) => {
            const updatedList = berkasData.map((item) =>
                item.idBerkas === updatedData.idBerkas ? updatedData : item
            );
            setBerkasData(updatedList);
            setShowUpdatePopup(false);
        }}
    />
)}
          <IconButton variant="text" color="red">
            <TrashIcon className="h-5 w-5" />
          </IconButton>
        </>
      );
    } else {
      return (
        <>
          <Button
            variant="gradient"
            color="green"
            size="sm"
            onClick={() => console.log("Proses selesai:", berkas.idBerkas)}
          >
            Selesai
          </Button>
          <Button
            variant="gradient"
            color="red"
            size="sm"
            onClick={() => console.log("Proses terhenti:", berkas.idBerkas)}
          >
            Terhenti
          </Button>
        </>
      );
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Berkas Table
          </Typography>
          {roleNow === "Admin" && (
            <Button
              variant="gradient"
              color="blue"
              className="flex items-center gap-2"
              onClick={() => setShowPopup(true)}
            >
              <PlusIcon className="h-5 w-5" /> Tambah
            </Button>
          )}
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          {loading ? (
            <Typography className="text-center">Loading...</Typography>
          ) : error ? (
            <Typography className="text-center text-red-500">{error}</Typography>
          ) : berkasData.length === 0 ? (
            <Typography className="text-center text-blue-gray-500">
              Tidak ada data yang tersedia.
            </Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] table-auto">
                <thead>
                  <tr>
                    {[
                      "ID Berkas",
                      "No Berkas",
                      "Tahun Berkas",
                      "Tanggal Terima",
                      "Status",
                      "SubStatus",
                      "Action",
                      "Detail",
                    ].map((el) => (
                      <th
                        key={el}
                        className={`border-b border-blue-gray-50 py-3 px-5 text-left ${
                          el === "Action" || el === "Detail"
                            ? "sticky right-0 bg-gray-50 z-10"
                            : ""
                        }`}
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {berkasData.map((berkas, key) => {
                    const className = `py-3 px-5 ${
                      key === berkasData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={berkas._id}>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {berkas.idBerkas}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {berkas.noBerkas}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {berkas.tahunBerkas}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {new Date(berkas.tanggalTerima).toLocaleDateString()}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {berkas.lastStatusName}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {berkas.lastSubStatusName}
                          </Typography>
                        </td>
                        <td
                          className={`${className} sticky right-0 bg-gray-50 z-10`}
                        >
                          <div className="flex items-center gap-2">
                            {renderActionButtons(berkas)}
                          </div>
                        </td>
                        <td
                          className={`${className} sticky right-0 bg-gray-50 z-10`}
                        >
                          <IconButton
                            variant="text"
                            color="blue"
                            onClick={() => setSelectedBerkas(berkas)}
                          >
                            <EyeIcon className="h-5 w-5" />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
      {showPopup && (
        <PopUpInsertBerkas
          onClose={() => setShowPopup(false)}
          onInsertSuccess={(newBerkas) => {
            setBerkasData((prevData) => [...prevData, newBerkas]);
            setShowPopup(false);
          }}
        />
      )}
      {selectedBerkas && (
        <DetailModal
          berkas={selectedBerkas}
          onClose={() => setSelectedBerkas(null)}
        />
      )}
    </div>
  );
}

export default Tables;
