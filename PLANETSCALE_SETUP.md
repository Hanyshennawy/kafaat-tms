# =============================================================================
# PLANETSCALE DATABASE SETUP
# =============================================================================
# Complete this setup manually (3 minutes)
# =============================================================================

## 🎯 INSTRUCTIONS:

### **1. Sign Up to PlanetScale**

Open this URL in your browser:
https://planetscale.com/signup

- Sign up with GitHub (recommended - instant)
- Or use email

### **2. Create Database**

After login:

1. Click **"New database"**
2. **Name**: `kafaat-tms`
3. **Region**: Select **"AWS us-east-1"** (closest to Render)
4. **Plan**: Select **"Hobby"** (FREE - 5GB storage, 1B reads/mo)
5. Click **"Create database"**

### **3. Create Connection Password**

1. In database dashboard, click **"Connect"**
2. Click **"New password"**
3. **Name**: `render-production`
4. **Role**: Select **"Can read & write"**
5. Click **"Create password"**

### **4. COPY Connection String**

You'll see a connection string. Copy the **"General"** format:

```
mysql://USERNAME:PASSWORD@HOST.psdb.cloud/kafaat-tms?ssl={"rejectUnauthorized":true}
```

**SAVE THIS CONNECTION STRING!** You'll need it in the next step.

Example format:
```
mysql://abc123xyz:pscale_pw_aBcDeFgHiJkLmNoPqRsTuVwXyZ@aws.connect.psdb.cloud/kafaat-tms?ssl={"rejectUnauthorized":true}
```

---

## ✅ DONE!

Once you have the connection string, we'll use it to configure Render.

**Connection string ready?** 
Paste it when prompted in the next step.

---

## 📞 Need Help?

- **PlanetScale Docs**: https://planetscale.com/docs/tutorials/connect-any-app
- **Support**: https://planetscale.com/support
