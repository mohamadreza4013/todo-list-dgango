# My Calendar

یک اپ مستقل **Django** برای نمایش و انتخاب تاریخ در **تقویم شمسی (Jalali)**.

این اپ به‌صورت مستقل پیاده‌سازی شده و برای استفاده به‌عنوان **Jalali Date Picker** در فرم‌های Django طراحی شده است.

تقویم بدون استفاده از کتابخانه‌های خارجی مانند:

- jQuery
- Flatpickr
- Persian Datepicker
- Persian Date

پیاده‌سازی شده و منطق تقویم شمسی به‌صورت اختصاصی در JavaScript قرار دارد.

---

## Features

- نمایش تقویم شمسی
- نمایش نام ماه‌های شمسی به زبان فارسی
- نمایش روزهای هفته به زبان فارسی
- جابه‌جایی بین ماه‌ها
- تشخیص و نمایش روز جاری
- انتخاب تاریخ
- نمایش تاریخ انتخاب‌شده
- پشتیبانی از ارقام فارسی
- پشتیبانی از ارقام انگلیسی در ورودی
- پشتیبانی از جداکننده `/` و `-`
- استفاده به‌عنوان Date Picker
- اتصال یک Calendar به چند input
- باز شدن Calendar با کلیک روی input
- باز و بسته کردن Calendar از طریق JavaScript API
- بستن Calendar با دکمه Close
- بستن Calendar با کلیک روی Overlay
- بستن Calendar با کلید `Escape`
- مشخص کردن تاریخ انتخاب‌شده
- پیاده‌سازی اختصاصی محاسبات تقویم Jalali
- بدون نیاز به jQuery
- بدون نیاز به Flatpickr
- بدون نیاز به Persian Datepicker
- بدون نیاز به Persian Date
- استفاده از JavaScript و CSS اختصاصی

---

## Requirements

این اپ برای استفاده در پروژه‌های Django طراحی شده است.

برای اجرای بخش JavaScript، مرورگر باید از `Intl.DateTimeFormat` و تقویم Persian پشتیبانی کند.

تقویم به هیچ کتابخانه JavaScript خارجی وابسته نیست.

---

# Installation

## 1. Create the App

اگر اپ را هنوز ایجاد نکرده‌اید:

```bash
python manage.py startapp my_calendar
```

سپس اپ را در `settings.py` اضافه کنید:

```python
INSTALLED_APPS = [
    ...
    "my_calendar",
]
```

---

# Project Structure

ساختار پیشنهادی اپ:

```text
my_calendar/
│
├── migrations/
│
├── templates/
│   └── my_calendar/
│       └── calendar.html
│
├── static/
│   └── mycalendar/
│       ├── calendar.css
│       └── calendar.js
│
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── urls.py
└── views.py
```

> نام پوشه داخل `static` برابر `mycalendar` است و با نام Django App یعنی `my_calendar` متفاوت است.

---

# URL Configuration

## App URLs

در فایل:

```text
my_calendar/urls.py
```

قرار دهید:

```python
from django.urls import path
from . import views


urlpatterns = [
    path(
        "",
        views.calendar_view,
        name="my_calendar",
    ),
]
```

---

## Project URLs

در `urls.py` اصلی پروژه:

```python
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "my-calendar/",
        include("my_calendar.urls"),
    ),
]
```

تقویم اکنون از طریق این آدرس در دسترس است:

```text
http://127.0.0.1:8000/my-calendar/
```

---

# View

در:

```text
my_calendar/views.py
```

قرار دهید:

```python
from django.shortcuts import render


def calendar_view(request):
    return render(
        request,
        "my_calendar/calendar.html",
    )
```

---

# Static Files

در Template ابتدا:

```django
{% load static %}
```

سپس CSS را Load کنید:

```html
<link
    rel="stylesheet"
    href="{% static 'mycalendar/calendar.css' %}"
>
```

و JavaScript:

```html
<script
    src="{% static 'mycalendar/calendar.js' %}"
></script>
```

---

# Date Picker

کاربرد اصلی `My Calendar` انتخاب تاریخ شمسی در inputهای فرم است.

هر input که کلاس زیر را داشته باشد:

```text
jalali-date-input
```

به Calendar متصل می‌شود.

مثال:

