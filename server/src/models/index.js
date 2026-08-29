// Side-effect registration of every model so Mongoose can resolve `ref`
// targets (e.g. "Skill") before any populate/query needs them.
import "./Application.js";
import "./Certification.js";
import "./EmployerProfile.js";
import "./Job.js";
import "./Message.js";
import "./Notification.js";
import "./Rating.js";
import "./Skill.js";
import "./User.js";
import "./Verification.js";
import "./WorkerProfile.js";