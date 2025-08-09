import fetch from 'node-fetch';
import FormData from 'form-data';
import fileType from 'file-type';

export default async function uploadImage(buffer, tmp = false) {
  // console.log('--- uploadImage() called ---');
  if (!Buffer.isBuffer(buffer)) throw new Error('Input must be a Buffer');

  const type = await fileType.fromBuffer(buffer);
  // console.log('Image Type:', type);
  if (!type) throw new Error('Unsupported file type');

  const form = new FormData();
  form.append('file', buffer, { filename: `image.${type.ext}`, contentType: type.mime });
  form.append('tmp', String(tmp));

  const url = `${APIs.ryzumi}/api/uploader/ryzencdn`;
  // console.log('Sending request to:', url);

  const res = await fetch(url, { method: 'POST', headers: form.getHeaders(), body: form });

  // Baca raw text dulu untuk debug, lalu parse
  const rawText = await res.text();
  // console.log('Raw Response Text:', rawText || '(empty)');
  let json;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error(`Invalid JSON response from CDN`);
  }

  // console.log('UploadImage JSON Response:', json);

  if (!json.success) throw new Error(json.message || 'Upload failed');

  // Kompatibel schema baru & lama
  const outUrl = json.url || json.result?.url;
  if (!outUrl) throw new Error('CDN response missing URL');

  return outUrl;
}
