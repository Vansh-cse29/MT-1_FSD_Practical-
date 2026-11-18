const express = require('express');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Initial Data as specified in Set C
let leaves = [
  {
    id: 701,
    employeeName: "Ananya Singh",
    employeeCode: "EMP101",
    leaveType: "Casual",
    days: 2,
    status: "Pending"
  },
  {
    id: 702,
    employeeName: "Rahul Verma",
    employeeCode: "EMP102",
    leaveType: "Sick",
    days: 1,
    status: "Approved"
  },
  {
    id: 703,
    employeeName: "Simran Kaur",
    employeeCode: "EMP103",
    leaveType: "Earned",
    days: 3,
    status: "Rejected"
  }
];

// Allowed enum values for validation
const VALID_LEAVE_TYPES = ["Casual", "Sick", "Earned"];
const VALID_STATUSES = ["Pending", "Approved", "Rejected"];

// Helper function to validate leave payload
function validateLeavePayload(body) {
  const { employeeName, employeeCode, leaveType, days, status } = body;

  if (!employeeName || typeof employeeName !== 'string' || employeeName.trim() === '') {
    return "employeeName is required and must be a valid string.";
  }
  if (!employeeCode || typeof employeeCode !== 'string' || employeeCode.trim() === '') {
    return "employeeCode is required and must be a valid string.";
  }
  if (!leaveType || !VALID_LEAVE_TYPES.includes(leaveType)) {
    return "leaveType must be one of: Casual, Sick, or Earned.";
  }
  if (typeof days !== 'number' || !Number.isInteger(days) || days <= 0) {
    return "days must be a positive integer.";
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    return "status must be one of: Pending, Approved, or Rejected.";
  }

  return null;
}

// 1. GET all records
app.get('/api/leaves', (req, res) => {
  res.status(200).json(leaves);
});

// 6. Filter records by status (case-insensitive)
// Note: Declared BEFORE dynamic /:id route as required
app.get('/api/leaves/filter', (req, res) => {
  const { status } = req.query;

  if (!status) {
    return res.status(400).json({ message: "Query parameter 'status' is required." });
  }

  const filtered = leaves.filter(
    (leave) => leave.status.toLowerCase() === status.toLowerCase()
  );

  res.status(200).json(filtered);
});

// 7. GET pending leave requests
// Note: Declared BEFORE dynamic /:id route as required
app.get('/api/leaves/pending', (req, res) => {
  const pendingLeaves = leaves.filter((leave) => leave.status === "Pending");
  res.status(200).json(pendingLeaves);
});

// 3. GET leave request by ID
app.get('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const leave = leaves.find((item) => item.id === id);

  if (!leave) {
    return res.status(404).json({ message: `Leave request with ID ${id} not found.` });
  }

  res.status(200).json(leave);
});

// 2. POST a new record
app.post('/api/leaves', (req, res) => {
  const error = validateLeavePayload(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  // Generate unique numeric ID
  const nextId = leaves.length > 0 ? Math.max(...leaves.map((l) => l.id)) + 1 : 701;

  const newLeave = {
    id: nextId,
    employeeName: req.body.employeeName.trim(),
    employeeCode: req.body.employeeCode.trim(),
    leaveType: req.body.leaveType,
    days: req.body.days,
    status: req.body.status
  };

  leaves.push(newLeave);
  res.status(201).json(newLeave);
});

// 4. PUT / update a record
app.put('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = leaves.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: `Leave request with ID ${id} not found.` });
  }

  const error = validateLeavePayload(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const updatedLeave = {
    id: id,
    employeeName: req.body.employeeName.trim(),
    employeeCode: req.body.employeeCode.trim(),
    leaveType: req.body.leaveType,
    days: req.body.days,
    status: req.body.status
  };

  leaves[index] = updatedLeave;
  res.status(200).json(updatedLeave);
});

// 5. DELETE a record
app.delete('/api/leaves/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = leaves.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: `Leave request with ID ${id} not found.` });
  }

  leaves.splice(index, 1);
  res.status(200).json({ message: `Leave request with ID ${id} deleted successfully.` });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});