```html
<input
    type="text"
    name="start_date"
    id="start-date"
    class="jalali-date-input"
    placeholder="انتخاب تاریخ شروع"
    autocomplete="off"
    readonly
>
```

Input دیگری:

```html
<input
    type="text"
    name="deadline"
    id="deadline"
    class="jalali-date-input"
    placeholder="انتخاب مهلت"
    autocomplete="off"
    readonly
>
```

پس از Load شدن `calendar.js`، کلیک روی هر یک از این inputها باعث باز شدن Calendar می‌شود.

---

# How Date Picker Works

فرآیند انتخاب تاریخ:

```text
User
  ↓
Click on date input
  ↓
My Calendar opens
  ↓
User selects a Jalali date
  ↓
Selected date is written into the input
  ↓
Calendar closes
```

مثلاً اگر کاربر تاریخ ۲۰ شهریور ۱۴۰۵ را انتخاب کند:

```text
۱۴۰۵/۰۶/۲۰
```

در input قرار می‌گیرد.

---

# Persian Digits

تقویم از ارقام فارسی پشتیبانی می‌کند.

خروجی Calendar با ارقام فارسی است:

```text
۱۴۰۵/۰۶/۲۰
```

اما هنگام پردازش تاریخ، JavaScript می‌تواند ارقام فارسی را به انگلیسی تبدیل کند:

```text
۱۴۰۵/۰۶/۲۰
        ↓
1405/06/20
```

بنابراین ورودی‌هایی مانند موارد زیر قابل پردازش هستند:

```text
۱۴۰۵/۰۶/۲۰
```

و:

```text
1405/06/20
```

همچنین هر دو جداکننده پشتیبانی می‌شوند:

```text
1405/06/20
```

```text
1405-06-20
```

---

# Multiple Date Inputs

یک Calendar می‌تواند برای چند input استفاده شود.

مثال:

```html
<input
    type="text"
    name="start_date"
    id="start-date"
    class="jalali-date-input"
    placeholder="تاریخ شروع"
    readonly
>

<input
    type="text"
    name="deadline"
    id="deadline"
    class="jalali-date-input"
    placeholder="مهلت"
    readonly
>

<input
    type="text"
    name="meeting_date"
    id="meeting-date"
    class="jalali-date-input"
    placeholder="تاریخ جلسه"
    readonly
>
```

JavaScript به‌صورت خودکار تمام inputهایی که کلاس:

```text
jalali-date-input
```

دارند پیدا می‌کند.

وقتی کاربر روی یک input کلیک کند، همان input به‌عنوان `targetInput` انتخاب می‌شود.

بنابراین تاریخ انتخاب‌شده فقط در همان input قرار می‌گیرد.

---

# Calendar Modal

Calendar به‌صورت یک Modal نمایش داده می‌شود.

Modal شامل:

- Header
- عنوان ماه و سال
- دکمه ماه قبل
- دکمه ماه بعد
- نام روزهای هفته
- روزهای ماه
- دکمه بستن
- Overlay

است.

ساختار اصلی Modal:

```html
<div
    id="calendar-picker-modal"
    class="calendar-picker-modal"
    hidden
>

    <div class="calendar-picker-overlay"></div>

    <div class="calendar-picker-container">

        <button
            type="button"
            id="calendar-picker-close"
            class="calendar-picker-close"
        >
            ×
        </button>

        <div class="calendar">

            <div class="calendar-topbar">

                <button
                    type="button"
                    id="previous-month"
                    class="month-button"
                >
                    ‹
                </button>

                <div
                    id="month-title"
                    class="month-title"
                ></div>

                <button
                    type="button"
                    id="next-month"
                    class="month-button"
                >
                    ›
                </button>

            </div>

            <div
                id="weekdays"
                class="weekdays"
            ></div>

            <div
                id="calendar-grid"
                class="calendar-grid"
            ></div>

        </div>

    </div>

</div>
```

---

# Required HTML Elements

برای اینکه `calendar.js` بتواند Calendar را اجرا کند، عناصر اصلی زیر باید در HTML وجود داشته باشند:

```text
calendar-picker-modal
calendar-picker-close
previous-month
next-month
month-title
weekdays
calendar-grid
```

همچنین برای استفاده از Date Picker، input باید دارای کلاس زیر باشد:

```text
jalali-date-input
```

---

# Calendar Navigation

