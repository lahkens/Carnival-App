
// === 1. Test Employee Signup ===
function test_employeeSignup() {
  const result = employeeSignup({
    employee_id: "EMP100",
    name: "John Tester",
    pin: "1234"
  });
  Logger.log(result);
}


// === 2. Test Employee Login ===
function test_employeeLogin() {
  const result = employeeLogin({
    employee_id: "EMP100", // ensure exists
    pin: "1234"
  });
  Logger.log(result);
}


// === 3. Test Employee Logout ===
function test_employeeLogout() {
  const login = employeeLogin({
    employee_id: "EMP100",
    pin: "1234"
  });

  const result = employeeLogout({
    employee_id: "EMP100",
    session_id: login.session_id
  });

  Logger.log(result);
}


// === 4. Test Get Employee Info ===
function test_getEmployee() {
  const login = employeeLogin({
    employee_id: "EMP100",
    pin: "1234"
  });

  const result = getEmployee({
    employee_id: "EMP100",
    session_id: login.session_id
  });

  Logger.log(result);
}


// === 5. Test Shop Signup ===
function test_shopSignup() {
  const result = shopSignup({
    shop_name: "Snacks Stall",
    owner_employee_id: "EMP100",
    password: "pass123"
  });

  Logger.log(result);
  // Example output:
  // { success: true, shop_id: "SHOP001", shop_name: "Snacks Stall" }
}


// === 6. Test Shop Login ===
function test_shopLogin() {
  const result = shopLogin({
    shop_id: "SHOP001",    // update if needed
    password: "pass123"
  });

  Logger.log(result);
}


// === 7. Test Shop Logout ===
function test_shopLogout() {
  const login = shopLogin({
    shop_id: "SHOP001",
    password: "pass123"
  });

  const result = shopLogout({
    shop_id: "SHOP001",
    session_id: login.session_id
  });

  Logger.log(result);
}


// === 8. Test Get Shop Info ===
function test_getShop() {
  const login = shopLogin({
    shop_id: "SHOP001",
    password: "pass123"
  });

  const result = getShop({
    shop_id: "SHOP001",
    session_id: login.session_id
  });

  Logger.log(result);
}


// === 9. Test Payment ===
function test_makePayment() {
  const emp = employeeLogin({
    employee_id: "EMP100",
    pin: "1234"
  });

  const shop = shopLogin({
    shop_id: "SHOP001",
    password: "pass123"
  });

  const result = makePayment({
    employee_id: "EMP100",
    employee_session_id: emp.session_id,
    shop_id: "SHOP001",
    amount: 20,
    pin: "1234"
  });

  Logger.log(result);
}


// === 10. Test Get Employee Transactions ===
function test_getEmployeeTransactions() {
  const emp = employeeLogin({
    employee_id: "EMP100",
    pin: "1234"
  });

  const result = getEmployeeTransactions({
    employee_id: "EMP100",
    session_id: emp.session_id
  });

  Logger.log(result);
}


// === 11. Test Get Shop Transactions ===
function test_getShopTransactions() {
  const shop = shopLogin({
    shop_id: "SHOP001",
    password: "pass123"
  });

  const result = getShopTransactions({
    shop_id: "SHOP001",
    session_id: shop.session_id
  });

  Logger.log(result);
}


// === 12. Proper doPost Simulation (URL-encoded format) ===
function test_doPost_employeeLogin() {
  // Apps Script receives e.parameter, NOT JSON body
  const fakeRequest = {
    parameter: {
      action: "employeeLogin",
      employee_id: "EMP100",
      pin: "1234"
    }
  };

  const response = doPost(fakeRequest);
  Logger.log(response.getContent());
}
