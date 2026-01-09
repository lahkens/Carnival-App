// ======================================================
// CONSTANTS
// ======================================================
const EMPLOYEE_SHEET = "Employees";
const SHOP_SHEET = "Shops";
const TXN_SHEET = "Transactions";

// ======================================================
// UTILITY HELPERS
// ======================================================
function hash(str) {
  return Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(str))
  );
}

function generateSessionId() {
  return Utilities.getUuid();
}

function forceString(v) {
  return v === null || v === undefined ? "" : String(v).trim();
}

function forceNumber(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// Clean timestamp: "HH:MM:SS DD_MM-YYYY"
function formatTimestampForTxn(dateObj) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())} ` +
         `${pad(dateObj.getDate())}_${pad(dateObj.getMonth() + 1)}-${dateObj.getFullYear()}`;
}

// ======================================================
// CORS-SAFE RESPONSE
// ======================================================
function send(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return send({ success: false, message: "Use POST." });
}

// ======================================================
// MAIN DISPATCH
// ======================================================
function doPost(e) {
  try {
    const data = {};
    for (let k in e.parameter) data[k] = forceString(e.parameter[k]);

    let res;
    switch (data.action) {
      case "employeeSignup": res = employeeSignup(data); break;
      case "employeeLogin": res = employeeLogin(data); break;
      case "employeeLogout": res = employeeLogout(data); break;
      case "getEmployee": res = getEmployee(data); break;

      case "shopSignup": res = shopSignup(data); break;
      case "shopLogin": res = shopLogin(data); break;
      case "shopLogout": res = shopLogout(data); break;
      case "getShop": res = getShop(data); break;

      case "makePayment":
      case "pay": res = makePayment(data); break;

      case "getEmployeeTransactions": res = getEmployeeTransactions(data); break;
      case "getShopTransactions": res = getShopTransactions(data); break;
      case "getAllShops": res = getAllShops(); break;

      default:
        res = { success: false, message: "Invalid action" };
    }

    return send(res);
  } catch (err) {
    return send({ success: false, error: err.toString() });
  }
}

// ======================================================
// SESSION VALIDATION
// ======================================================
function validateEmployeeSession(employeeId, sessionId) {
  employeeId = forceString(employeeId);
  sessionId = forceString(sessionId);

  const sheet = SpreadsheetApp.getActive().getSheetByName(EMPLOYEE_SHEET);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (forceString(rows[i][0]) === employeeId &&
        forceString(rows[i][4]) === sessionId) {
      return true;
    }
  }
  return false;
}

function validateShopSession(shopId, sessionId) {
  shopId = forceString(shopId);
  sessionId = forceString(sessionId);

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHOP_SHEET);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (forceString(rows[i][0]) === shopId &&
        forceString(rows[i][5]) === sessionId) {
      return true;
    }
  }
  return false;
}

// ======================================================
// EMPLOYEE SIGNUP
// ======================================================
function employeeSignup(data) {
  const employee_id = forceString(data.employee_id);
  const name = forceString(data.name);
  const pin = forceString(data.pin);

  const sheet = SpreadsheetApp.getActive().getSheetByName(EMPLOYEE_SHEET);

  const existing = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues()
    .flat()
    .map(forceString);

  if (existing.includes(employee_id)) {
    return { success: false, message: "Employee already exists" };
  }

  sheet.appendRow([
    employee_id,
    name,
    hash(pin),
    100,        // coins (number)
    ""          // session_id
  ]);

  return { success: true };
}

// ======================================================
// EMPLOYEE LOGIN
// ======================================================
function employeeLogin(data) {
  const id = forceString(data.employee_id);
  const pin = forceString(data.pin);

  const sheet = SpreadsheetApp.getActive().getSheetByName(EMPLOYEE_SHEET);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const rowId = forceString(rows[i][0]);

    if (rowId === id) {
      const validPin = forceString(rows[i][2]) === hash(pin);
      if (!validPin) return { success: false, message: "Invalid PIN" };

      const session = generateSessionId();
      sheet.getRange(i + 1, 5).setValue(session);

      return {
        success: true,
        type: "employee",
        employee_id: id,
        name: forceString(rows[i][1]),
        coins: forceNumber(rows[i][3]),
        session_id: session
      };
    }
  }

  return { success: false, message: "Employee not found" };
}

// ======================================================
// EMPLOYEE LOGOUT
// ======================================================
function employeeLogout(data) {
  const id = forceString(data.employee_id);
  const session = forceString(data.session_id);

  if (!validateEmployeeSession(id, session)) {
    return { success: false, message: "Invalid session" };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName(EMPLOYEE_SHEET);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (forceString(rows[i][0]) === id) {
      sheet.getRange(i + 1, 5).setValue("");
      return { success: true };
    }
  }

  return { success: false, message: "Employee not found" };
}

function getEmployee(data) {
  const id = forceString(data.employee_id);
  const session = forceString(data.session_id);

  if (!validateEmployeeSession(id, session))
    return { success: false, message: "Invalid session" };

  const sheet = SpreadsheetApp.getActive().getSheetByName(EMPLOYEE_SHEET);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (forceString(rows[i][0]) === id) {
      return {
        success: true,
        employee_id: id,
        name: forceString(rows[i][1]),
        coins: forceNumber(rows[i][3])
      };
    }
  }

  return { success: false, message: "Employee not found" };
}


// ======================================================
// SHOP SIGNUP
// ======================================================
function generateShopId() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHOP_SHEET);
  const last = sheet.getLastRow();

  if (last <= 1) return "SHOP001";

  const lastId = forceString(sheet.getRange(last, 1).getValue());
  const match = lastId.match(/SHOP(\d+)/);

  let num = match ? parseInt(match[1]) + 1 : last - 1;
  return "SHOP" + String(num).padStart(3, "0");
}

function shopSignup(data) {
  const name = forceString(data.shop_name);
  const owner = forceString(data.owner_employee_id);
  const password = forceString(data.password);

  const shop_id = generateShopId();
  const hashed = hash(password);

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHOP_SHEET);
  sheet.appendRow([
    shop_id,
    name,
    owner,
    hashed,
    0,     // coins number
    ""     // session
  ]);

  return { success: true, shop_id, shop_name: name };
}

// ======================================================
// SHOP LOGIN
// ======================================================
function shopLogin(data) {
  const id = forceString(data.shop_id);
  const password = forceString(data.password);

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHOP_SHEET);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (forceString(rows[i][0]) === id) {
      if (forceString(rows[i][3]) !== hash(password))
        return { success: false, message: "Invalid password" };

      const session = generateSessionId();
      sheet.getRange(i + 1, 6).setValue(session);

      return {
        success: true,
        type: "shop",
        shop_id: id,
        shop_name: forceString(rows[i][1]),
        owner: forceString(rows[i][2]),
        coins: forceNumber(rows[i][4]),
        session_id: session
      };
    }
  }

  return { success: false, message: "Shop not found" };
}

function getShop(data) {
  const shop_id = forceString(data.shop_id);
  const session_id = forceString(data.session_id);

  // Validate session
  if (!validateShopSession(shop_id, session_id)) {
    return { success: false, message: "Invalid session" };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHOP_SHEET);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (forceString(rows[i][0]) === shop_id) {
      return {
        success: true,
        shop_id,
        shop_name: forceString(rows[i][1]),
        owner: forceString(rows[i][2]),
        coins: forceNumber(rows[i][4])
      };
    }
  }

  return { success: false, message: "Shop not found" };
}

function shopLogout(data) {
  const shop_id = forceString(data.shop_id);
  const session_id = forceString(data.session_id);

  // Validate session
  if (!validateShopSession(shop_id, session_id)) {
    return { success: false, message: "Invalid session" };
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHOP_SHEET);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (forceString(rows[i][0]) === shop_id) {
      // Column 6 = session ID
      sheet.getRange(i + 1, 6).setValue("");
      return { success: true, message: "Logged out successfully" };
    }
  }

  return { success: false, message: "Shop not found" };
}


// ======================================================
// PAYMENT
// ======================================================
function makePayment(data) {
  const employee_id = forceString(data.employee_id);
  const employee_session_id = forceString(data.employee_session_id);
  const shop_id = forceString(data.shop_id);
  const amount = forceNumber(data.amount);
  const pin = forceString(data.pin);

  if (!validateEmployeeSession(employee_id, employee_session_id))
    return { success: false, message: "Invalid employee session" };

  if (amount <= 0)
    return { success: false, message: "Invalid amount" };

  const empSheet = SpreadsheetApp.getActive().getSheetByName(EMPLOYEE_SHEET);
  const empRows = empSheet.getDataRange().getValues();

  let empRow = null;
  let empCoins = 0;

  for (let i = 1; i < empRows.length; i++) {
    if (forceString(empRows[i][0]) === employee_id) {
      if (forceString(empRows[i][2]) !== hash(pin))
        return { success: false, message: "Invalid PIN" };

      empCoins = forceNumber(empRows[i][3]);
      if (empCoins < amount)
        return { success: false, message: "Insufficient balance" };

      empRow = i + 1;
      break;
    }
  }

  if (!empRow) return { success: false, message: "Employee not found" };

  // Deduct employee coins
  const newEmpCoins = empCoins - amount;
  empSheet.getRange(empRow, 4).setValue(newEmpCoins);

  // Credit shop coins
  const shopSheet = SpreadsheetApp.getActive().getSheetByName(SHOP_SHEET);
  const shopRows = shopSheet.getDataRange().getValues();

  let shopRow = null;
  let shopName = "";
  for (let j = 1; j < shopRows.length; j++) {
    if (forceString(shopRows[j][0]) === shop_id) {
      const current = forceNumber(shopRows[j][4]);
      const newShopCoins = current + amount;

      shopSheet.getRange(j + 1, 5).setValue(newShopCoins);

      shopRow = j + 1;
      shopName = forceString(shopRows[j][1]);
      break;
    }
  }

  if (!shopRow)
    return { success: false, message: "Shop not found" };

  // Log transaction
  const txnSheet = SpreadsheetApp.getActive().getSheetByName(TXN_SHEET);
  const nextId = String(txnSheet.getLastRow()); // ALWAYS STRING ID
  const timestamp = formatTimestampForTxn(new Date());

  txnSheet.appendRow([
    nextId,
    timestamp,
    employee_id,
    shop_id,
    shopName,
    amount
  ]);

  return {
    success: true,
    balance: newEmpCoins
  };
}

// ======================================================
// TRANSACTIONS
// ======================================================
function getEmployeeTransactions(data) {
  const id = forceString(data.employee_id);
  const session = forceString(data.session_id);

  if (!validateEmployeeSession(id, session))
    return { success: false, message: "Invalid session" };

  const sheet = SpreadsheetApp.getActive().getSheetByName(TXN_SHEET);
  const rows = sheet.getDataRange().getValues();

  const result = rows.slice(1)
    .filter(r => forceString(r[2]) === id)
    .map(r => ({
      transaction_id: forceString(r[0]),
      timestamp: forceString(r[1]),
      employee_id: forceString(r[2]),
      shop_id: forceString(r[3]),
      shop_name: forceString(r[4]),
      amount: forceNumber(r[5])
    }));

  return { success: true, transactions: result };
}

function getShopTransactions(data) {
  const id = forceString(data.shop_id);
  const session = forceString(data.session_id);

  if (!validateShopSession(id, session))
    return { success: false, message: "Invalid session" };

  const sheet = SpreadsheetApp.getActive().getSheetByName(TXN_SHEET);
  const rows = sheet.getDataRange().getValues();

  const result = rows.slice(1)
    .filter(r => forceString(r[3]) === id)
    .map(r => ({
      transaction_id: forceString(r[0]),
      timestamp: forceString(r[1]),
      employee_id: forceString(r[2]),
      shop_id: forceString(r[3]),
      shop_name: forceString(r[4]),
      amount: forceNumber(r[5])
    }));

  return { success: true, transactions: result };
}

function getAllShops() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHOP_SHEET);
  const rows = sheet.getDataRange().getValues();

  const shops = rows.slice(1).map(r => ({
    shop_id: forceString(r[0]),
    shop_name: forceString(r[1])
  }));

  return { success: true, shops };
}

