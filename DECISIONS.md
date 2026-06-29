# Decisions Write-up

## 1. API Key Storage & Protection

Each user receives a unique API key automatically after registration. The key is stored in the Supabase database and is used to authenticate requests to the phone validation API. The backend keeps the Supabase service role key inside the `.env` file so sensitive credentials are not exposed in the source code. For this assignment, I used API key authentication because it is simple, easy to implement, and matches the project requirements. In a production application, I would hash API keys, support key rotation, and add rate limiting.

## 2. Request Limit Handling

I decided to reject requests after the user reaches the request limit. When the limit is exceeded, the API returns HTTP 429 (Too Many Requests) with a clear error message. This approach is simple, predictable, and prevents misuse of the API. It also provides users with immediate feedback instead of processing unnecessary requests or placing them in a queue.

## 3. Carrier and Region Logic

The carrier and region lookup uses a prefix-based mapping instead of hardcoded conditions. This makes the code easier to maintain because adding a new country, carrier, or prefix only requires updating the mapping data instead of changing the validation logic. The current implementation uses mock data, but the same structure can later be connected to a real telecom database or external lookup service with minimal changes.
