
# Uninstallation Guide

This guide explains how to safely remove the CampusConnect application from your system, including both the backend and frontend components.

---

## 🔧 Prerequisites

Before uninstalling, ensure:

- The app is not currently running.
- You've backed up any important data if needed.

---

## 🗑️ Uninstall Backend

### 1. Deactivate the Virtual Environment

If it's still active:

```sh
deactivate
```

### 2. Remove the Backend Directory

```sh
rm -rf backend
```

Or manually delete the `backend/` folder from your file system.

---

## 🧼 Uninstall Frontend

### 1. Stop the Dev Server (if running)

Use `Ctrl+C` in the terminal where `npm run dev` was running.

### 2. Remove the Frontend Directory

```sh
rm -rf frontend
```

Or delete the `frontend/` folder manually.

---

## 🧹 Clean Up Dependencies (Optional)

If you installed global packages for development, you may uninstall them:

```sh
npm uninstall -g <package-name>
pip uninstall <package-name>
```

---

## 🗃️ Remove Environment Files (Optional)

To delete environment configs:

```sh
rm backend/.env
```

---

## 🧨 Remove Database (Optional)

If you created a local database:

```sh
rm backend/database.db
```

Or remove any other database files you created manually.

---

## ✅ Uninstallation Complete

CampusConnect has now been fully removed from your system. You can reinstall it at any time by following the [Installation Guide](installation/index.md).

---