کاربر می‌تواند با استفاده از دو دکمه زیر بین ماه‌ها جابه‌جا شود:

```text
previous-month
```

و:

```text
next-month
```

در هنگام رسیدن به:

```text
فروردین
```

با رفتن به ماه قبل، سال کاهش پیدا می‌کند.

مثلاً:

```text
فروردین ۱۴۰۵
      ↓
اسفند ۱۴۰۴
```

همچنین بعد از:

```text
اسفند ۱۴۰۵
```

ماه بعد:

```text
فروردین ۱۴۰۶
```

خواهد بود.

---

# Current Date

Calendar تاریخ امروز را به‌صورت خودکار تشخیص می‌دهد.

تاریخ جاری با کلاس:

```text
today
```

مشخص می‌شود.

مثال:

```html
<button class="calendar-day today">
    ۲۰
</button>
```

---

# Selected Date

اگر input از قبل دارای تاریخ باشد، هنگام باز شدن Calendar:

1. تاریخ input خوانده می‌شود.
2. ارقام فارسی به انگلیسی تبدیل می‌شوند.
3. تاریخ Parse می‌شود.
4. Calendar روی ماه و سال همان تاریخ باز می‌شود.
5. روز انتخاب‌شده با کلاس `selected` مشخص می‌شود.

مثلاً:

```text
۱۴۰۵/۰۶/۲۰
```

باعث می‌شود Calendar روی:

```text
شهریور ۱۴۰۵
```

باز شود و روز:

```text
۲۰
```

به‌عنوان تاریخ انتخاب‌شده نمایش داده شود.

---

# JavaScript API

`My Calendar` یک API ساده JavaScript در اختیار صفحه قرار می‌دهد.

API به صورت زیر در دسترس است:

```javascript
window.MyCalendar
```

---

## Open Calendar

برای باز کردن Calendar روی یک input:

```javascript
const input =
    document.getElementById("start-date");

MyCalendar.open(input);
```

---

## Close Calendar

برای بستن Calendar:

```javascript
MyCalendar.close();
```

---

# Manual Trigger

می‌توان باز کردن Calendar را به یک Button متصل کرد.

مثال:

```html
<input
    type="text"
    id="start-date"
    class="jalali-date-input"
    readonly
>

<button
    type="button"
    onclick="
        MyCalendar.open(
            document.getElementById('start-date')
        )
    "
>
    انتخاب تاریخ
</button>
```

---

# Calendar Events

پس از انتخاب تاریخ، مقدار input تغییر می‌کند.

همچنین یک JavaScript `change` event برای input ارسال می‌شود:

```javascript
targetInput.dispatchEvent(
    new Event(
        "change",
        {
            bubbles: true
        }
    )
);
```

بنابراین سایر بخش‌های JavaScript می‌توانند تغییر تاریخ را دریافت کنند.

مثال:

```javascript
document
    .getElementById("start-date")
    .addEventListener(
        "change",
        function () {

            console.log(
                "Selected date:",
                this.value
            );

        }
    );
```

---

# Closing the Calendar

Calendar به سه روش بسته می‌شود.

## Close Button

با کلیک روی دکمه:

```text
calendar-picker-close
```

---

## Overlay

با کلیک روی قسمت Overlay:

```text
calendar-picker-overlay
```

---

## Escape

با فشار دادن کلید:

```text
Escape
```

Calendar بسته می‌شود.

---

# Using My Calendar in a Django Form

مثال:

```html
{% load static %}

<form method="POST">

    {% csrf_token %}

    <input
        type="text"
        name="title"
        placeholder="عنوان Task"
    >

    <input
        type="text"
        name="start_date"
        id="start-date"
        class="jalali-date-input"
        placeholder="انتخاب تاریخ شروع"
        autocomplete="off"
        readonly
    >

    <input
        type="text"
        name="deadline"
        id="deadline"
        class="jalali-date-input"
        placeholder="انتخاب مهلت"
        autocomplete="off"
        readonly
    >

    <button type="submit">
        ذخیره
    </button>

</form>


<link
    rel="stylesheet"
    href="{% static 'mycalendar/calendar.css' %}"
>

<script
    src="{% static 'mycalendar/calendar.js' %}"
></script>
```

پس از انتخاب تاریخ، مقدار input مثلاً:

```text
۱۴۰۵/۰۶/۲۰
```

خواهد بود.

