const API_URL = "https://dummyjson.com/users";
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let employees = [];
let currentDepartment = "All";
let currentSearch = "";
let sortField = "name";
let sortDirection = "asc";

const statusMessage = document.getElementById("statusMessage");
const employeeGrid = document.getElementById("employeeGrid");
const employeeCount = document.getElementById("employeeCount");
const countLabel = document.getElementById("countLabel");
const totalSalaryEl = document.getElementById("totalSalary");
const averageSalaryEl = document.getElementById("averageSalary");
const highestPaidEl = document.getElementById("highestPaid");
const formErrors = document.getElementById("formErrors");
const searchInput = document.getElementById("searchInput");
const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const emailInput = document.getElementById("emailInput");
const departmentInput = document.getElementById("departmentInput");
const salaryInput = document.getElementById("salaryInput");

function padTime(value) {
  return value < 10 ? `0${value}` : String(value);
}

function updateDateTime() {
  const now = new Date();
  const day = now.getDate();
  const month = MONTH_NAMES[now.getMonth()];
  const year = now.getFullYear();
  const hours24 = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  document.getElementById("todayDate").textContent = `${day} ${month} ${year}`;
  document.getElementById("currentTime").textContent =
    `${padTime(hours12)}:${padTime(minutes)}:${padTime(seconds)} ${period}`;
}

function formatRupees(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function mapDepartment(apiDepartment) {
  const dept = String(apiDepartment || "").toLowerCase();

  if (dept.includes("human") || dept.includes("support") || dept.includes("service")) {
    return "HR";
  }

  if (dept.includes("account") || dept.includes("legal") || dept.includes("finance")) {
    return "Finance";
  }

  if (dept.includes("market") || dept.includes("sales")) {
    return "Marketing";
  }

  return "IT";
}

function transformUser(user) {
  const { id, firstName, lastName, age, email, phone, image, company } = user;
  const fullName = `${firstName} ${lastName}`.trim();
  const department = mapDepartment(company && company.department);
  const salary = 38000 + age * 1100 + (id % 9) * 2800;

  return {
    id,
    name: fullName,
    age,
    email,
    phone,
    image,
    department,
    company: company && company.name ? company.name : "Internal",
    salary,
  };
}

function setStatus(text, type) {
  statusMessage.textContent = text;
  statusMessage.className = `status-banner${type ? ` ${type}` : ""}`;
}

function fetchEmployees() {
  setStatus("Loading employees...");

  fetch(API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Bad response");
      }
      return response.json();
    })
    .then((data) => {
      const users = data.users || [];
      return new Promise((resolve) => {
        setTimeout(() => {
          employees = users.map(transformUser);
          refreshDashboard();
          setStatus("Employee data loaded successfully.", "success");
          resolve();
        }, 700);
      });
    })
    .catch(() => {
      employees = [];
      refreshDashboard();
      setStatus("Unable to load employee data. Please try again.", "error");
    })
    .finally(() => {
      statusMessage.style.opacity = "1";
    });
}

function getFilteredEmployees() {
  const query = currentSearch.trim().toLowerCase();

  return employees.filter((employee) => {
    const { name, department } = employee;
    const matchesName = name.toLowerCase().includes(query);
    const matchesDepartment =
      currentDepartment === "All" || department === currentDepartment;
    return matchesName && matchesDepartment;
  });
}

