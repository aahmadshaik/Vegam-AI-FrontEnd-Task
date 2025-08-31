
---

# Admin Dashboard (React + TypeScript)

## Overview

This is a **React + TypeScript** project that implements a simple **Admin Dashboard** to manage users. The dashboard fetches user data from **JSONBin** and displays it in a **table** with filtering, pagination, and actions like **edit**, **delete**, and **toggle status**.

The project uses **@mui/material** and **@mui/icons-material** for UI components.

---

## Features

* Fetch users from **JSONBin** using the **native `fetch` API**.
* Display user data in a **MUI Table**.
* Columns include:

  * Name
  * Email
  * Role
  * Status (active/inactive)
  * Created date
  * Actions (Edit / Delete / Toggle Status)
* **Toggle Status**: Change user status from `active` → `inactive` and vice versa.
* **Edit & Delete**: Local functionality to update or remove users.
* **Filtering**:

  * Search by name, email, role, or department.
  * Filter by status, role, and department.
* **Pagination**: Navigate through pages with configurable page size.
* **User ID** is a **number**, used as the unique key for rendering.

---

## JSONBin Data Structure

The project uses a JSON structure like this:

```json
{
  "data": {
    "totalCount": 100,
    "users": [
      {
        "userId": 1,
        "Name": "Aizen",
        "Email": "aizen@gmail.com",
        "Status": "active",
        "CreatedAt": "2025-08-12T14:52:46.591",
        "groups": [
          {
            "groupId": "01K2AGRYT9XQKAB1JXZSTEF3E6",
            "groupName": "Standard User Group",
            "roles": [
              {
                "roleId": "01K2AGRYT9JNKM6JE9WVKZA2ND",
                "roleName": "Standard User"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

* Only the **role name** is rendered in the table.
* `userId` is a number.

---

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd admin-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Start the project:

```bash
npm start
```

---

## Usage

* The dashboard fetches users from **JSONBin**.
* You can **search, filter, edit, delete**, and **toggle user status**.
* Pagination allows navigation through multiple pages of users.

---

## Technologies Used

* **React** (with TypeScript)
* **@mui/material** (for UI components)
* **@mui/icons-material** (for icons)
* **JSONBin** (mock API)
* **Native fetch API** (to get user data)

---

## Notes

* The **API integration** for editing, deleting, or toggling status is **not implemented**; actions are performed **locally** for now.
* Filtering works on **all available fields** in the user data.
* Status changes reflect immediately in the table (**optimistic UI**).

---
