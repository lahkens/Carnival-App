
A simple **cashless coin system** built for an office carnival / event.

Employees get virtual coins, shops accept payments via QR / shop ID, and all transactions are tracked in **Google Sheets** using a **Google Apps Script backend**.  
Frontend is built with **Next.js (React)**.

> ⚠️ This project is intentionally lightweight and hacky — built fast for an event, not production.

---

## Tech Stack

### Frontend
- **Next.js (React)**
- CSS Modules (no Tailwind)
- Fetch-based API calls
- Client-side session handling

### Backend
- **Google Apps Script (.gs)**
- Google Sheets as database
- Deployed as a **Web App**
- No external servers required

---

## Data Model (Google Sheets)

### Employees Sheet
| Column | Description |
|------|------------|
| employee_id | Unique employee ID |
| employee_name | Full name |
| hashed_pin | SHA-256 hashed PIN |
| coins | Available coins |
| session_id | Active session token |

### Shops Sheet
| Column | Description |
|------|------------|
| shop_id | Auto-generated (SHOP001, SHOP002…) |
| shop_name | Display name |
| owner_employee_id | Owner |
| hashed_password | Shop login password |
| coins | Coins earned |
| session_id | Active session token |

### Transactions Sheet
| Column | Description |
|------|------------|
| transaction_id | Auto increment |
| timestamp | `HH:MM:SS DD_MM-YYYY` |
| employee_id | Who paid |
| shop_id | Where |
| shop_name | Cached for history |
| amount | Coins spent |

---

## Authentication Model

- No Google login
- No JWT
- No OAuth
- No cookies

Instead:
- User logs in with **ID + PIN**
- Backend generates a **session_id**
- Every request validates `(id + session_id)`
- PIN is required again for **payments**

This is **not enterprise security**, but sufficient for a closed carnival setup.

---
