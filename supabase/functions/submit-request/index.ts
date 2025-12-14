import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Constants for file validation
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const ALLOWED_MIME_TYPES = ["video/mp4", "video/quicktime"];
const ALLOWED_EXTENSIONS = [".mp4", ".mov"];

// Platform folder mapping
const PLATFORM_FOLDERS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  x: "X",
};

// Create JWT for Google service account authentication
async function createServiceAccountJWT(): Promise<string> {
  const serviceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKeyPem = Deno.env.get("GOOGLE_PRIVATE_KEY");

  if (!serviceAccountEmail || !privateKeyPem) {
    throw new Error("Missing Google service account credentials");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${signatureB64}`;
}

// Exchange JWT for access token
async function getAccessToken(): Promise<string> {
  const jwt = await createServiceAccountJWT();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Token exchange failed:", error);
    throw new Error("Failed to get access token from Google");
  }

  const data = await response.json();
  return data.access_token;
}

// Find or create subfolder in root folder
async function getOrCreateSubfolder(accessToken: string, subfolderName: string): Promise<string> {
  const rootFolderId = Deno.env.get("GOOGLE_DRIVE_ROOT_FOLDER_ID");

  if (!rootFolderId) {
    throw new Error("Missing GOOGLE_DRIVE_ROOT_FOLDER_ID");
  }

  const searchQuery = `name='${subfolderName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name)`;

  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchResponse.ok) {
    const error = await searchResponse.text();
    console.error("Folder search failed:", error);
    throw new Error("Failed to search for subfolder");
  }

  const searchData = await searchResponse.json();

  if (searchData.files && searchData.files.length > 0) {
    console.log(`Found existing folder: ${subfolderName} (${searchData.files[0].id})`);
    return searchData.files[0].id;
  }

  console.log(`Creating new folder: ${subfolderName}`);
  const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: subfolderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error("Folder creation failed:", error);
    throw new Error("Failed to create subfolder");
  }

  const folderData = await createResponse.json();
  console.log(`Created folder: ${subfolderName} (${folderData.id})`);
  return folderData.id;
}

// Upload file to Google Drive
async function uploadToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  fileData: Uint8Array,
  mimeType: string
): Promise<string> {
  console.log(`Uploading ${fileName} to folder ${folderId}`);

  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaPart = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;

  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(metadataPart);
  const mediaHeaderBytes = encoder.encode(mediaPart);
  const closeBytes = encoder.encode(closeDelimiter);

  const body = new Uint8Array(metadataBytes.length + mediaHeaderBytes.length + fileData.length + closeBytes.length);
  body.set(metadataBytes, 0);
  body.set(mediaHeaderBytes, metadataBytes.length);
  body.set(fileData, metadataBytes.length + mediaHeaderBytes.length);
  body.set(closeBytes, metadataBytes.length + mediaHeaderBytes.length + fileData.length);

  const uploadResponse = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    console.error("Upload failed:", error);
    throw new Error("Failed to upload file to Google Drive");
  }

  const uploadData = await uploadResponse.json();
  console.log(`Uploaded successfully: ${uploadData.name} (${uploadData.id})`);
  return uploadData.id;
}

// Upload video to all selected platform folders
async function uploadToAllPlatforms(
  fileData: Uint8Array,
  mimeType: string,
  platforms: string[],
  fileName: string
): Promise<string[]> {
  const accessToken = await getAccessToken();
  const uploadedFileIds: string[] = [];

  for (const platform of platforms) {
    const folderName = PLATFORM_FOLDERS[platform.toLowerCase()];
    if (!folderName) {
      console.log(`Unknown platform: ${platform}, skipping`);
      continue;
    }

    try {
      const folderId = await getOrCreateSubfolder(accessToken, folderName);
      const fileId = await uploadToDrive(accessToken, folderId, fileName, fileData, mimeType);
      uploadedFileIds.push(fileId);
      console.log(`Uploaded to ${folderName}: ${fileId}`);
    } catch (err) {
      console.error(`Failed to upload to ${folderName}:`, err);
      throw err;
    }
  }

  return uploadedFileIds;
}

// Validate file type by extension
function isValidFileExtension(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

// Validate file type by MIME type
function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    
    // Check if this is a multipart/form-data request
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ success: false, error: "Content-Type must be multipart/form-data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    
    // Extract fields
    const videoFile = formData.get("videoFile") as File | null;
    const platformsJson = formData.get("platforms") as string | null;
    const caption = formData.get("caption") as string | null;

    console.log("Received form data:", {
      hasVideoFile: !!videoFile,
      videoFileName: videoFile?.name,
      videoFileSize: videoFile?.size,
      videoFileType: videoFile?.type,
      platformsJson,
      caption,
    });

    // Validate video file
    if (!videoFile) {
      return new Response(
        JSON.stringify({ success: false, error: "Video file is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size (2GB max)
    if (videoFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ success: false, error: "File size exceeds 2GB limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type by extension
    if (!isValidFileExtension(videoFile.name)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid file type. Only .mp4 and .mov files are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type by MIME type
    if (!isValidMimeType(videoFile.type)) {
      console.log(`Warning: MIME type ${videoFile.type} may not be valid, but extension is OK`);
    }

    // Validate platforms
    if (!platformsJson) {
      return new Response(
        JSON.stringify({ success: false, error: "Platforms are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let platforms: string[];
    try {
      platforms = JSON.parse(platformsJson);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid platforms format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "At least one platform is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read file data
    const arrayBuffer = await videoFile.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    const mimeType = videoFile.type || "video/mp4";

    console.log(`Processing video: ${videoFile.name}, size: ${fileData.length} bytes`);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the video request with pending status
    const { data: insertedRequest, error: insertError } = await supabase
      .from("video_requests")
      .insert({
        name: "File Upload",
        email: "upload@autopost.agent",
        video_link: videoFile.name,
        platforms: platforms,
        frequency: "once",
        notes: caption?.trim() || null,
        submitted_at: new Date().toISOString(),
        drive_upload_status: "pending",
        user_id: "00000000-0000-0000-0000-000000000000", // Placeholder for anonymous uploads
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Video request saved with ID:", insertedRequest.id);

    // Upload video to Google Drive for each selected platform
    try {
      const fileName = `video_${insertedRequest.id}_${Date.now()}${videoFile.name.substring(videoFile.name.lastIndexOf("."))}`;
      const uploadedFileIds = await uploadToAllPlatforms(fileData, mimeType, platforms, fileName);

      console.log(`Uploaded to ${uploadedFileIds.length} platform folders`);

      // Update status to uploaded
      const { error: updateError } = await supabase
        .from("video_requests")
        .update({ drive_upload_status: "uploaded" })
        .eq("id", insertedRequest.id);

      if (updateError) {
        console.error("Failed to update upload status:", updateError);
      }

      console.log("Video request completed successfully");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (uploadError) {
      console.error("Drive upload error:", uploadError);

      // Update status to failed
      await supabase
        .from("video_requests")
        .update({ drive_upload_status: "failed" })
        .eq("id", insertedRequest.id);

      return new Response(
        JSON.stringify({ success: false, error: "Failed to upload video to Google Drive" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Request processing error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