در نتیجه هنگام Submit فرم، همین مقدار به Django ارسال می‌شود.

---

# Receiving the Date in Django

در View می‌توانید مقدار تاریخ را دریافت کنید:

```python
start_date_str = request.POST.get(
    "start_date",
)
```

مثلاً:

```text
۱۴۰۵/۰۶/۲۰
```

---

# Converting the Date in Django

برای تبدیل تاریخ Jalali به `jdatetime.date`:

```python
import jdatetime


def to_english_digits(value):

    return str(value).translate(
        str.maketrans(
            "۰۱۲۳۴۵۶۷۸۹",
            "0123456789",
        )
    )


start_date_str = to_english_digits(
    start_date_str
)

start_date_str = (
    start_date_str
    .replace("/", "-")
)

try:

    start_date = (
        jdatetime.date
        .fromisoformat(
            start_date_str
        )
    )

except ValueError:

    start_date = None
```

---

# Using django-jalali

اگر پروژه از `django-jalali` استفاده می‌کند، می‌توانید از `jDateField` استفاده کنید:

```python
from django.db import models
from django_jalali.db import models as jmodels


class Todo(models.Model):

    title = models.CharField(
        max_length=200,
    )

    start_date = jmodels.jDateField(
        null=True,
        blank=True,
    )

    deadline = jmodels.jDateField(
        null=True,
        blank=True,
    )
```

سپس تاریخ تبدیل‌شده را ذخیره کنید:

```python
todo.start_date = start_date
todo.deadline = deadline

todo.save()
```

---

# TaskFlow Example

`My Calendar` می‌تواند در پروژه‌هایی مانند TaskFlow برای انتخاب تاریخ شروع و Deadline استفاده شود.

مثال:

```html
<input
    type="text"
    name="start_date"
    id="start-date"
    class="jalali-date-input"
    placeholder="انتخاب تاریخ شروع"
    autocomplete="off"
    readonly
>

<input
    type="text"
    name="deadline"
    id="deadline"
    class="jalali-date-input"
    placeholder="انتخاب مهلت"
    autocomplete="off"
    readonly
>
```

فرآیند:

```text
Start Date
    ↓
Click input
    ↓
My Calendar
    ↓
Select Jalali Date
    ↓
۱۴۰۵/۰۶/۲۰
    ↓
Django Form
```

برای Deadline نیز همین فرآیند انجام می‌شود.

---

# Calendar Algorithm

منطق محاسبات تقویم Jalali در `calendar.js` به‌صورت مستقل پیاده‌سازی شده است.

این بخش شامل توابعی برای:

- محاسبه سال‌های کبیسه
- محاسبه طول ماه
- اعتبارسنجی تاریخ
- تبدیل Jalali به Gregorian
- تبدیل Gregorian به Julian Day
- تبدیل Julian Day به Gregorian
- محاسبه روز هفته
- تعیین اولین روز ماه

است.

توابع اصلی شامل موارد زیر هستند:

```javascript
jalCal()
```

```javascript
j2d()
```

```javascript
g2d()
```

```javascript
d2g()
```

```javascript
jalaaliToGregorian()
```

```javascript
getFirstWeekday()
```

```javascript
jalaaliMonthLength()
```

```javascript
isValidJalaaliDate()
```

---

# Supported Jalali Date Range

منطق محاسبات Jalali بر اساس مجموعه Break Pointهای تقویم Jalaali پیاده‌سازی شده است.

سال Jalali باید در محدوده پشتیبانی‌شده الگوریتم قرار داشته باشد.

برای استفاده معمول در تاریخ‌های معاصر مانند:

```text
۱۴۰۰
۱۴۰۱
۱۴۰۲
۱۴۰۳
۱۴۰۴
۱۴۰۵
۱۴۰۶
```

محدوده مناسب است.

---

# File Structure

فایل‌های اصلی Calendar:

```text
my_calendar/
│
├── templates/
│   └── my_calendar/
│       └── calendar.html
│
└── static/
    └── mycalendar/
        ├── calendar.css
        └── calendar.js
```

---

# Static Paths

با توجه به ساختار بالا، مسیر CSS:

```django
{% static 'mycalendar/calendar.css' %}
```

و مسیر JavaScript:

```django
{% static 'mycalendar/calendar.js' %}
```

است.

مسیر زیر صحیح نیست:

