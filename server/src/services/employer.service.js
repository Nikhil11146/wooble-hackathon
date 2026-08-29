import Application from "../models/Application.js";
import EmployerProfile from "../models/EmployerProfile.js";
import Job from "../models/Job.js";
import { createNotification } from "./notification.service.js";

const serviceError = (message, statusCode) => Object.assign(new Error(message), { statusCode });
export const getEmployerProfile = (id) => EmployerProfile.findOne({ $or: [{ _id: id }, { userId: id }] });
export const getEmployerJobs = (employerId) => Job.find({ employerId }).sort({ createdAt: -1 });

export const createEmployerJob = (employerId, data) => Job.create({ ...data, employerId });

export const updateApplicationStatus = async (applicationId, status, notes) => {
  const application = await Application.findById(applicationId);
  if (!application) throw serviceError("Application not found.", 404);
  application.status = status;
  if (notes !== undefined) application.notes = notes;
  if (status === "INTERVIEW") application.movedToInterviewAt = new Date();
  if (status === "HIRED") application.hiredAt = new Date();
  await application.save();
  await createNotification({ userId: application.workerId, type: "APPLICATION_STATUS", resourceId: application._id, title: "Application updated", message: `Your application status is now ${status}.` });
  return application;
};
