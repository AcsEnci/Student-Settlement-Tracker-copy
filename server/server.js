require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const StudentModel = require("./db/student.model");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const { MONGO_URL, PORT = 8080 } = process.env;

if (!MONGO_URL) {
  console.error("Missing MONGO_URL environment variable");
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(express.static("dist"));

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Student API",
      version: "1.0.0",
      description: "API for managing students",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
    components: {
      schemas: {
        StudentCreate: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string"
            },
            studyDay: {
              type: "array",
              items: {
                type: "string"
              }
            },
            budget: {
              type: "number"
            },
          }
        },

        StudentUpdate: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            studyDay: {
              type: "array",
              items: {
                type: "string"
              }
            },
            budget: {
              type: "number"
            },
            balance: {
              type: "number"
            },
            payments: {
              type: "array",
              items: {}
            }
          }
        },

        StudentResponse: {
          type: "object",
          properties: {
            _id: {
              type: "string"
            },
            name: {
              type: "string"
            },
            studyDay: {
              type: "array",
              items: {
                type: "string"
              }
            },
            budget: {
              type: "number"
            },
            balance: {
              type: "number"
            },
            payments: {
              type: "array",
              items: {}
            },
            created: {
              type: "string",
              format: "date-time"
            }
          }
        }
      }
    },
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const path = require("path");
const fs = require("fs");

app.get("/api/days", (req, res) => {
  const filePath = path.join(__dirname, "populate", "days.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Could not load days." });
  }
});

/**
 * @openapi
 * /api/students:
 *   get:
 *     summary: Get all students
 *     description: Returns a list of students.
 *     parameters:
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *         description: Filter students by study day
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter students by name
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentResponse'
 */
app.get("/api/students", async (req, res, next) => {
  const {day, name} = req.query;
  const filter = {};
  try {

    if (day) {
      filter.studyDay = day;
    }
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    const students = await StudentModel.find(filter).sort({ balance: "asc" });
    return res.json(students);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/students/{id}:
 *   get:
 *     summary: Get one student
 *     description: Returns a student based on id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 */
app.get("/api/students/:id", async (req, res, next) => {
  try {
    const student = await StudentModel.findById(req.params.id);
  
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
  
    return res.json(student);
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /api/students:
 *   post:
 *     summary: Save one student
 *     description: Saves a student.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentCreate'
 *     responses:
 *       200:
 *         description: Student created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 */
app.post("/api/students/", async (req, res, next) => {
  const student = req.body;

  try {
    const saved = await StudentModel.create(student);
    return res.status(200).json(saved);
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /api/students/{id}:
 *   patch:
 *     summary: Updates one student
 *     description: Updates a student.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentUpdate'
 *     responses:
 *       200:
 *         description: Student updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 */
app.patch("/api/students/:id", async (req, res, next) => {
  try {
    const student = await StudentModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { ...req.body } },
      { new: true }
    );
    return res.json(student);
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /api/students/{id}:
 *   delete:
 *     summary: Delete one student
 *     description: Deletes a student by id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponse'
 *       404:
 *         description: Student not found
 */
app.delete("/api/students/:id", async (req, res, next) => {
  try {
    const student = await StudentModel.findById(req.params.id);
  
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
  
    const deleted = await student.delete();
    return res.json(deleted);
  
  } catch (err) {
    return next(err);
  }
});

const main = async () => {
  await mongoose.connect(MONGO_URL);

  app.listen(PORT, () => {
    console.log("App is listening on 8080");
    console.log("Try /api/students route right now");
  });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
