# ⚡ התחלה מהירה - 3 שלבים

## שלב 1: קבל את הפרטים מ-Monday.com

### API Token:
1. היכנס ל: https://auth.monday.com/users/sign_in_new
2. תחת "Developer API" - העתק את ה-Token

### Board ID:
1. פתח את הלוח שלך ב-Monday.com
2. העתק את המספר מה-URL:
   ```
   https://yourcompany.monday.com/boards/1234567890
                                          ^^^^^^^^^^
                                          זה ה-Board ID
   ```

## שלב 2: העלה ל-GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOURUSERNAME/YOURREPO.git
git push -u origin main
```

או השתמש ב-GitHub Desktop.

## שלב 3: פרסום ב-Netlify + הוספת המפתחות

### א. פרסום:
1. היכנס ל: https://app.netlify.com
2. לחץ: "Add new site" > "Import an existing project"
3. בחר את ה-GitHub repository
4. לחץ "Deploy site"

### ב. הוספת משתני סביבה (החשוב ביותר!):

1. **לאחר הפרסום, לחץ על האתר שלך**
2. **לחץ על "Site settings" (בתפריט העליון)**
3. **בחר "Environment variables" בתפריט הצד**
4. **לחץ על "Add a variable"**

5. **הוסף את המשתנה הראשון:**
   ```
   Key:   MONDAY_API_TOKEN
   Value: [הדבק כאן את ה-Token שהעתקת]
   ```

6. **לחץ על "Add a variable" שוב**

7. **הוסף את המשתנה השני:**
   ```
   Key:   MONDAY_BOARD_ID
   Value: [הדבק כאן את ה-Board ID שהעתקת]
   ```

8. **זה חשוב מאוד! - לחץ על "Redeploy" בחלק העליון**
   - בחר: "Clear cache and deploy site"

### ג. בדיקה:
1. פתח את האתר שלך
2. הכנס מזהה לקוח
3. בדוק שהמשלוחים מופיעים

---

## 🎯 סיכום - איפה שמים את המפתחות?

**ב-Netlify Dashboard:**
```
Site settings → Environment variables → Add variable
```

1. `MONDAY_API_TOKEN` = [API Token שלך]
2. `MONDAY_BOARD_ID` = [Board ID שלך]

**לא לשכוח!** אחרי הוספת המשתנים - לחץ על "Redeploy"!

---

למדריך מפורט יותר, ראה `SETUP_HE.md`
