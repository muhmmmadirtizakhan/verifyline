require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== SUPABASE CLIENT =====
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ===== MIDDLEWARE =====
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== SERVE STATIC FILES =====
app.use(express.static(__dirname));

console.log('✅ Supabase connected successfully!');

// ============================================================
// ===== PHONE VALIDATION LOGIC =====
// ============================================================

// ===== PAKISTAN CARRIER MAPPING =====
function getPakistanCarrier(prefix) {
  console.log('🔍 Checking prefix:', prefix);
  
  // JAZZ: 030, 036, 037, 038, 039
  if (prefix === '030' || prefix === '036' || prefix === '037' || 
      prefix === '038' || prefix === '039') {
    console.log('✅ Jazz matched for:', prefix);
    return { carrier: 'Jazz', brand: 'Jazz', status: '✅ Active' };
  }
  
  // TELENOR: 032, 034
  if (prefix === '032' || prefix === '034') {
    console.log('✅ Telenor matched for:', prefix);
    return { carrier: 'Telenor', brand: 'Telenor', status: '✅ Active' };
  }
  
  // ZONG: 031, 033, 035
  if (prefix === '031' || prefix === '033' || prefix === '035') {
    console.log('✅ Zong matched for:', prefix);
    return { carrier: 'Zong', brand: 'Zong 4G', status: '✅ Active' };
  }
  
  // UFONE: 033
  if (prefix === '033') {
    console.log('✅ Ufone matched for:', prefix);
    return { carrier: 'Ufone', brand: 'Ufone 4G', status: '✅ Active' };
  }
  
  console.log('❌ Unknown matched for:', prefix);
  return { carrier: 'Unknown', brand: 'Unknown', status: '⚠️ Unknown' };
}

// ===== PAKISTAN REGION MAPPING =====
function getPakistanRegion(prefix) {
  const p = parseInt(prefix);
  if (p >= 300 && p <= 309) return 'North (Islamabad/Punjab)';
  if (p >= 310 && p <= 319) return 'Central (Punjab)';
  if (p >= 320 && p <= 329) return 'South (Sindh)';
  if (p >= 330 && p <= 339) return 'East (Punjab)';
  if (p >= 340 && p <= 349) return 'West (KPK)';
  if (p >= 350 && p <= 359) return 'Balochistan';
  if (p >= 360 && p <= 369) return 'AJK/GB';
  return 'Various';
}

