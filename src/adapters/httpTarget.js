export async function invokeHttpTarget(config, prompt) {
  const url = new URL(config.target.path || '/', config.target.baseUrl).toString();
  const method = config.target.method || 'POST';
  const headers = {
    'content-type': 'application/json',
    ...(config.target.headers || {})
  };

  const payload = {
    input: prompt,
    message: prompt,
    prompt
  };

  const response = await fetch(url, {
    method,
    headers,
    body: method.toUpperCase() === 'GET' ? undefined : JSON.stringify(payload)
  });

  const contentType = response.headers.get('content-type') || '';
  let body;
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body
  };
}
