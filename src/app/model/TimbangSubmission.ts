export interface TimbangSubmission {
  komoditi: string;
  komoditiGroup: string;
  group: string;
  pengangkutan: string;
  no_SP: string;
  no_Kendaraan: string;
  merk_Type: string;
  no_SIM: string;
  nama_Supir: string;
  sumber: string;
  no_Tiket: string;
  status: string;
  tanggal_Laporan: string;
  no_Masuk: string;
  tanggal_Masuk: string;
  berat_Masuk: string;
  no_Keluar: string;
  tanggal_Keluar: string;
  berat_Keluar: string;
  pmks: string;
  passwordApproval: string;
  usernameApproval: string;
  keteranganApproval: string;
}

export class TimbangSubmission implements TimbangSubmission {
  constructor(init?: TimbangSubmissionValues) {
    Object.assign(this, init);
  }
}

export class TimbangSubmissionValues {
  komoditi: string = "";
  komoditiGroup: string = "";
  group: string = "";
  pengangkutan: string = "";
  no_SP: string = "";
  no_Kendaraan: string = "";
  merk_Type: string = "";
  no_SIM: string = "";
  nama_Supir: string = "";
  sumber: string = "";
  no_Tiket: string = "";
  status: string = "";
  tanggal_Laporan: string = "";
  no_Masuk: string = "";
  tanggal_Masuk: string = "";
  berat_Masuk: string = "";
  no_Keluar: string = "";
  tanggal_Keluar: string = "";
  berat_Keluar: string = "";
  pmks: string = "";
  usernameApproval: string = "";
  passwordApproval: string = "";
  keteranganApproval: string = "";

  constructor(activity?: TimbangSubmissionValues) {
    if (activity) {
      this.komoditi = activity.komoditi;
      this.komoditiGroup = activity.komoditiGroup;
      this.group = activity.group;
      this.pengangkutan = activity.pengangkutan;
      this.no_SP = activity.no_SP;
      this.no_Kendaraan = activity.no_Kendaraan;
      this.merk_Type = activity.merk_Type;
      this.no_SIM = activity.no_SIM;
      this.nama_Supir = activity.nama_Supir;
      this.sumber = activity.sumber;
      this.no_Tiket = activity.no_Tiket;
      this.status = activity.status;
      this.tanggal_Laporan = activity.tanggal_Laporan;
      this.no_Masuk = activity.no_Masuk;
      this.tanggal_Masuk = activity.tanggal_Masuk;
      this.berat_Masuk = activity.berat_Masuk;
      this.no_Keluar = activity.no_Keluar;
      this.tanggal_Keluar = activity.tanggal_Keluar;
      this.berat_Keluar = activity.berat_Keluar;
      this.pmks = activity.pmks;
      this.usernameApproval = activity.usernameApproval;
      this.passwordApproval = activity.passwordApproval;
      this.keteranganApproval = activity.keteranganApproval;
    }
  }
}
