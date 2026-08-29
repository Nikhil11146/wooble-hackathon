import Messenger from "../../components/Messages/Messenger";
import { PageHeader } from "../../components/Common/PageState";

export default function EmployerMessages() {
  return (
    <>
      <PageHeader
        eyebrow="Employer portal"
        title="Messages"
        description="Chat with workers about applications, interviews, and offers."
      />
      <Messenger />
    </>
  );
}