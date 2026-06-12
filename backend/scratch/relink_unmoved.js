const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const backendSrc = path.join(rootDir, 'backend/src');
const frontendSrc = path.join(rootDir, 'frontend/src');

// Re-import the exact move mapping from migrate.js
const backendMoves = {
  '01_Core/AuditLogs': 'KERNEL/Audit',
  '01_Core/Auth': 'KERNEL/Authentication',
  '01_Core/RBAC': 'KERNEL/Authorization',
  '01_Core/Billing': 'KERNEL/Billing',
  '01_Core/Branch': 'KERNEL/Branch',
  '01_Core/Dashboard': 'WORKSPACE_ENGINE/Workspace',
  '01_Core/Founder': 'FOUNDER_OS/Founder',
  '01_Core/Institution': 'KERNEL/Organization',
  '01_Core/Module': 'KERNEL/Licensing',
  '01_Core/Operations': 'KERNEL/Support',
  '01_Core/Provisioning': 'FOUNDER_OS/Licensing',
  '01_Core/Registration': 'FOUNDER_OS/Registration',
  '01_Core/Settings': 'KERNEL/Settings',
  '01_Core/Setup': 'KERNEL/Setup',
  '01_Core/prisma': 'SHARED/Prisma',
  'common': 'SHARED',
  
  '02_Admission/AddressLookup': 'SHARED/AddressLookup',
  '02_Admission/Documents': 'SHARED/Documents',
  '02_Admission/StudentProfile': 'INDUSTRY_PACKS/SCHOOL/Student',
  '02_Admission/ParentProfile': 'INDUSTRY_PACKS/SCHOOL/Student',
  '02_Admission/AdmissionWorkflow': 'INDUSTRY_PACKS/SCHOOL/Admission',
  '02_Admission/Application': 'INDUSTRY_PACKS/SCHOOL/Admission',
  '02_Admission/IdentityVerification': 'INDUSTRY_PACKS/SCHOOL/Admission',
  '02_Admission/ScholarNumber': 'INDUSTRY_PACKS/SCHOOL/Admission',

  '03_Academics/AcademicYear': 'INDUSTRY_PACKS/SCHOOL/AcademicSession',
  '03_Academics/Board': 'INDUSTRY_PACKS/SCHOOL/AcademicSession',
  '03_Academics/Stream': 'INDUSTRY_PACKS/SCHOOL/AcademicSession',
  '03_Academics/Class': 'INDUSTRY_PACKS/SCHOOL/Class',
  '03_Academics/Section': 'INDUSTRY_PACKS/SCHOOL/Section',
  '03_Academics/Subject': 'INDUSTRY_PACKS/SCHOOL/Subjects',
  '03_Academics/LessonPlan': 'INDUSTRY_PACKS/SCHOOL/Subjects',
  '03_Academics/SyllabusTracker': 'INDUSTRY_PACKS/SCHOOL/Subjects',
  '03_Academics/PromotionHistory': 'INDUSTRY_PACKS/SCHOOL/Promotion',

  '04_Attendance/AttendanceAlerts': 'INDUSTRY_PACKS/SCHOOL/Attendance',
  '04_Attendance/AttendanceReports': 'INDUSTRY_PACKS/SCHOOL/Attendance',
  '04_Attendance/AttendanceSession': 'INDUSTRY_PACKS/SCHOOL/Attendance',
  '04_Attendance/StudentAttendance': 'INDUSTRY_PACKS/SCHOOL/Attendance',
  '04_Attendance/StaffAttendance': 'KERNEL/Attendance',

  '05_Fees': 'INDUSTRY_PACKS/SCHOOL/Fees',
  '06_Exams': 'INDUSTRY_PACKS/SCHOOL/Exams',

  '07_Staff/StaffProfile': 'KERNEL/Staff',
  '07_Staff/Leave': 'KERNEL/HR',
  '07_Staff/Salary': 'KERNEL/Finance',
  '07_Staff/Roles': 'KERNEL/Authorization',
  '07_Staff/StaffAttendance': 'KERNEL/Attendance',
  '07_Staff/Documents': 'SHARED/Documents',

  '08_Communication/Circulars': 'SHARED/Notifications',
  '08_Communication/InAppAlerts': 'SHARED/Notifications',
  '08_Communication/InternalMessages': 'SHARED/Notifications',
  '08_Communication/Notices': 'SHARED/Notifications',
  '08_Communication/RoleBasedFeeds': 'SHARED/Notifications',

  '09_Reports': 'KERNEL/Reports',
  '11_Documents': 'SHARED/Documents',
  '13_StudentPortal/Timetable': 'INDUSTRY_PACKS/SCHOOL/Class',
  '14_FutureTrendModules/Library': 'INDUSTRY_PACKS/SCHOOL/Library',
  '14_FutureTrendModules/VisitorManagement': 'SHARED/VisitorManagement',
  '14_FutureTrendModules/Inventory': 'SHARED/Inventory',
  '15_Productivity': 'SHARED/Productivity',
};

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

