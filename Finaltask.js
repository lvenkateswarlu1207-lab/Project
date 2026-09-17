// ==========================================
// EMPLOYEE MANAGEMENT SYSTEM
// ==========================================

// API URL
const API_URL = "https://dummyjson.com/users";

// Employee array
let employees = [];

// Current displayed employees
let displayedEmployees = [];

// ==========================================
// DOM ELEMENTS
// ==========================================

const employeeContainer = document.getElementById("employeeContainer");
const employeeCount = document.getElementById("employeeCount");
const loadingMessage = document.getElementById("loadingMessage");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");

const errorMessage = document.getElementById("errorMessage");

const totalSalary = document.getElementById("totalSalary");
const averageSalary = document.getElementById("averageSalary");
const highestSalary = document.getElementById("highestSalary");

const dateTime = document.getElementById("dateTime");


// ==========================================
// FETCH EMPLOYEES
// ==========================================

function fetchEmployees() {

    loadingMessage.innerHTML = "Loading employees...";

    fetch(API_URL)

        .then(function(response) {

            if (!response.ok) {
                throw new Error("API Error");
            }

            return response.json();
        })

        .then(function(data) {

            // Store API users inside employees array
            employees = data.users.map(function(user) {

                return {
                    id: user.id,
                    name: user.firstName + " " + user.lastName,
                    age: user.age,
                    email: user.email,
                    phone: user.phone,
                    department: user.company.department,
                    image: user.image,

                    // API users don't have salary,
                    // so we give them a sample salary.
                    salary: 50000
                };
            });

            loadingMessage.innerHTML =
                "Employee data loaded successfully.";

            displayEmployees(employees);
        })

        .catch(function(error) {

            console.log(error);

            loadingMessage.innerHTML =
                "Unable to load employee data. Please try again.";
        })

        .finally(function() {

            console.log("API request completed");

        });
}


// ==========================================
// DISPLAY EMPLOYEES
// ==========================================

function displayEmployees(employeeList) {

    employeeContainer.innerHTML = "";

    displayedEmployees = employeeList;

    employeeList.forEach(function(employee) {

        const card = document.createElement("div");

        card.className = "employee-card";

        card.innerHTML = `
            <img 
                src="${employee.image || "https://via.placeholder.com/100"}"
                alt="${employee.name}"
            >

            <h3>${employee.name}</h3>

            <p>Age: ${employee.age}</p>

            <p>Email: ${employee.email}</p>

            <p>Department: ${employee.department}</p>

            <p>Phone: ${employee.phone || "Not Available"}</p>

            <p>Salary: ₹${employee.salary.toLocaleString("en-IN")}</p>

            <button onclick="deleteEmployee(${employee.id})">
                Delete
            </button>
        `;

        employeeContainer.appendChild(card);
    });

    updateEmployeeCount(employeeList);

    calculateSalary(employeeList);

    findHighestSalary(employeeList);
}


// ==========================================
// SEARCH EMPLOYEES
// ==========================================

function searchEmployees() {

    const searchText = searchInput.value.toLowerCase().trim();

    const matchingEmployees = employees.filter(function(employee) {

        return employee.name.toLowerCase().includes(searchText);
    });

    displayEmployees(matchingEmployees);
}


// ==========================================
// DEPARTMENT FILTER
// ==========================================

function filterDepartment(department) {

    if (department === "All") {

        displayEmployees(employees);

        return;
    }

    const filteredEmployees = employees.filter(function(employee) {

        return employee.department.toLowerCase() ===
               department.toLowerCase();

    });

    displayEmployees(filteredEmployees);
}


// ==========================================
// UPDATE EMPLOYEE COUNT
// ==========================================

function updateEmployeeCount(employeeList) {

    employeeCount.innerHTML =
        `Total Employees: ${employeeList.length}`;
}


// ==========================================
// ADD EMPLOYEE
// ==========================================

function addEmployee() {

    const name = nameInput.value.trim();
    const age = Number(ageInput.value);
    const email = emailInput.value.trim();
    const department = departmentInput.value;

    // Validate employee
    const isValid = validateEmployee(
        name,
        age,
        email,
        department
    );

    if (!isValid) {
        return;
    }

    // Create employee object
    const newEmployee = {

        id: Date.now(),

        name: name,

        age: age,

        email: email,

        department: department,

        phone: "Not Available",

        image: "https://via.placeholder.com/100",

        salary: 50000
    };

    // Add employee to array
    employees = [...employees, newEmployee];

    // Display updated employees
    displayEmployees(employees);

    // Clear form
    clearForm();

    errorMessage.innerHTML =
        "Employee added successfully.";
}


// ==========================================
// DELETE EMPLOYEE
// ==========================================

function deleteEmployee(id) {

    employees = employees.filter(function(employee) {

        return employee.id !== id;
    });

    displayEmployees(employees);
}


// ==========================================
// VALIDATE EMPLOYEE
// ==========================================

function validateEmployee(
    name,
    age,
    email,
    department
) {

    errorMessage.innerHTML = "";

    if (name === "") {

        errorMessage.innerHTML =
            "❌ Please enter employee name";

        return false;
    }

    if (age <= 18 || isNaN(age)) {

        errorMessage.innerHTML =
            "❌ Age must be greater than 18";

        return false;
    }

    if (email === "") {

        errorMessage.innerHTML =
            "❌ Please enter employee email";

        return false;
    }

    if (department === "") {

        errorMessage.innerHTML =
            "❌ Please select department";

        return false;
    }

    return true;
}


