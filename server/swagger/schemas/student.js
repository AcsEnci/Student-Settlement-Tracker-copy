module.exports = {
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