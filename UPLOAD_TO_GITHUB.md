# 📤 איך להעלות את הפרויקט ל-GitHub ולפרסם ב-Netlify

## שלב 1: ייצור Repository חדש ב-GitHub

### דרך 1: בשורת הפקודה (מהיר ביותר!)

**פתח PowerShell/Terminal בתיקיית הפרויקט** ובוצע את הפקודות הבאות:

```bash
# 1. אתחל git repository
git init

# 2. הוסף את כל הקבצים
git add .

# 3. צור commit ראשון
git commit -m "Initial commit - Monday shipment tracker"

# 4. צור repository חדש ב-GitHub והעתק את ה-URL
# (אתה תראה את ה-URL לאחר יצירת ה-repository ב-GitHub)
git remote add origin https://github.com/YOURUSERNAME/REPO-NAME.git

# 5. העלה את הקוד
git branch -M main
git push -u origin main
```

### דרך 2: ב-GitHub Desktop (פשוט יותר!)

1. **תוריד GitHub Desktop** אם אין לך:
   - https://desktop.github.com

2. **פתח את GitHub Desktop**

3. **File > Add Local Repository**
   - לחץ "choose..." ובחר את התיקיה של הפרויקט
   - לחץ "Add repository"

4. **צור Repository ב-GitHub:**
   - לחץ על "Publish repository"
   - תן שם: `monday-shipment-tracker`
   - בחר אם Public או Private
   - **לא** לסמן את "Keep this code private" אם אתה רוצה Public
   - לחץ "Publish Repository"

## שלב 2: פרסום ב-Netlify

### א. חיבור ל-GitHub

1. **פתח Netlify:**
   - היכנס ל: https://app.netlify.com
   - היכנס עם חשבון GitHub שלך

2. **יצירת אתר חדש:**
   - לחץ על הכפתור "Add new site" (פינה ימין עליונה)
   - בחר "Import an existing project"

3. **בחר GitHub** כספק Git

4. **אשר הרשאות:**
   - Netlify יבקש הרשאה לגשת ל-repositories שלך
   - לחץ "Authorize Netlify"

### ב. מציאת ה-Repository

1. **בחלון החיפוש "Search your repos":**
   - חפש: `monday-shipment-tracker`
   - או חפש: `shipments project`

2. **אם לא מופיע:**
   - לחץ F5 לרענון הדף
   - או לחץ על הכפתור "Configure the Netlify app in GitHub"
   - בחר "All repositories" במקום "Only select repositories"
   - לחץ "Install"

3. **בחר את ה-Repository:**
   - חפש את `monday-shipment-tracker` (או השם שנתת)
   - לחץ עליו

### ג. הגדרות הפרסום

**הגדרות Build:**
```
Build command: (השאר ריק!)
Publish directory: (השאר ריק!)
```

- **לא** צריך לבנות את הפרויקט - זה אתר סטטי
- פשוט לחץ "Deploy site"

### ד. המתן לסיום הפרסום

- Netlify יתחיל לפרסם (זה לוקח כמה שניות)
- תראה הודעת הצלחה עם כתובת ה-URL שלך

## שלב 3: הוספת משתני הסביבה (החשוב ביותר!)

עכשיו הקוד בפורס אך עדיין לא מחובר ל-Monday.com.

### א. קבל את הפרטים מ-Monday.com

1. **API Token:**
   - לך ל: https://auth.monday.com/users/sign_in_new
   - העתק את ה-Token

2. **Board ID:**
   - פתח את הלוח שלך ב-Monday.com
   - העתק את המספר מה-URL

### ב. הוסף ב-Netlify

1. **ב-Netlify, לחץ על האתר שלך**

2. **לחץ "Site settings"** (בתפריט העליון)

3. **בחר "Environment variables"** (בתפריט הצד)

4. **הוסף משתנה ראשון:**
   ```
   Key: MONDAY_API_TOKEN
   Value: [הדבק את ה-Token כאן]
   ```
   - לחץ "Add variable"

5. **הוסף משתנה שני:**
   ```
   Key: MONDAY_BOARD_ID
   Value: [הדבק את ה-Board ID כאן]
   ```
   - לחץ "Add variable"

6. **זה קריטי - פרסם מחדש:**
   - לחץ על "Deploy" בתפריט העליון
   - בחר "Trigger deploy" > "Clear cache and deploy site"

## שלב 4: בדיקה

1. פתח את האתר (הכתובת מופיעה בדף הראשי)
2. הכנס מזהה לקוח
3. בדוק שהמשלוחים מופיעים! 🎉

---

## ❓ פתרון בעיות

### הבעיה: "No repositories found"

**פתרון:**
1. פתח את GitHub בדפדפן
2. ודא שיצרת repository חדש
3. ודא שהעלית את הקוד
4. ב-Netlify: Clear Cache > Hard Reload

### הבעיה: לא רואים את ה-repository ב-Netlify

**פתרון:**
1. לחץ "Configure the Netlify app in GitHub"
2. ודא שבחרת "All repositories" (לא "Only select repositories")
3. רענן את הדף (F5)

### הבעיה: Build failed

**פתרון:**
1. ודא ש-Build command ריק
2. ודא ש-Publish directory ריק
3. לוגים לראות מה השגיאה

---

**בהצלחה! 🚀**
