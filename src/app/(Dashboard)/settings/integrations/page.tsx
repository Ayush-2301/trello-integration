import { getProfile } from "@/lib/actions/profile";
import IntegrationForm from "../components/IntegrationForm";

const page = async () => {
  const profile = await getProfile();
  console.log(profile);
  if (!profile) return null;
  const { accessToken, boardId } = profile;

  return (
    <div>
      <IntegrationForm accessToken={accessToken} boardId={boardId} />
    </div>
  );
};

export default page;
