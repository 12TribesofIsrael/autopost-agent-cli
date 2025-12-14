import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadRequest {
  videoUrl: string;
  subfolderName: string;
  fileName?: string;
}

// Create JWT for Google service account authentication
async function createServiceAccountJWT(): Promise<string> {
  const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKeyPem = Deno.env.get('GOOGLE_PRIVATE_KEY');

  if (!serviceAccountEmail || !privateKeyPem) {
    throw new Error('Missing Google service account credentials');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Parse PEM and import key
  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\\n/g, '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signatureB64}`;
}

// Exchange JWT for access token
async function getAccessToken(): Promise<string> {
  const jwt = await createServiceAccountJWT();

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token exchange failed:', error);
    throw new Error('Failed to get access token from Google');
  }

  const data = await response.json();
  return data.access_token;
}

// Find or create subfolder in root folder
async function getOrCreateSubfolder(accessToken: string, subfolderName: string): Promise<string> {
  const rootFolderId = Deno.env.get('GOOGLE_DRIVE_ROOT_FOLDER_ID');
  
  if (!rootFolderId) {
    throw new Error('Missing GOOGLE_DRIVE_ROOT_FOLDER_ID');
  }

  // Search for existing folder
  const searchQuery = `name='${subfolderName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name)`;

  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchResponse.ok) {
    const error = await searchResponse.text();
    console.error('Folder search failed:', error);
    throw new Error('Failed to search for subfolder');
  }

  const searchData = await searchResponse.json();

  if (searchData.files && searchData.files.length > 0) {
    console.log(`Found existing folder: ${subfolderName} (${searchData.files[0].id})`);
    return searchData.files[0].id;
  }

  // Create new folder
  console.log(`Creating new folder: ${subfolderName}`);
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: subfolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootFolderId],
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error('Folder creation failed:', error);
    throw new Error('Failed to create subfolder');
  }

  const folderData = await createResponse.json();
  console.log(`Created folder: ${subfolderName} (${folderData.id})`);
  return folderData.id;
}

// Download video from URL
async function downloadVideo(videoUrl: string): Promise<{ data: Uint8Array; contentType: string }> {
  console.log(`Downloading video from: ${videoUrl}`);

  const response = await fetch(videoUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || 'video/mp4';
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  console.log(`Downloaded ${data.length} bytes, content-type: ${contentType}`);
  return { data, contentType };
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

  const boundary = '-------314159265358979323846';
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

  const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    console.error('Upload failed:', error);
    throw new Error('Failed to upload file to Google Drive');
  }

  const uploadData = await uploadResponse.json();
  console.log(`Uploaded successfully: ${uploadData.name} (${uploadData.id})`);
  return uploadData.id;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { videoUrl, subfolderName, fileName }: UploadRequest = await req.json();

    if (!videoUrl || !subfolderName) {
      return new Response(
        JSON.stringify({ success: false, error: 'videoUrl and subfolderName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing upload request: ${videoUrl} -> ${subfolderName}`);

    // Get access token
    const accessToken = await getAccessToken();

    // Get or create subfolder
    const folderId = await getOrCreateSubfolder(accessToken, subfolderName);

    // Download video
    const { data, contentType } = await downloadVideo(videoUrl);

    // Generate filename if not provided
    const finalFileName = fileName || `video_${Date.now()}.mp4`;

    // Upload to Drive
    const fileId = await uploadToDrive(accessToken, folderId, finalFileName, data, contentType);

    return new Response(
      JSON.stringify({ success: true, fileId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Upload to Drive error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