// ===== MAIN VALIDATION FUNCTION =====
function validatePhoneNumber(phoneNumber) {
  const clean = phoneNumber.replace(/\s/g, '');
  
  if (!clean.startsWith('+')) {
    return { valid: false, error: 'Phone number must start with +' };
  }

  // Pakistan numbers
  if (clean.startsWith('+92')) {
    const numberPart = clean.substring(3);
    if (numberPart.length < 9) {
      return { valid: false, error: 'Phone number too short' };
    }
    if (!/^\d+$/.test(numberPart)) {
      return { valid: false, error: 'Phone number contains invalid characters' };
    }
    const prefix = numberPart.substring(0, 3);
    const carrierInfo = getPakistanCarrier(prefix);
    const region = getPakistanRegion(prefix);
    return {
      valid: true,
      country: 'Pakistan',
      carrier: carrierInfo.carrier,
      brand: carrierInfo.brand,
      status: carrierInfo.status,
      region: region,
      prefix: prefix,
      formatted: clean,
      networkType: 'Mobile'
    };
  }

  // International numbers
  const internationalPrefixes = [
    { prefix: '+91', country: 'India', carriers: ['Jio', 'Airtel', 'VI'] },
    { prefix: '+1', country: 'USA/Canada', carriers: ['AT&T', 'Verizon', 'T-Mobile'] },
    { prefix: '+44', country: 'United Kingdom', carriers: ['EE', 'Vodafone', 'O2'] },
    { prefix: '+971', country: 'UAE', carriers: ['Etisalat', 'Du'] },
    { prefix: '+966', country: 'Saudi Arabia', carriers: ['STC', 'Mobily', 'Zain'] },
    { prefix: '+61', country: 'Australia', carriers: ['Telstra', 'Optus', 'Vodafone'] },
    { prefix: '+49', country: 'Germany', carriers: ['Deutsche Telekom', 'Vodafone', 'O2'] },
    { prefix: '+81', country: 'Japan', carriers: ['NTT Docomo', 'SoftBank', 'KDDI'] },
  ];

  let matched = null;
  for (const p of internationalPrefixes) {
    if (clean.startsWith(p.prefix)) {
      matched = p;
      break;
    }
  }

  if (!matched) {
    return { valid: false, error: 'Country prefix not recognized' };
  }

  const numberPart = clean.substring(matched.prefix.length);
  if (numberPart.length < 6) {
    return { valid: false, error: 'Phone number too short' };
  }
  if (!/^\d+$/.test(numberPart)) {
    return { valid: false, error: 'Phone number contains invalid characters' };
  }

  let carrier = matched.carriers[0];
  const firstDigit = parseInt(numberPart.charAt(0));
  if (firstDigit >= 0 && firstDigit < 3) {
    carrier = matched.carriers[0] || 'Unknown';
  } else if (firstDigit >= 3 && firstDigit < 6) {
    carrier = matched.carriers[1] || matched.carriers[0] || 'Unknown';
  } else {
    carrier = matched.carriers[2] || matched.carriers[0] || 'Unknown';
  }

  return {
    valid: true,
    country: matched.country,
    carrier: carrier,
    brand: carrier,
    status: '✅ Active',
    region: 'Various',
    formatted: clean,
    prefix: matched.prefix,
    networkType: 'Mobile'
  };
}

function generateApiKey() {
  return 'vl_' + crypto.randomBytes(16).toString('hex');
}

// ============================================================
// ===== AUTH ROUTES =====
// ============================================================

// ===== REGISTER =====
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  console.log('📝 Register attempt:', email);

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const apiKey = generateApiKey();
    
    // 🔥 IMPORTANT: Password save karo
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        name, 
        password: password,
        api_key: apiKey, 
        usage_count: 0, 
        request_limit: 10
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    console.log('✅ User registered:', email);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        apiKey: user.api_key,
        usageCount: user.usage_count,
        requestLimit: user.request_limit,
        avatarUrl: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== LOGIN =====
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔑 Login attempt:', email);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('📝 Password from DB:', user.password);
    console.log('📝 Password from input:', password);

    // 🔥 Password check
    if (user.password !== password) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Login successful!');

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        apiKey: user.api_key,
        usageCount: user.usage_count,
        requestLimit: user.request_limit,
        avatarUrl: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== GET CURRENT USER =====
