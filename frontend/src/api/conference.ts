import api from "@/lib/api";

export type Conference = {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

export const getAllConferences = async (): Promise<Conference[]> => {
    try {
        const response = await api.get("/conferences/all");

        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch conferences", {
            cause: error
        });
    }
};

type GenerateMeetingLinkParams = {
    title: string;
};

type GenerateMeetingLinkAPIResponse = {
    meetingCode: string;
};

export const createConference = async (data: GenerateMeetingLinkParams) => {
    const response = await api.post<GenerateMeetingLinkAPIResponse>(
        "/conferences/create",
        data
    );
    return response.data;
};

export const getConferenceById = async (
    conferenceId: string
): Promise<Conference> => {
    try {
        const response = await api.get(`/conferences/${conferenceId}`);
        return response.data.data;
    } catch (error) {
        throw new Error("Failed to fetch conference", {
            cause: error
        });
    }
};
