const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const frontendSrc = path.join(rootDir, 'frontend/src');

const frontendMoves = {
  'context': 'providers',
  'lib/api.ts': 'services/api.ts',
  'lib/indianData.ts': 'utils/indianData.ts',
  
  '01_Core/Dashboard': 'modules/WORKSPACE_ENGINE/Dashboard',
  '02_Admission/StudentProfile/StudentsTab.tsx': 'modules/INDUSTRY_PACKS/SCHOOL/Admission/StudentsTab.tsx',
  '03_Academics/Class/AcademicTab.tsx': 'modules/INDUSTRY_PACKS/SCHOOL/Academics/AcademicTab.tsx',
  '04_Attendance/StudentAttendance/AttendanceTab.tsx': 'modules/INDUSTRY_PACKS/SCHOOL/Attendance/AttendanceTab.tsx',
  '05_Fees/FeeStructure/FeesTab.tsx': 'modules/INDUSTRY_PACKS/SCHOOL/Fees/FeesTab.tsx',
  '05_Fees/Receipts/ReceiptViewer.tsx': 'modules/INDUSTRY_PACKS/SCHOOL/Fees/ReceiptViewer.tsx',
  '06_Exams/ExamSetup/ExamsTab.tsx': 'modules/INDUSTRY_PACKS/SCHOOL/Exams/ExamsTab.tsx',
  '06_Exams/ReportCards/ReportCardViewer.tsx': 'modules/INDUSTRY_PACKS/SCHOOL/Exams/ReportCardViewer.tsx',
  '07_Staff/StaffProfile/HrTab.tsx': 'modules/COMMON_PLATFORM/Staff/HrTab.tsx',
  '07_Staff/StaffProfile/hr': 'modules/COMMON_PLATFORM/HR',
  '08_Communication/Notices/CommsTab.tsx': 'modules/SHARED/Notifications/CommsTab.tsx',
  '09_Reports/ReportsDashboard.tsx': 'modules/COMMON_PLATFORM/Reports/ReportsDashboard.tsx',
  '10_Analytics/AnalyticsDashboard.tsx': 'modules/COMMON_PLATFORM/Reports/AnalyticsDashboard.tsx',
  '11_Documents/Certificates/CertificatesTab.tsx': 'modules/SHARED/Documents/CertificatesTab.tsx',
  '12_ParentPortal/ParentDashboard.tsx': 'modules/ROLE_ENGINE/Parent/ParentDashboard.tsx',
  '13_StudentPortal/StudentDashboard.tsx': 'modules/ROLE_ENGINE/Student/StudentDashboard.tsx',
  '14_FutureTrendModules/Library/LibraryTab.tsx': 'modules/INDUSTRY_PACKS/SCHOOL/Library/LibraryTab.tsx',
  '14_FutureTrendModules/Inventory/InventoryTab.tsx': 'modules/SHARED/Inventory/InventoryTab.tsx',
  '14_FutureTrendModules/VisitorManagement/GateTab.tsx': 'modules/SHARED/Documents/GateTab.tsx',
  '14_FutureTrendModules/Productivity/ProductivityTab.tsx': 'modules/SHARED/Productivity/ProductivityTab.tsx',
};

function getDestPath(fileAbsPath) {
  const relToSrc = path.relative(frontendSrc, fileAbsPath);
  let longestMatch = '';
  let matchTarget = '';
  const normalizedRel = relToSrc.replace(/\\/g, '/');

  Object.keys(frontendMoves).forEach(key => {
    if (normalizedRel === key || normalizedRel.startsWith(key + '/')) {
      if (key.length > longestMatch.length) {
        longestMatch = key;
        matchTarget = frontendMoves[key];
      }
    }
  });

  if (longestMatch) {
    const tail = normalizedRel.slice(longestMatch.length);
    const newRelPath = matchTarget + tail;
    return path.join(frontendSrc, newRelPath);
  }
  return fileAbsPath;
}

// Test specific file
const testFile = path.join(frontendSrc, '07_Staff/StaffProfile/hr/EmployeeModal.tsx');
console.log('Exists:', fs.existsSync(testFile));
console.log('Dest Path:', getDestPath(testFile));