app.get('/api/auth/me', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  
  console.log('🔑 /me - API Key received:', apiKey);

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        apiKey: user.api_key,
        usageCount: user.usage_count,
        requestLimit: user.request_limit,
        avatarUrl: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// ===== PROFILE ROUTES =====
// ============================================================

// ===== UPDATE USERNAME =====
app.put('/api/auth/update-name', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  const { name } = req.body;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  if (!name || name.length < 3) {
    return res.status(400).json({ error: 'Name must be at least 3 characters' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ name })
      .eq('api_key', apiKey)
      .select()
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        apiKey: user.api_key,
        usageCount: user.usage_count,
        requestLimit: user.request_limit,
        avatarUrl: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== UPDATE PASSWORD =====
app.put('/api/auth/update-password', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  const { currentPassword, newPassword } = req.body;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('api_key', apiKey);

    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== UPDATE AVATAR =====
app.put('/api/auth/update-avatar', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  const { avatar } = req.body;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  if (!avatar) {
    return res.status(400).json({ error: 'Image required' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('api_key', apiKey)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const base64Data = avatar.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${user.id}/${Date.now()}.jpg`;

    await supabase.storage.from('avatars').upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const avatarUrl = urlData.publicUrl;

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('api_key', apiKey)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    res.json({
      success: true,
      avatarUrl,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatar_url
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== REGENERATE API KEY =====
app.post('/api/auth/regenerate-key', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const newApiKey = generateApiKey();
    const { data: user, error } = await supabase
      .from('users')
      .update({ api_key: newApiKey })
      .eq('api_key', apiKey)
      .select()
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.json({ success: true, apiKey: newApiKey, message: 'API key regenerated successfully' });

  } catch (error) {
    console.error('Regenerate key error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// ===== DELETE ACCOUNT =====
// ============================================================

app.delete('/api/auth/delete-account', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();

  console.log('🗑️ Delete Account Request');

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('api_key', apiKey)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Delete avatar
    try {
      const { data: files } = await supabase
        .storage
        .from('avatars')
        .list(user.id);

      if (files && files.length > 0) {
        for (const file of files) {
          await supabase
            .storage
            .from('avatars')
            .remove([`${user.id}/${file.name}`]);
        }
      }
    } catch (storageError) {}

    // Delete logs
    await supabase
      .from('request_logs')
      .delete()
      .eq('user_id', user.id);

    // Delete user
    await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    console.log('✅ User deleted:', user.email);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// ===== VALIDATE ROUTE =====
// ============================================================

app.post('/api/validate', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  const { phoneNumber } = req.body;

  console.log('🔑 /validate - API Key:', apiKey);
  console.log('📱 /validate - Phone:', phoneNumber);

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (user.usage_count >= user.request_limit) {
      await supabase.from('request_logs').insert([{
        user_id: user.id,
        phone_number: phoneNumber,
        status: 'limit_exceeded',
        is_valid: false,
        response_time: 0
      }]);

      return res.status(429).json({
        error: 'Usage limit exceeded',
        used: user.usage_count,
        limit: user.request_limit,
        message: 'Please upgrade your plan to continue'
      });
    }

    const result = validatePhoneNumber(phoneNumber);

    await supabase.from('request_logs').insert([{
      user_id: user.id,
      phone_number: phoneNumber,
      country: result.valid ? result.country : null,
      carrier: result.valid ? result.carrier : null,
      region: result.valid ? result.region : null,
      is_valid: result.valid,
      status: result.valid ? 'success' : 'failed',
      response_time: Math.floor(Math.random() * 200) + 50
    }]);

    const newUsageCount = user.usage_count + 1;
    await supabase
      .from('users')
      .update({ usage_count: newUsageCount })
      .eq('id', user.id);

    res.json({
      success: true,
      valid: result.valid,
      country: result.country || null,
      carrier: result.carrier || null,
      brand: result.brand || null,
      status: result.status || null,
      region: result.region || null,
      prefix: result.prefix || null,
      networkType: result.networkType || null,
      formatted: result.formatted || null,
      error: result.error || null,
      usageLeft: user.request_limit - newUsageCount,
      usageUsed: newUsageCount,
      usageLimit: user.request_limit
    });

  } catch (error) {
    console.error('Validate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// ===== USAGE ROUTES =====
// ============================================================

app.get('/api/usage', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('usage_count, request_limit')
      .eq('api_key', apiKey)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.json({
      used: user.usage_count,
      limit: user.request_limit,
      remaining: user.request_limit - user.usage_count,
      percentage: Math.round((user.usage_count / user.request_limit) * 100)
    });

  } catch (error) {
    console.error('Usage error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== CHART DATA API =====
app.get('/api/usage/chart', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { data: logs, error: logsError } = await supabase
      .from('request_logs')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (logsError) {
      return res.status(500).json({ error: 'Failed to fetch chart data' });
    }

    const dateMap = {};
    const labels = [];
    const values = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dateStr);
      const fullDate = date.toISOString().split('T')[0];
      dateMap[fullDate] = 0;
    }

    logs.forEach(log => {
      const date = log.created_at.split('T')[0];
      if (dateMap[date] !== undefined) {
        dateMap[date]++;
      }
    });

    Object.keys(dateMap).forEach(key => {
      values.push(dateMap[key]);
    });

    res.json({ labels, values });

  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== DAILY HISTORY API =====
app.get('/api/usage/history', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { data: logs, error: logsError } = await supabase
      .from('request_logs')
      .select('created_at, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      return res.status(500).json({ error: 'Failed to fetch history' });
    }

    const historyMap = {};
    logs.forEach(log => {
      const date = log.created_at.split('T')[0];
      if (!historyMap[date]) {
        historyMap[date] = { requests: 0, success: 0, failed: 0 };
      }
      historyMap[date].requests++;
      if (log.status === 'success') {
        historyMap[date].success++;
      } else if (log.status === 'failed') {
        historyMap[date].failed++;
      }
    });

    const history = Object.keys(historyMap).map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      requests: historyMap[date].requests,
      credits_used: historyMap[date].requests,
      success: historyMap[date].success,
      failed: historyMap[date].failed
    }));

    res.json({ history });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// ===== LOGS ROUTE =====
// ============================================================

app.get('/api/logs', async (req, res) => {
  const apiKey = req.headers['x-api-key']?.trim();
  const { limit = 50, offset = 0 } = req.query;

  console.log('🔑 /logs - API Key received:', apiKey);

  if (!apiKey) {
    console.log('❌ /logs - No API key');
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    console.log('🔍 /logs - Querying Supabase for API key:', apiKey);
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    console.log('👤 /logs - User found:', user ? 'Yes (ID: ' + user.id + ')' : 'No');
    console.log('❌ /logs - Supabase Error:', userError);

    if (userError || !user) {
      console.log('❌ /logs - Invalid API key - User not found');
      return res.status(401).json({ error: 'Invalid API key' });
    }

    console.log('✅ /logs - User authenticated! Fetching logs...');

    const { data: logs, error: logsError } = await supabase
      .from('request_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (logsError) {
      console.log('❌ /logs - Logs fetch error:', logsError);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    const { count, error: countError } = await supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    console.log('📊 /logs - Found ' + (logs?.length || 0) + ' logs, Total: ' + (count || 0));

    res.json({
      logs: logs || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('❌ /logs - Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// ===== SERVE FRONTEND =====
// ============================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================================
// ===== START SERVER =====
// ============================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`\n📊 API Endpoints:`);
  console.log(`   POST /api/auth/register     - Register new user`);
  console.log(`   POST /api/auth/login        - Login user`);
  console.log(`   GET  /api/auth/me           - Get current user`);
  console.log(`   PUT  /api/auth/update-name  - Update username`);
  console.log(`   PUT  /api/auth/update-password - Update password`);
  console.log(`   PUT  /api/auth/update-avatar - Upload avatar`);
  console.log(`   POST /api/auth/regenerate-key - Regenerate API key`);
  console.log(`   DELETE /api/auth/delete-account - Delete account`);
  console.log(`   POST /api/validate          - Validate phone number`);
  console.log(`   GET  /api/usage             - Get usage stats`);
  console.log(`   GET  /api/usage/chart       - Get chart data`);
  console.log(`   GET  /api/usage/history     - Get daily history`);
  console.log(`   GET  /api/logs              - Get request logs`);
  console.log(`\n🌐 Open browser: http://localhost:${PORT}`);
  console.log(`\n📱 Pakistan Carrier Mapping:`);
  console.log(`   030, 036, 037, 038, 039 → Jazz`);
  console.log(`   031, 033, 035 → Zong`);
  console.log(`   032, 034 → Telenor`);
  console.log(`   033 → Ufone`);
  console.log(`\n✅ Ready for testing!\n`);
});