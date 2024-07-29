document.getElementById('signupButton').addEventListener('click', () => {
  document.getElementById('authForms').style.display = 'block';
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('loginForm').style.display = 'none';
});

document.getElementById('loginButton').addEventListener('click', () => {
  document.getElementById('authForms').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
});

// Handle Signup
document.getElementById('signupForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    const response = await fetch('/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();
    const messageDiv = document.getElementById('signupMessage');
    if (response.ok) {
      messageDiv.textContent = 'Signup successful';
      messageDiv.style.color = 'green';
    } else {
      messageDiv.textContent = `Error: ${result.message}`;
      messageDiv.style.color = 'red';
    }
  } catch (error) {
    document.getElementById('signupMessage').textContent = `Error: ${error.message}`;
  }
});

// Handle Login
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    const messageDiv = document.getElementById('loginMessage');
    if (response.ok) {
      messageDiv.textContent = 'Login successful';
      messageDiv.style.color = 'green';
      document.getElementById('authForms').style.display = 'none';
      document.getElementById('groupSection').style.display = 'block';
      localStorage.setItem('authToken', result.token); // Store token
      populateGroupsDropdown(); // Populate dropdown after login
      fetchBalanceSheet();
      fetchSettlementSheet();
    } else {
      messageDiv.textContent = `Error: ${result.message}`;
      messageDiv.style.color = 'red';
    }
  } catch (error) {
    document.getElementById('loginMessage').textContent = `Error: ${error.message}`;
  }
});

// Handle Logout
document.getElementById('logoutButton').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/logout', { method: 'POST' });
    if (response.ok) {
      localStorage.removeItem('authToken'); // Clear the token
      document.getElementById('groupSection').style.display = 'none';
      document.getElementById('authForms').style.display = 'block';
    } else {
      const result = await response.json();
      console.error('Error logging out:', result.message);
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
});

// Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Group Form Handling
document.getElementById('splitMethod').addEventListener('change', () => {
  const method = document.getElementById('splitMethod').value;
  const splitDetailsDiv = document.getElementById('splitDetails');
  splitDetailsDiv.innerHTML = ''; // Clear previous content

  const members = document.getElementById('members').value.split(',').map(member => member.trim());

  if (method === 'exact') {
    members.forEach(member => {
      splitDetailsDiv.innerHTML += `
        <div class="form-group">
          <label for="amount-${member}">${member}: </label>
          <input type="number" id="amount-${member}" name="amount-${member}" required>
        </div>`;
    });
  } else if (method === 'percentage') {
    members.forEach(member => {
      splitDetailsDiv.innerHTML += `
        <div class="form-group">
          <label for="percentage-${member}">${member}: </label>
          <input type="number" id="percentage-${member}" name="percentage-${member}" required>
        </div>`;
    });
  }
});

document.getElementById('groupForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const groupName = document.getElementById('groupName').value;
  const existingGroupId = document.getElementById('existingGroups').value; // Get selected group ID
  const members = document.getElementById('members').value.split(',').map(member => member.trim());
  const totalAmount = document.getElementById('totalAmount').value;
  const splitMethod = document.getElementById('splitMethod').value;
  const splitDetails = [];

  if (splitMethod === 'exact') {
    members.forEach(member => {
      const amount = document.getElementById(`amount-${member}`).value;
      if (amount) {
        splitDetails.push({ email: member, amount: Number(amount) });
      }
    });
  } else if (splitMethod === 'percentage') {
    members.forEach(member => {
      const percentage = document.getElementById(`percentage-${member}`).value;
      if (percentage) {
        splitDetails.push({ email: member, percentage: Number(percentage) });
      }
    });
  }

  const body = existingGroupId ? 
    { groupId: existingGroupId, splitDetails } : 
    { groupName, members, totalAmount, splitMethod, splitDetails };

  try {
    const token = localStorage.getItem('authToken'); // Retrieve token
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Include token in headers
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    if (response.ok) {
      alert('Group created or updated successfully.');
      populateGroupsDropdown(); // Refresh the dropdown
      fetchBalanceSheet();
      fetchSettlementSheet();
    } else {
      alert(`Error creating or updating group: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while creating or updating the group.');
  }
});

// Fetch Existing Groups and Populate Dropdown
async function populateGroupsDropdown() {
  try {
    const token = localStorage.getItem('authToken'); // Retrieve token
    const response = await fetch('/api/groups', {
      headers: { 'Authorization': `Bearer ${token}` } // Include token in headers
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const groups = await response.json();
    const groupDropdown = document.getElementById('existingGroups');
    groupDropdown.innerHTML = '<option value="">Select an existing group</option>'; // Add default option

    groups.forEach(group => {
      const option = document.createElement('option');
      option.value = group._id;
      option.textContent = group.groupName;
      groupDropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
  }
}

// Fetch Balance Sheet
async function fetchBalanceSheet() {
  try {
    const token = localStorage.getItem('authToken'); // Retrieve token
    const response = await fetch('/api/balanceSheet', {
      headers: { 'Authorization': `Bearer ${token}` } // Include token in headers
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const balanceSheet = await response.json();
    displayBalanceSheet(balanceSheet);
  } catch (error) {
    console.error('Error fetching balance sheet:', error);
  }
}

function displayBalanceSheet(data) {
  const balanceSheetDiv = document.getElementById('balanceSheet');
  if (data.length === 0) {
    balanceSheetDiv.innerHTML = '<p>No expenses recorded yet.</p>';
    return;
  }

  let html = '<table><tr><th>User</th><th>Balance</th></tr>';
  data.forEach(entry => {
    html += `<tr><td>${entry.user}</td><td>${entry.balance}</td></tr>`;
  });
  html += '</table>';
  balanceSheetDiv.innerHTML = html;
}

// Fetch Settlement Sheet
async function fetchSettlementSheet() {
  try {
    const token = localStorage.getItem('authToken'); // Retrieve token
    const response = await fetch('/api/settlementSheet', {
      headers: { 'Authorization': `Bearer ${token}` } // Include token in headers
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const settlementSheet = await response.json();
    displaySettlementSheet(settlementSheet);
  } catch (error) {
    console.error('Error fetching settlement sheet:', error);
  }
}

function displaySettlementSheet(data) {
  const settlementSheetDiv = document.getElementById('settlementSheet');
  if (data.length === 0) {
    settlementSheetDiv.innerHTML = '<p>No settlements recorded yet.</p>';
    return;
  }

  let html = '<table><tr><th>From</th><th>To</th><th>Amount</th></tr>';
  data.forEach(entry => {
    html += `<tr><td>${entry.from}</td><td>${entry.to}</td><td>${entry.amount}</td></tr>`;
  });
  html += '</table>';
  settlementSheetDiv.innerHTML = html;
}