// Target folders that were NOT copied/moved (their destinations are same as source)
const unmovedBackendFiles = [
  path.join(backendSrc, 'main.ts'),
  path.join(backendSrc, 'app.module.ts'),
  path.join(backendSrc, 'app.controller.ts'),
  path.join(backendSrc, 'app.service.ts'),
];

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const unmovedFrontendFiles = [
  ...getFiles(path.join(frontendSrc, 'app')),
  path.join(frontendSrc, 'middleware.ts'),
];

const allUnmovedFiles = [...unmovedBackendFiles, ...unmovedFrontendFiles];

function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        results = results.concat(getFilesRecursively(fullPath));
      }
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allOriginalBackendFiles = getFilesRecursively(backendSrc);
const allOriginalFrontendFiles = getFilesRecursively(frontendSrc);

const allOriginalFiles = [...allOriginalBackendFiles, ...allOriginalFrontendFiles];

// Map of original path -> destination path
const fileDestMap = new Map();

function getDestPath(fileAbsPath) {
  const isBackend = fileAbsPath.startsWith(backendSrc);
  const srcBase = isBackend ? backendSrc : frontendSrc;
  const relToSrc = path.relative(srcBase, fileAbsPath);
  const moves = isBackend ? backendMoves : frontendMoves;

  let longestMatch = '';
  let matchTarget = '';

  const normalizedRel = relToSrc.replace(/\\/g, '/');

  Object.keys(moves).forEach(key => {
    if (normalizedRel === key || normalizedRel.startsWith(key + '/')) {
      if (key.length > longestMatch.length) {
        longestMatch = key;
        matchTarget = moves[key];
      }
    }
  });

  if (longestMatch) {
    const tail = normalizedRel.slice(longestMatch.length);
    const newRelPath = matchTarget + tail;
    return path.join(srcBase, newRelPath);
  }

  return fileAbsPath;
}

allOriginalFiles.forEach(f => {
  fileDestMap.set(f, getDestPath(f));
});

function resolveRelativeImport(sourceFile, importStr) {
  let resolved = null;
  const isBackend = sourceFile.startsWith(backendSrc);
  const srcBase = isBackend ? backendSrc : frontendSrc;

  if (importStr.startsWith('@/')) {
    resolved = path.resolve(frontendSrc, importStr.slice(2));
  } else if (importStr.startsWith('.')) {
    const dir = path.dirname(sourceFile);
    resolved = path.resolve(dir, importStr);
  } else if (importStr.startsWith('src/')) {
    resolved = path.resolve(backendSrc, '..', importStr);
  }

  if (resolved) {
    const exts = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    let originalTargetFile = null;
    for (const ext of exts) {
      const p = resolved + ext;
      if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) {
        originalTargetFile = p;
        break;
      }
    }
    if (!originalTargetFile && fs.existsSync(resolved) && !fs.statSync(resolved).isDirectory()) {
      originalTargetFile = resolved;
    }

    if (originalTargetFile) {
      const destTargetFile = fileDestMap.get(originalTargetFile) || originalTargetFile;
      return destTargetFile;
    }
  }
  return null;
}

console.log('Updating imports in unmoved files...');

allUnmovedFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js') && !file.endsWith('.jsx')) return;
  try {
    let content = fs.readFileSync(file, 'utf-8');
    const importRegex = /((?:import|export|from|require)\s+['"])([^'"]+)(['"])/g;
    
    let updated = false;
    const newContent = content.replace(importRegex, (match, prefix, importStr, suffix) => {
      const targetDestFile = resolveRelativeImport(file, importStr);
      if (targetDestFile && targetDestFile !== file) {
        const fileDir = path.dirname(file);
        let rel = path.relative(fileDir, targetDestFile).replace(/\\/g, '/');
        
        if (!rel.startsWith('.')) {
          rel = './' + rel;
        }
        
        const extsToRemove = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
        for (const ext of extsToRemove) {
          if (rel.endsWith(ext)) {
            rel = rel.slice(0, -ext.length);
            break;
          }
        }
        
        if (file.startsWith(frontendSrc) && importStr.startsWith('@/')) {
          let aliasPath = '@/' + path.relative(frontendSrc, targetDestFile).replace(/\\/g, '/');
          for (const ext of extsToRemove) {
            if (aliasPath.endsWith(ext)) {
              aliasPath = aliasPath.slice(0, -ext.length);
              break;
            }
          }
          updated = true;
          return `${prefix}${aliasPath}${suffix}`;
        }

        updated = true;
        return `${prefix}${rel}${suffix}`;
      }
      return match;
    });

    if (updated) {
      fs.writeFileSync(file, newContent, 'utf-8');
      console.log(`Updated imports in: ${path.relative(rootDir, file)}`);
    }
  } catch (err) {
    console.error(`Failed to update imports in ${file}:`, err.message);
  }
});

console.log('Unmoved files import re-linking completed.');
