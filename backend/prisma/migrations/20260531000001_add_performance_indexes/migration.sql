-- CreateIndex
CREATE INDEX "Student_institutionId_classId_idx" ON "Student"("institutionId", "classId");
CREATE INDEX "Student_institutionId_parentId_idx" ON "Student"("institutionId", "parentId");

-- CreateIndex
CREATE INDEX "Parent_userId_idx" ON "Parent"("userId");

-- CreateIndex
CREATE INDEX "Staff_institutionId_employeeId_idx" ON "Staff"("institutionId", "employeeId");
CREATE INDEX "Staff_userId_idx" ON "Staff"("userId");

-- CreateIndex
CREATE INDEX "Attendance_studentId_date_idx" ON "Attendance"("studentId", "date");

-- CreateIndex
CREATE INDEX "StudentFeeAllocation_studentId_status_idx" ON "StudentFeeAllocation"("studentId", "status");

-- CreateIndex
CREATE INDEX "ExamResult_studentId_examId_idx" ON "ExamResult"("studentId", "examId");

-- CreateIndex
CREATE INDEX "LeaveRequest_staffId_status_idx" ON "LeaveRequest"("staffId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_studentId_assignmentId_idx" ON "HomeworkSubmission"("studentId", "assignmentId");
