import api from "@/lib/axios";

type PresignedViewResponse = {
  data?: {
    url?: string;
  };
  url?: string;
};

export const getStorageViewUrl = async (fileUrl: string): Promise<string> => {
  try {
    const { data } = await api.post<PresignedViewResponse>(
      "/storage/presigned-view",
      { fileUrl }
    );

    return data.data?.url ?? data.url ?? fileUrl;
  } catch {
    return fileUrl;
  }
};