```django
{% static 'my_calendar/calendar.js' %}
```

زیرا نام پوشه Static:

```text
mycalendar
```

است.

---

# Troubleshooting

## Calendar Does Not Open

Developer Tools مرورگر را باز کنید:

```text
F12 → Console
```

سپس بررسی کنید `calendar.js` بدون خطا Load شده باشد.

همچنین بررسی کنید input دارای کلاس زیر باشد:

```html
class="jalali-date-input"
```

---

## Calendar Modal Does Not Appear

بررسی کنید عنصر زیر در HTML وجود داشته باشد:

```html
<div
    id="calendar-picker-modal"
    hidden
>
```

همچنین عناصر اصلی Calendar را بررسی کنید:

```text
calendar-picker-modal
previous-month
next-month
month-title
weekdays
calendar-grid
```

---

## Input Does Not Open Calendar

بررسی کنید input دارای این کلاس باشد:

```html
class="jalali-date-input"
```

و `calendar.js` در صفحه Load شده باشد.

مثال:

```html
<script
    src="{% static 'mycalendar/calendar.js' %}"
    defer
></script>
```

---

## Date Is Not Written to the Input

بررسی کنید input دارای `target` صحیح باشد و Calendar از طریق:

```javascript
MyCalendar.open(input);
```

یا کلیک روی:

```text
jalali-date-input
```

باز شده باشد.

---

## Static Files Return 404

ساختار فایل‌ها را بررسی کنید:

```text
my_calendar/
└── static/
    └── mycalendar/
        ├── calendar.css
        └── calendar.js
```

و در Template:

```django
{% load static %}
```

وجود داشته باشد.

---

# Full Minimal Example

```html
{% load static %}

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

    <meta charset="UTF-8">

    <title>
        My Calendar
    </title>

    <link
        rel="stylesheet"
        href="{% static 'mycalendar/calendar.css' %}"
    >

</head>

<body>

<form method="POST">

    {% csrf_token %}

    <input
        type="text"
        name="title"
        placeholder="عنوان"
    >

    <input
        type="text"
        name="start_date"
        id="start-date"
        class="jalali-date-input"
        placeholder="انتخاب تاریخ شروع"
        autocomplete="off"
        readonly
    >

    <input
        type="text"
        name="deadline"
        id="deadline"
        class="jalali-date-input"
        placeholder="انتخاب مهلت"
        autocomplete="off"
        readonly
    >

    <button type="submit">
        ذخیره
    </button>

</form>


<!-- ============================================= -->
<!-- CALENDAR MODAL -->
<!-- ============================================= -->

<div
    id="calendar-picker-modal"
    class="calendar-picker-modal"
    hidden
>

    <div
        class="calendar-picker-overlay"
    ></div>


    <div
        class="calendar-picker-container"
    >

        <button
            type="button"
            id="calendar-picker-close"
            class="calendar-picker-close"
        >
            ×
        </button>


        <div class="calendar">

            <div class="calendar-topbar">

                <button
                    type="button"
                    id="previous-month"
                    class="month-button"
                >
                    ‹
                </button>


                <div
                    id="month-title"
                    class="month-title"
                ></div>


                <button
                    type="button"
                    id="next-month"
                    class="month-button"
                >
                    ›
                </button>

            </div>


            <div
                id="weekdays"
                class="weekdays"
            ></div>


            <div
                id="calendar-grid"
                class="calendar-grid"
            ></div>

        </div>

    </div>

</div>


<script
    src="{% static 'mycalendar/calendar.js' %}"
></script>

</body>

</html>
```

---

# Summary

برای استفاده از `My Calendar`:

```text
1. Create the Django app
2. Add my_calendar to INSTALLED_APPS
3. Configure app URLs
4. Load calendar.css
5. Load calendar.js
6. Add the calendar modal HTML
7. Add jalali-date-input to date inputs
8. Click an input
9. Select a Jalali date
10. The selected date is written to the input
11. Submit the Django form
12. Receive the Jalali date in Django
```

فرمت تاریخ خروجی:

```text
YYYY/MM/DD
```

با ارقام فارسی:

```text
۱۴۰۵/۰۶/۲۰
```

`My Calendar` یک Jalali Date Picker مستقل است که بدون jQuery و بدون کتابخانه‌های خارجی Date Picker کار می‌کند.