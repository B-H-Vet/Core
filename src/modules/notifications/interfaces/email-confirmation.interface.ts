export interface AppointmentConfirmationEmailData {
  to: string;
  petName: string;
  vetName: string;
  appointmentDate: Date;
  clinicAddress: string;
}
