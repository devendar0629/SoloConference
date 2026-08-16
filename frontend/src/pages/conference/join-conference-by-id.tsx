import { useParams } from "react-router";

export default function JoinConferenceById() {
    const { conference_id } = useParams<{ conference_id: string }>();

    return <>{conference_id}</>;
}