function sortEmployees(list) {
  const sorted = [...list];

  sorted.sort((a, b) => {
    let left = a[sortField];
    let right = b[sortField];

    if (sortField === "name") {
      left = String(left).toLowerCase();
      right = String(right).toLowerCase();
    }

    if (left < right) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (left > right) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  return sorted;
}

function calculateSalary(list) {
  if (!list.length) {
    return { total: 0, average: 0 };
  }

  const total = list.reduce((sum, employee) => sum + Number(employee.salary || 0), 0);
  const average = total / list.length;
  return { total, average };
}

function getHighestPaidEmployee(list) {
  if (!list.length) {
    return null;
  }

  return list.reduce((highest, employee) => {
    return employee.salary > highest.salary ? employee : highest;
  });
}

function updateEmployeeCount(list) {
  const count = list.length;
  employeeCount.textContent = count;

  if (currentDepartment === "All") {
    countLabel.textContent = "Total Employees";
  } else {
    countLabel.textContent = `${currentDepartment} Employees`;
  }

  const { total, average } = calculateSalary(list);
  totalSalaryEl.textContent = formatRupees(Math.round(total));
  averageSalaryEl.textContent = count ? formatRupees(Math.round(average)) : "₹0";

  const topEmployee = getHighestPaidEmployee(list);
  highestPaidEl.textContent = topEmployee
    ? `Name: ${topEmployee.name}\nSalary: ${formatRupees(topEmployee.salary)}`
    : "—";
  highestPaidEl.style.whiteSpace = "pre-line";
}

function displayEmployees(list) {
  employeeGrid.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No employees match the current search or filter.";
    employeeGrid.appendChild(empty);
    return;
  }

  list.forEach((employee) => {
    const { id, name, age, email, department, phone, image, salary, company } = employee;
    const card = document.createElement("article");
    card.className = "employee-card";
    card.setAttribute("data-id", String(id));
    card.setAttribute("data-department", department);

    const colors = {
      IT: "#0f766e",
      HR: "#9d174d",
      Finance: "#1d4ed8",
      Marketing: "#c2410c",
    };
    card.style.setProperty("--dept-color", colors[department] || "#1b1714");

    card.innerHTML = `
      <div class="card-top">
        <img src="${image}" alt="${name}" />
        <div>
          <h3>${name}</h3>
          <span class="dept-tag">${department}</span>
        </div>
      </div>
      <p class="meta">Age: ${age}</p>
      <p class="meta">Email: ${email}</p>
      <p class="meta">Department: ${department}</p>
      <p class="meta">Company: ${company}</p>
      <p class="meta">Phone: ${phone}</p>
      <p class="meta">Salary: ${formatRupees(salary)}</p>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteEmployee(id));
    card.appendChild(deleteBtn);
    employeeGrid.appendChild(card);
  });
}

function refreshDashboard() {
  const filtered = getFilteredEmployees();
  const sorted = sortEmployees(filtered);
  displayEmployees(sorted);
  updateEmployeeCount(sorted);
}

function searchEmployees(event) {
  if (event) {
    event.preventDefault();
  }
  currentSearch = searchInput.value;
  refreshDashboard();
}

function filterDepartment(department) {
  currentDepartment = department;
  const buttons = document.querySelectorAll("#departmentFilters .chip");
  buttons.forEach((button) => {
    const isActive = button.getAttribute("data-department") === department;
    button.classList.toggle("active", isActive);
  });
  refreshDashboard();
}

function updateSortButtons() {
  const arrow = sortDirection === "asc" ? "↑" : "↓";
  document.querySelectorAll(".sort-btn").forEach((button) => {
    const field = button.getAttribute("data-sort");
    const label = field[0].toUpperCase() + field.slice(1);
    button.textContent = field === sortField ? `${label} ${arrow}` : `${label} ↑`;
  });
}

function handleSort(field) {
  if (sortField === field) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortField = field;
    sortDirection = "asc";
  }
  updateSortButtons();
  refreshDashboard();
}

function validateEmployee(candidate) {
  const errors = [];
  const { name, age, email, department, salary } = candidate;
  const fields = [name, email, department];

  if (!name || !name.trim()) {
    errors.push("❌ Please enter employee name");
  }

  if (!age || Number(age) <= 18) {
    errors.push("❌ Age must be greater than 18");
  }

  if (!email || !email.trim()) {
    errors.push("❌ Please enter employee email");
  } else if (!email.includes("@")) {
    errors.push("❌ Please enter a valid email");
  }

  if (!department) {
    errors.push("❌ Department must be selected");
  }

  if (!salary || Number(salary) <= 0) {
    errors.push("❌ Please enter a valid salary");
  }

  const allFilled = fields.every((value) => Boolean(String(value || "").trim()));
  const duplicateEmail = employees.some(
    (employee) => employee.email.toLowerCase() === String(email).toLowerCase()
  );

  if (allFilled && duplicateEmail) {
    errors.push("❌ An employee with this email already exists");
  }

  return errors;
}

function showFormErrors(errors) {
  formErrors.innerHTML = "";

  if (!errors.length) {
    formErrors.hidden = true;
    return;
  }

  errors.forEach((message) => {
    const item = document.createElement("li");
    item.textContent = message;
    formErrors.appendChild(item);
  });
  formErrors.hidden = false;
}

function clearForm() {
  nameInput.value = "";
  ageInput.value = "";
  emailInput.value = "";
  departmentInput.value = "";
  salaryInput.value = "";
  showFormErrors([]);
}

function addEmployee(event) {
  event.preventDefault();

  const candidate = {
    name: nameInput.value.trim(),
    age: Number(ageInput.value),
    email: emailInput.value.trim(),
    department: departmentInput.value,
    salary: Number(salaryInput.value),
  };

  const errors = validateEmployee(candidate);
  if (errors.length) {
    showFormErrors(errors);
    return;
  }

  const nextId = employees.length
    ? Math.max(...employees.map((employee) => employee.id)) + 1
    : 101;

  const encodedName = encodeURIComponent(candidate.name);
  const newEmployee = {
    id: nextId,
    ...candidate,
    phone: "Not provided",
    company: "Internal Hire",
    image: `https://ui-avatars.com/api/?name=${encodedName}&background=2a241f&color=f6efe4&size=128`,
  };

  employees = [...employees, newEmployee];
  clearForm();
  refreshDashboard();
  setStatus("New employee added to the roster.", "success");
}

function deleteEmployee(id) {
  const found = employees.find((employee) => employee.id === id);
  if (!found) {
    return;
  }

  employees = employees.filter((employee) => employee.id !== id);
  refreshDashboard();
  setStatus(`${found.name} was removed from the roster.`, "success");
}

document.getElementById("searchForm").addEventListener("submit", searchEmployees);
searchInput.addEventListener("input", searchEmployees);

document.querySelectorAll("#departmentFilters .chip").forEach((button) => {
  button.addEventListener("click", () => {
    filterDepartment(button.getAttribute("data-department"));
  });
});

document.querySelectorAll(".sort-btn").forEach((button) => {
  button.addEventListener("click", () => {
    handleSort(button.getAttribute("data-sort"));
  });
});

document.getElementById("addForm").addEventListener("submit", addEmployee);

updateDateTime();
setInterval(updateDateTime, 1000);
updateSortButtons();
fetchEmployees();
