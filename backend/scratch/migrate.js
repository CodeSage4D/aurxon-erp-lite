const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const backendSrc = path.join(rootDir, 'backend/src');
const frontendSrc = path.join(rootDir, 'frontend/src');

// oldPath (relative to backend/src or frontend/src) -> newPath (relative to backend/src or frontend/src)
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

// 1. Walk directory to find files
function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        results = results.concat(getFiles(fullPath));
      }
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

// 2. Perform Migration by Copying
console.log('Migrating files...');

const backendFiles = getFiles(backendSrc);
const frontendFiles = getFiles(frontendSrc);

const allFiles = [...backendFiles, ...frontendFiles];

// Helper to determine new destination of a file
function getDestPath(fileAbsPath) {
  const isBackend = fileAbsPath.startsWith(backendSrc);
  const srcBase = isBackend ? backendSrc : frontendSrc;
  const relToSrc = path.relative(srcBase, fileAbsPath);
  const moves = isBackend ? backendMoves : frontendMoves;

  // Find longest matching prefix in moves mapping
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

  return fileAbsPath; // Keep in place if not matched
}

const fileDestMap = new Map();
allFiles.forEach(f => {
  fileDestMap.set(f, getDestPath(f));
});

// Create directories and copy files
fileDestMap.forEach((dest, src) => {
  if (src === dest) return;
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${path.relative(rootDir, src)} -> ${path.relative(rootDir, dest)}`);
});

// 3. Resolve imports and link dependencies
console.log('\nRe-linking imports in all moved files...');

const allDestFiles = Array.from(fileDestMap.values());
const destFileSet = new Set(allDestFiles);

function resolveRelativeImport(sourceDestFile, importStr) {
  let resolved = null;
  const sourceSrcFile = Array.from(fileDestMap.keys()).find(k => fileDestMap.get(k) === sourceDestFile);

  if (importStr.startsWith('@/')) {
    // Next.js alias, maps to frontend/src/...
    resolved = path.resolve(frontendSrc, importStr.slice(2));
  } else if (importStr.startsWith('.')) {
    // Relative import. Resolve it relative to source's ORIGINAL location first, to see what file it imports.
    if (sourceSrcFile) {
      const srcDir = path.dirname(sourceSrcFile);
      resolved = path.resolve(srcDir, importStr);
    }
  } else if (importStr.startsWith('src/')) {
    // NestJS alias relative to backend/src/
    resolved = path.resolve(backendSrc, '..', importStr);
  }

  if (resolved) {
    const exts = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    // Check if the resolved file exists in the original file set
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
      // Find its destination path
      const destTargetFile = fileDestMap.get(originalTargetFile) || originalTargetFile;
      return destTargetFile;
    }
  }
  return null;
}

// Systematically update relative imports in the copied files
allDestFiles.forEach(file => {
  if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js') && !file.endsWith('.jsx')) return;
  try {
    let content = fs.readFileSync(file, 'utf-8');
    const importRegex = /((?:import|export|from|require)\s+['"])([^'"]+)(['"])/g;
    
    let updated = false;
    const newContent = content.replace(importRegex, (match, prefix, importStr, suffix) => {
      const targetDestFile = resolveRelativeImport(file, importStr);
      if (targetDestFile) {
        // Compute new relative path
        const fileDir = path.dirname(file);
        let rel = path.relative(fileDir, targetDestFile).replace(/\\/g, '/');
        
        // Ensure relative formatting
        if (!rel.startsWith('.')) {
          rel = './' + rel;
        }
        
        // Remove extensions from import path
        const extsToRemove = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
        for (const ext of extsToRemove) {
          if (rel.endsWith(ext)) {
            rel = rel.slice(0, -ext.length);
            break;
          }
        }
        
        // Special case: Next.js frontend uses @/ alias for src/ paths
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
    }
  } catch (err) {
    console.error(`Failed to update imports in ${file}:`, err.message);
  }
});

console.log('\nFile copying and import re-linking completed.');
