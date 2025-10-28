# העלאה ל-GitHub - הוראות מהירות

## אחרי שיצרת Repository ב-GitHub

**פתח PowerShell בתיקיית הפרויקט** והריץ את הפקודה הבאה:

```powershell
git remote add origin https://github.com/ron-ti/REPOSITORY-NAME.git
git branch -M main
git push -u origin main
```

**החלף `REPOSITORY-NAME`** בשם שבו בחרת ב-GitHub

לאחר מכן, תוכל לעבור ל-Netlify ולפרסם את האתר.

## לאחר ההעלאה

לך ל-Netlify:
1. Add new site > Import an existing project
2. בחר GitHub
3. חפש את ה-repository החדש שיצרת
4. לחץ עליו
5. Deploy site

ואז הוסף משתני סביבה (כמו שהסבירו במדריך הקודם).
