# Student Attrition Determination System

A Vercel-ready static application. It does not require FastAPI, MongoDB, environment variables, or any other backend.

## Defence login

- Email: `admin@institution.edu`
- Password: `Admin@123`

The authorized personnel record, active login session, and the eight most recent prediction runs are stored in the browser's local storage. Because this is a frontend-only defence build, the login is suitable for demonstration rather than production security.

## Prediction simulation

The app calculates a deterministic simulated attrition-risk score in the browser. It uses CGPA, semester GPA, previous GPA, attendance, course completion, failed units, outstanding courses, carryovers, repeated courses, GPA trend, and probation history. It never sends uploaded student records over the network.

## Deploy on Vercel

1. Upload this folder to GitHub or import it directly into Vercel.
2. Select **Other** as the framework preset if Vercel asks.
3. Leave Build Command empty.
4. Leave Output Directory as `.` (the project root).
5. Deploy. No environment variables are required.

Use `sample-data.csv` to demonstrate batch prediction.
