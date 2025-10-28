# 🔍 בדיקת תקלות - צעד אחר צעד

## בדיקה 1: API Token וה-Board ID

ב-Netlify, לך ל:
**Site settings > Environment variables**

ודא שיש לך:
1. `MONDAY_API_TOKEN` - עם ערך (string ארוך)
2. `MONDAY_BOARD_ID` - עם מספר

## בדיקה 2: לוגים ב-Netlify

1. ב-Netlify, לך ל: **Site settings > Functions**
2. לחץ על: **View logs** (ליד monday-api)
3. גלול למטה וראה אם יש שגיאות אדומות

אם יש שגיאה, שלח לי את הטקסט המלא.

## בדיקה 3: Console בדפדפן

1. פתח את האתר
2. לחץ F12 (פתח Developer Tools)
3. לך לטאב **Console**
4. רענן את העמוד
5. רשום כל שגיאה מופיעה

## בדיקה 4: Network

1. בדפדפן: F12 > טאב **Network**
2. רענן את העמוד
3. לחץ על "הצג משלוחים"
4. חפש קריאות ל-netlify functions
5. לחץ על הקריאה
6. בדוק את התגובה (Response tab)

## בדיקה 5: Monday.com

ודא שהלוח שקראת לו `MONDAY_BOARD_ID` הוא הנכון ושהעמודה "לקוח" קיימת בו.
