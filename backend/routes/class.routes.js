import express from "express"

const router = express.Router()

// mock storage for now (can become DB later)
const classes = [
  {
    id: "class-001",
    name: "Introduction to Computer Science",
    code: "CS101",
    instructor: "Dr. Sarah Johnson",
    schedule: "MWF 10:00 AM - 11:30 AM",
    students: [
      { id: "1", name: "Alice Chen", studentId: "A001", email: "alice@school.edu" },
      { id: "2", name: "Bob Martinez", studentId: "B002", email: "bob@school.edu" },
      { id: "3", name: "Carol Williams", studentId: "C003", email: "carol@school.edu" }
    ]
  }
]

// get all classes
router.get("/", (req, res) => {
  res.json(classes)
})

// get single class
router.get("/:id", (req, res) => {
  const cls = classes.find(c => c.id === req.params.id)

  if (!cls) {
    return res.status(404).json({ error: "Class not found" })
  }

  res.json(cls)
})

export default router