import { getProfile } from "@/lib/actions/profile";
import IntegrationForm from "../components/IntegrationForm";

const page = async () => {
  const profile = await getProfile();
  if (!profile) return null;
  const { accessToken, boardId, boardTitle } = profile;

  return (
    <div>
      <IntegrationForm
        accessToken={accessToken}
        boardId={boardId}
        boardTitle={boardTitle}
      />
    </div>
  );
};

export default page;
