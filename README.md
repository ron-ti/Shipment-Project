# 📦 Shipment Tracking Web App

A lightweight, secure web application for tracking shipments in real-time using Monday.com as the data source. Clients can view their shipments without needing a Monday.com account.

## ✨ Features

- 🔐 **Secure API Integration** - Monday.com API token stored securely on the server
- 👥 **Multi-Client Support** - Each client sees only their own shipments
- 🔍 **Real-Time Data** - Live data pulled directly from Monday.com
- 📱 **Responsive Design** - Works beautifully on desktop and mobile
- 🎨 **Modern UI** - Clean, professional interface with blue accents
- 🌐 **Hebrew/English Support** - Full RTL support for Hebrew text
- 🎯 **Customizable Columns** - Control exactly which columns customers see
- 🔗 **Direct Links** - Share custom URLs with customers (e.g., `?customer=GalilChem`)
- 📄 **Document Links** - Click-through to shipment documents
- ⚡ **Fast Performance** - Lightweight and optimized

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│   Client    │──────│  Netlify Function│──────│  Monday.com  │
│  Browser    │      │   (API Proxy)    │      │     API      │
└─────────────┘      └──────────────────┘      └──────────────┘
```

- **Frontend**: Pure HTML, CSS, and JavaScript (no framework dependencies)
- **Backend**: Netlify serverless functions for secure API proxying
- **Data Source**: Monday.com GraphQL API

## 📋 Prerequisites

1. A Monday.com account with API access
2. A Monday.com board with shipment data
3. A Netlify account (free tier works perfectly)

## 🚀 Quick Start

### 1. Get Your Monday.com Credentials

1. Log in to your Monday.com account
2. Go to https://auth.monday.com/users/sign_in_new
3. Scroll to "API Token" section and copy your token
4. Find your Board ID in the Monday.com URL: `monday.com/boards/{BOARD_ID}`

### 2. Set Up Column Names

Ensure your Monday.com board has these column types (or similar):
- **Customer ID** - Text column (used for filtering)
- **Container Number** - Text column
- **BL Number** - Text column (Bill of Lading)
- **ETA** - Date column
- **Vessel Name** - Text column
- **Status** - Status column
- **Documents** - File/Link column (optional)

> **Note**: The app is flexible with column names. It searches for columns containing keywords like "container", "bl", "vessel", "eta", "status", etc.

### 3. Deploy to Netlify

**Option A: Deploy via Netlify UI**

1. Push this code to a GitHub repository
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Add environment variables in **Site settings > Environment variables**:
   - `MONDAY_API_TOKEN`: Your Monday.com API token
   - `MONDAY_BOARD_ID`: Your board ID
6. Click "Deploy site"

**Option B: Deploy via Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

Don't forget to add environment variables in the Netlify dashboard!

### 4. Configure Environment Variables

In the Netlify dashboard:
1. Go to **Site settings > Environment variables**
2. Add:
   - `MONDAY_API_TOKEN` = `your_monday_api_token`
   - `MONDAY_BOARD_ID` = `1234567890`

### 5. Test the App

1. Visit your deployed site
2. Enter a Customer ID that exists in your board
3. View the shipments for that customer

## 🎯 Usage

### For Clients

1. Open the app URL
2. Enter your Customer ID (provided by your company)
3. View your shipments

### For Direct Links

Share a URL with a customer: 
```
https://your-site.netlify.app/?customer=CustomerID
```

### For Developers

The app automatically:
- Fetches all items from your Monday.com board
- Filters by the Customer ID column
- Maps column values to shipment properties
- Displays results in a card-based layout

## 🔧 Customization

### Changing Colors

Edit `style.css` and update the CSS variables:

```css
:root {
    --primary-color: #0086ff;  /* Main color */
    --primary-hover: #0073dd;
    --background: #f8f9fa;      /* Page background */
    /* ... more colors ... */
}
```

### Customizing Which Columns to Show

The app allows you to control exactly which columns are visible to your clients.

**1. Edit `netlify/functions/monday-api.js`**

Find and modify the `COLUMNS_TO_SHOW` object:

```javascript
const COLUMNS_TO_SHOW = {
    // Add or remove columns here
    'מס\' מכולה / בוקינג': 'containerNumber',  // Hebrew column name
    'container': 'containerNumber',             // English column name
    'תאריך אספקה בוקינג eta': 'eta',
    // Add more as needed...
};
```

**2. Edit `app.js`**

Update the `COLUMN_LABELS` to customize display names:

```javascript
const COLUMN_LABELS = {
    containerNumber: 'מס\' מכולה',
    eta: 'תאריך אספקה משוער',
    // Add more labels...
};
```

**See `CONFIG_GUIDE_HE.md` for detailed instructions in Hebrew!**

## 📁 Project Structure

```
monday-shipment-tracker/
├── index.html              # Main HTML file
├── style.css               # Styles
├── app.js                  # Frontend JavaScript
├── netlify/
│   └── functions/
│       └── monday-api.js   # Serverless API proxy
├── netlify.toml            # Netlify configuration
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔒 Security

- ✅ API token stored in environment variables (never exposed to client)
- ✅ Admin-only mapping API protected by `ADMIN_TOKEN`
- ✅ CORS headers configured for secure cross-origin requests
- ✅ Server-side filtering by customer ID
- ✅ No client-side secrets or credentials

## 🌐 Supported Hosting Platforms

- ✅ **Netlify** (recommended - includes serverless functions)
- ✅ **Vercel** (requires Next.js or similar framework)
- ✅ **GitHub Pages** (static only - would need a separate API backend)

## 🐛 Troubleshooting

### No shipments showing

1. Check that the Customer ID matches exactly (case-sensitive)
2. Verify the column names in Monday.com match the expected keywords
3. Check browser console for errors
4. Verify environment variables are set in Netlify

### API errors

1. Verify your Monday.com API token is valid
2. Check that the Board ID is correct
3. Ensure your Monday.com board is accessible
4. Check Netlify function logs: `netlify functions:log`

### Netlify function not working

1. Ensure the function is in `netlify/functions/` directory
2. Check `netlify.toml` configuration
3. Redeploy the site after making changes
4. Check Netlify build logs

## 🔑 Customer Unique Code Mapping

Use the admin API to manage `uniqueId -> customerName` pairs.

Environment variables to set in Netlify:

- `ADMIN_TOKEN`: any strong string you choose
- `BLOBS_READ_URL` and `BLOBS_WRITE_URL`: endpoints to read/write a JSON blob (you can replace these with your own storage or KV).

Admin endpoints:

- Resolve (public): `GET /.netlify/functions/customer-map?uniqueId=CODE`
- Add/Update (admin): `POST /.netlify/functions/customer-map` with JSON `{ uniqueId, customerName }` and header `Authorization: Bearer ADMIN_TOKEN`
- Delete (admin): `DELETE /.netlify/functions/customer-map` with JSON `{ uniqueId }` and header `Authorization: Bearer ADMIN_TOKEN`
- List (admin): `GET /.netlify/functions/customer-map` with header `Authorization: Bearer ADMIN_TOKEN`

## 📝 License

MIT License - feel free to use this project for commercial or personal purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for better shipment tracking**
