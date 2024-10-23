import mongoose, { Schema } from "mongoose";

const resourceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['Notes', 'Assignments', 'Tutorials', 'Books', 'Papers', 'Question Paper', 'Solution', 'Others'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
      uppercase: true, // Automatically converts subjectCode to uppercase
    },
    testName: {
      type: String,
      enum: ["Midterm", "Final", "Practical", "Mini"], // Enum for test names
      required: function() {
        return this.resourceType === 'Question Paper' || this.resourceType === 'Solution'; // Required only for question papers
      },
    },
    teacherName: {
      type: String,
      required: false,
    },
    fileUrl: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    year: {
      type: Number,
      required: function() {
        return this.resourceType === 'Question Paper' || this.resourceType === 'Solution';
      }
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

export const Resource = mongoose.model("Resource", resourceSchema);
