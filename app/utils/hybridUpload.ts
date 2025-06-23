export async function uploadToImgur(file: File): Promise<string> {
  const clientId = "64f0bcad71c71e8";
  if (!clientId) {
    throw new Error("Missing IMGUR_CLIENT_ID environment variable");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  const formData = new FormData();
  formData.append("image", base64);
  formData.append("type", "base64");

  const response = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${clientId}`,
    },
    body: formData,
  });

  const result = await response.json();
  return result.data.link;
}

export async function uploadToCatbox(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", file);

  try {
    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Catbox upload failed: ${response.statusText}`);
    }

    const result = await response.text();

    if (!result.startsWith("https://")) {
      throw new Error(`Catbox upload failed: ${result}`);
    }

    return result.trim();
  } catch (error) {
    console.error("Catbox upload error:", error);
    throw error;
  }
}
