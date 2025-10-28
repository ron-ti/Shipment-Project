# 🚀 מדריך התקנה מלא

מדריך זה מנחה אותך בכל שלבי ההתקנה של מעקב המשלוחים.

## שלב 1: קבלת פרטי Monday.com

### א. קבלת API Token

1. **היכנס ל-Monday.com**
   - לך לכתובת: https://auth.monday.com/users/sign_in_new
   - התחבר עם החשבון שלך

2. **מצא את ה-API Token**
   - גלול למטה עד שתראה את החלק "Developer"
   - או לך ישירות ל: https://auth.monday.com/users/sign_in_new
   - תחת "Developer API" תראה את ה-API Token שלך
   - לחץ על "Copy" כדי להעתיק

3. **שמור את ה-Token** (זה חשוב!)
   - העתק את ה-Token למקום בטוח
   - זה ייראה משהו כמו: `eyJhbGciOiJIUzI1NiJ9...` (ארוך מאוד)

### ב. מציאת Board ID

1. **פתח את הלוח שלך ב-Monday.com**
   - היכנס ל-Monday.com
   - פתח את הלוח (Board) שאתה רוצה להשתמש בו

2. **העתק את ה-ID מה-URL**
   - תראה שורת כתובת שנראית ככה:
   ```
   https://yourcompany.monday.com/boards/1234567890
   ```
   - המספר בסוף הוא ה-Board ID שלך: `1234567890`
   - העתק את המספר הזה

## שלב 2: העלאת הפרויקט ל-GitHub

### א. יצירת Repository חדש

1. **היכנס ל-GitHub**
2. **לחץ על "New repository"**
3. **הגדר את הפרויקט:**
   - שם: `monday-shipment-tracker` (או כל שם שאתה רוצה)
   - Public או Private (ההעדפה שלך)
   - **אל תוסיף** README או .gitignore (כבר יש לנו)

### ב. העלאת הקוד

פתח את Terminal/PowerShell בתיקיית הפרויקט ובוצע:

```bash
# אתחול git (אם עדיין לא עשית)
git init

# הוסף את כל הקבצים
git add .

# צור commit
git commit -m "Initial commit"

# הוסף את ה-GitHub repository (החלף ב-URL שלך)
git remote add origin https://github.com/yourusername/monday-shipment-tracker.git

# העלה את הקוד
git branch -M main
git push -u origin main
```

**או אם אתה משתמש ב-GitHub Desktop:**
1. פתח את GitHub Desktop
2. File > Add Local Repository
3. בחר את תיקיית הפרויקט
4. Publish repository

## שלב 3: פרסום ב-Netlify

### א. התחברות ל-Netlify

1. **היכנס ל-Netlify**
   - לך לכתובת: https://app.netlify.com
   - היכנס עם חשבון GitHub שלך (הכי קל)

### ב. יצירת אתר חדש

1. **לחץ על "Add new site" > "Import an existing project"**
2. **בחר את GitHub** כספק ה-Git
3. **אשר את ההרשאות** כדי לתת ל-Netlify גישה ל-repositories שלך
4. **בחר את ה-repository** שיצרת
5. **הגדרות הפרסום:**
   - Build command: (השאר ריק - לא צריך build)
   - Publish directory: (השאר ריק - אנחנו מפרסמים הכל)
   - לחץ על "Deploy site"

### ג. הוספת משתני סביבה (החלק הכי חשוב!)

1. **לאחר שהפרסום הסתיים, לך ל-Site settings:**
   - במסך הראשי של האתר שלך
   - לחץ על "Site settings"

2. **בחר "Environment variables"**

3. **הוסף משתנה ראשון:**
   ```
   Key: MONDAY_API_TOKEN
   Value: [הדבק כאן את ה-API Token שהעתקת]
   ```
   - לחץ על "Add variable"

4. **הוסף משתנה שני:**
   ```
   Key: MONDAY_BOARD_ID
   Value: [הדבק כאן את ה-Board ID שהעתקת]
   ```
   - לחץ על "Add variable"

5. **לחץ על "Redeploy"** (בחלק העליון)
   - בחר "Clear cache and deploy site"

> ⚠️ **חשוב!** אחרי הוספת משתני הסביבה, **חובה** לפרסם מחדש (Redeploy) כדי שהשינויים ייכנסו לתוקף!

## שלב 4: בדיקה שהכל עובד

### א. בדיקת ההגדרות

1. **פתח את האתר שלך** (כתובת תופיע במסך הראשי)
2. **פתח את Console בדפדפן:**
   - לחץ F12
   - לך לטאב "Console"

3. **בדוק שאין שגיאות**

### ב. בדיקת פונקציה

1. **ב-Netlify, לך ל:**
   - Site settings > Functions
   
2. **בדוק שה-function קיים:**
   - תראה `monday-api` ברשימה

### ג. בדיקת API

1. **פתח את האתר**
2. **הכנס מזהה לקוח** שנמצא בלוח שלך
3. **לחץ "הצג משלוחים"**
4. **אמור לראות את המשלוחים**

## 🔧 פתרון בעיות

### הבעיה: "Failed to fetch shipments"

**פתרון:**
1. בדוק שמשתני הסביבה נוספו נכון
2. ודא שפרסמת מחדש (Redeploy)
3. בדוק את ה-Console לראות את השגיאה המדויקת
4. וודא שה-API Token וה-Board ID נכונים

### הבעיה: "No shipments found"

**פתרון:**
1. וודא שמזהה הלקוח זהה בדיוק ל-Monday.com
2. בדוק שהעמודה "לקוח" קיימת בלוח
3. ודא שיש שורות עם המזהה הזה

### הבעיה: Function לא עובד

**פתרון:**
1. ב-Netlify: Site settings > Functions > View logs
2. בדוק את השגיאות ב-logs
3. ודא שה-function נמצא ב-`netlify/functions/`

## 📝 סיכום - מה צריך

להצלחת הפרסום אתה צריך:

✅ Monday.com API Token  
✅ Monday.com Board ID  
✅ GitHub repository עם הקוד  
✅ Netlify account  
✅ משתני סביבה שהוגדרו ב-Netlify  
✅ פרסום מחדש (Redeploy) אחרי הגדרת המשתנים  

---

**הצלחה! 🎉**
