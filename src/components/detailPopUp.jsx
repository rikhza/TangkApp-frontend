import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
} from "@material-tailwind/react";

const DetailModal = ({ berkas, onClose }) => {
  const renderField = (label, value) => (
    <Typography variant="small" className="text-gray-600">
      <strong>{label}:</strong> {value || "-"}
    </Typography>
  );

  const renderTimeline = () => (
    <Timeline>
      {berkas.status?.map((status, index) => (
        <TimelineItem key={index}>
          {index > 0 && <TimelineConnector />}
          <TimelineHeader className="h-3">
            <TimelineIcon />
            <Typography variant="h6" color="blue-gray" className="leading-none">
              {status.nama} - {new Date(status.dateIn).toLocaleDateString()}
            </Typography>
          </TimelineHeader>
          <TimelineBody className="pb-4">
            {status?.statusDetail?.map((sub, subIndex) => (
              <div key={subIndex} className="pl-4">
                <Typography
                  variant="small"
                  color="gray"
                  className="font-normal text-gray-600"
                >
                  <strong>{sub.nama}</strong> ({new Date(sub.dateIn).toLocaleDateString()})
                </Typography>
                {sub.deskripsiKendala && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-1 text-sm font-medium"
                  >
                    Kendala: {sub.deskripsiKendala}
                  </Typography>
                )}
              </div>
            ))}
          </TimelineBody>
        </TimelineItem>
      ))}
    </Timeline>
  );

  return (
    <Dialog open={true} handler={onClose}>
      <DialogHeader>Detail Berkas</DialogHeader>
      <DialogBody divider>
        <div className="grid gap-4">
          {renderField("ID Berkas", berkas.idBerkas)}
          {renderField("No Berkas", berkas.noBerkas)}
          {renderField("Tahun Berkas", berkas.tahunBerkas)}
          {renderField("Tanggal Terima", new Date(berkas.tanggalTerima).toLocaleDateString())}
          {renderField("ID Kegiatan", berkas.idKegiatan)}
          {renderField("ID Pemohon", berkas.idPemohon)}
          {renderField("ID Jenis Hak", berkas.idJenisHak)}
          {renderField("No Hak", berkas.noHak)}
          {renderField("ID Desa", berkas.idDesa)}
          {renderField("ID SPS", berkas.idSPS)}
          {renderField("ID Petugas Ukur", berkas.idPetugasUkur)}
          {renderField("Status Alih Media", berkas.statusAlihMedia ? "Ya" : "Tidak")}
          {renderField("Status Bayar PNBP", berkas.statusBayarPNBP ? "Ya" : "Tidak")}
          {renderField("ID User", berkas.idUser)}
          <Typography variant="small" className="text-gray-600 font-bold mt-4">
            Status:
          </Typography>
          <div>{renderTimeline()}</div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DetailModal;
