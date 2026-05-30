export interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  joiningDate: string;
  salary: number;
  status: string;
  aadhaarNumber?: string;
  panNumber?: string;
  qualification?: string;
  experience?: number;
  gender?: string;
  bloodGroup?: string;
  fatherSpouseName?: string;
  permanentAddress?: string;
  bankName?: string;
  bankBranch?: string;
  accNumber?: string;
  ifscCode?: string;
  pfNumber?: string;
  esiNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  user?: {
    email: string;
    isActive: boolean;
  };
  payrolls?: Payroll[];
  leaves?: LeaveRequest[];
  degrees?: string[];
  skills?: string[];
  certifications?: string[];
  subjectsExpertise?: string[];
}

export interface Payroll {
  id: string;
  staffId: string;
  month: string;
  baseSalary: number;
  hra: number;
  da: number;
  allowances: number;
  deductions: number;
  netPay: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber: string;
  status: string;
  staff?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    designation: string;
  };
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  staff?: {
    firstName: string;
    lastName: string;
    designation: string;
  };
}
