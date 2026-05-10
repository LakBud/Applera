import axios from "axios";

export type ApplicationRequest = {
  cvText: string;
  jobText: string;
};

export type ApplicationResponse = {
  cv_summary: string;
  application_letter: {
    introduction: string;
    body: string;
    closing: string;
  };
  email_template: {
    subject: string;
    body: string;
  };
};

export async function createApplication(data: ApplicationRequest): Promise<ApplicationResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60s safety

  try {
    const res = await axios.post("http://localhost:5005/api/application/create", data, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    return res.data as ApplicationResponse;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error(err.message || "Network error");
  } finally {
    clearTimeout(timeout);
  }
}
