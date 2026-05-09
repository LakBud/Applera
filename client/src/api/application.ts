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
    const res = await fetch("http://localhost:5005/api/application/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.error || "Failed to create application");
    }

    return (await res.json()) as ApplicationResponse;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error(err.message || "Network error");
  } finally {
    clearTimeout(timeout);
  }
}
