-- Add new JSONB columns to user_settings table
ALTER TABLE user_settings
ADD COLUMN content_preferences JSONB DEFAULT '{
  "feedType": "balanced",
  "postDisplay": "expanded",
  "defaultSort": "newest",
  "contentFilters": []
}'::jsonb,

ADD COLUMN accessibility_settings JSONB DEFAULT '{
  "fontSize": "medium",
  "highContrast": false,
  "reducedMotion": false,
  "screenReaderOptimized": false
}'::jsonb,

ADD COLUMN communication_settings JSONB DEFAULT '{
  "messagePrivacy": "everyone",
  "readReceipts": true,
  "typingIndicators": true,
  "lastSeenPrivacy": "everyone"
}'::jsonb,

ADD COLUMN regional_settings JSONB DEFAULT '{
  "timeZone": "UTC",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "currency": "ZAR"
}'::jsonb,

ADD COLUMN security_settings JSONB DEFAULT '{
  "twoFactorEnabled": false,
  "loginAlerts": true,
  "trustedDevices": [],
  "activeSessions": []
}'::jsonb;
