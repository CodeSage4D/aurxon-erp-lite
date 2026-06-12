const BACKEND_URL = 'http://127.0.0.1:5000';

async function logIn(email, pass) {
  const isFounderOrTeam = email === 'founder@aurxon.com' || email.includes('finance-test');
  const url = isFounderOrTeam ? `${BACKEND_URL}/auth/founder/login` : `${BACKEND_URL}/auth/login`;
  console.log('Fetching URL:', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pass }),
  });
  console.log('Status:', res.status);
  const json = await res.json();
  console.log('Response JSON:', JSON.stringify(json, null, 2));
  return json;
}

async function main() {
  try {
    await logIn('founder@aurxon.com', 'AurxonFuture$136');
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
