export const API_URL = 'apps_script_url';

export async function callAPI(action, data) {
  try {
    const body = new URLSearchParams({
      action,
      ...Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v ?? ""])
      )
    });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });
    // console.log(response)
    // console.log("API Response Status:", response.json());


    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Network error occurred" };
  }
}