// ==========================================
// CLEAR FORM
// ==========================================

function clearForm() {

    nameInput.value = "";

    ageInput.value = "";

    emailInput.value = "";

    departmentInput.value = "";
}


// ==========================================
// SALARY CALCULATION
// ==========================================

function calculateSalary(employeeList) {

    // Total salary
    const total = employeeList.reduce(
        function(sum, employee) {

            return sum + employee.salary;

        },
        0
    );

    // Average salary
    const average =
        employeeList.length > 0
            ? total / employeeList.length
            : 0;

    totalSalary.innerHTML =
        `Total Salary: ₹${total.toLocaleString("en-IN")}`;

    averageSalary.innerHTML =
        `Average Salary: ₹${Math.round(average).toLocaleString("en-IN")}`;
}


// ==========================================
// HIGHEST SALARY EMPLOYEE
// ==========================================

function findHighestSalary(employeeList) {

    if (employeeList.length === 0) {

        highestSalary.innerHTML =
            "Highest Paid Employee: None";

        return;
    }

    const highestEmployee = employeeList.reduce(
        function(highest, employee) {

            return employee.salary > highest.salary
                ? employee
                : highest;

        }
    );

    highestSalary.innerHTML = `
        Highest Paid Employee:
        ${highestEmployee.name}
        - ₹${highestEmployee.salary.toLocaleString("en-IN")}
    `;
}


// ==========================================
// SORT EMPLOYEES BY NAME
// ==========================================

function sortByName() {

    const sortedEmployees = [...employees];

    sortedEmployees.sort(function(a, b) {

        return a.name.localeCompare(b.name);

    });

    displayEmployees(sortedEmployees);
}


// ==========================================
// SORT EMPLOYEES BY AGE
// ==========================================

function sortByAge() {

    const sortedEmployees = [...employees];

    sortedEmployees.sort(function(a, b) {

        return a.age - b.age;

    });

    displayEmployees(sortedEmployees);
}


// ==========================================
// SORT EMPLOYEES BY SALARY
// ==========================================

function sortBySalary() {

    const sortedEmployees = [...employees];

    sortedEmployees.sort(function(a, b) {

        return b.salary - a.salary;

    });

    displayEmployees(sortedEmployees);
}


// ==========================================
// FIND EMPLOYEE USING find()
// ==========================================

function findEmployeeById(id) {

    const employee = employees.find(function(employee) {

        return employee.id === id;

    });

    return employee;
}


// ==========================================
// SOME() EXAMPLE
// ==========================================

function checkEmployeeExists(name) {

    const exists = employees.some(function(employee) {

        return employee.name.toLowerCase() ===
               name.toLowerCase();

    });

    return exists;
}


// ==========================================
// EVERY() EXAMPLE
// ==========================================

function checkEmployeeAges() {

    const validAges = employees.every(function(employee) {

        return employee.age > 18;

    });

    return validAges;
}


// ==========================================
// DATE & TIME
// ==========================================

function updateDateTime() {

    const now = new Date();

    const day = now.getDate();

    const month = now.toLocaleString(
        "en-US",
        { month: "long" }
    );

    const year = now.getFullYear();

    let hours = now.getHours();

    const minutes =
        now.getMinutes().toString().padStart(2, "0");

    const seconds =
        now.getSeconds().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    dateTime.innerHTML = `
        Today: ${day} ${month} ${year}
        <br>
        Time: ${hours}:${minutes}:${seconds} ${ampm}
    `;
}


// ==========================================
// EVENT LISTENERS
// ==========================================

// Search button
searchButton.addEventListener(
    "click",
    searchEmployees
);


// Search when typing
searchInput.addEventListener(
    "input",
    searchEmployees
);


// Add employee button
document
    .getElementById("addEmployeeButton")
    .addEventListener(
        "click",
        addEmployee
    );


// Department buttons
document
    .getElementById("allButton")
    .addEventListener(
        "click",
        function() {
            filterDepartment("All");
        }
    );


document
    .getElementById("itButton")
    .addEventListener(
        "click",
        function() {
            filterDepartment("IT");
        }
    );


document
    .getElementById("hrButton")
    .addEventListener(
        "click",
        function() {
            filterDepartment("HR");
        }
    );


document
    .getElementById("financeButton")
    .addEventListener(
        "click",
        function() {
            filterDepartment("Finance");
        }
    );


document
    .getElementById("marketingButton")
    .addEventListener(
        "click",
        function() {
            filterDepartment("Marketing");
        }
    );


// Sorting buttons
document
    .getElementById("sortName")
    .addEventListener(
        "click",
        sortByName
    );


document
    .getElementById("sortAge")
    .addEventListener(
        "click",
        sortByAge
    );


document
    .getElementById("sortSalary")
    .addEventListener(
        "click",
        sortBySalary
    );


// ==========================================
// START APPLICATION
// ==========================================

fetchEmployees();

updateDateTime();


// Update clock every second
setInterval(
    updateDateTime,
    1000
);
