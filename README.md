
# **App Name**: Orbinova (“Orb” - global, inclusive + “Nova” - new star; fresh approach to workforce systems)


# **Initial Log In Details**: 

- ## HR LogIn
-   ## Employee ID - HROO1
-   ## Password - hrpassword



## Core Features:

- Live Clock & Date: Live display of the current date and time.
- Mark Attendance: Employees can mark their attendance with check-in/check-out buttons; stored locally in the browser using localStorage.
- Daily Attendance Table: Table view displays employee name, check-in time, check-out time, total hours worked, and attendance status (Present, Late, Absent). Attendance status updates automatically; 'Late' is assigned for check-ins after 12:00 PM.
- Add Employee: HR personnel can add new employee profiles to the application and all users will see all employee names in the attendance table. Employee data will be stored in localStorage.
- Export Report: Export the daily attendance records in .xlsx, .pdf or .csv format for reporting purposes using xlsx, jspdf and file-saver libraries.
- Search & Filter: Allows HR personnel to search for employees by name. and filters by date or status (Present/Late/Absent)
- Role-Based Login: Authentication system that has separate logins for HR and other employees. HR accounts are required for adding new employees and exporting attendance reports, viewing all employee details and viewing all employee attendance data.

## Style Guidelines:

- Primary color: Light and calming blue (#74B9FF) for a professional and welcoming feel.
- Background color: Very light blue (#F0F8FF), a muted version of the primary color, for a clean and non-distracting background.
- Accent color: Soft purple (#B19CD9) for interactive elements like buttons and links.
- Headline font: 'Space Grotesk' (sans-serif) for headings. Body font: 'Inter' (sans-serif) for body text. 'Space Grotesk' has a futuristic feel which pairs nicely with 'Inter', and provides excellent readability for user interfaces.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, clear icons from a library like Feather or Tabler Icons to represent actions and statuses.
- Clean, modern layout using Flexbox and Grid for responsiveness across devices. Prioritize clarity and ease of use.
