# My Calendar

یک اپ مستقل **Django** برای نمایش و استفاده از **تقویم شمسی (Jalali)** در پروژه‌های Django.

این اپ به‌صورت مستقل پیاده‌سازی شده و برای نمایش تقویم و همچنین استفاده به‌عنوان **Date Picker** در فرم‌های مختلف طراحی شده است.

تقویم هیچ وابستگی‌ای به `jQuery`، `flatpickr`، `persian-datepicker` یا `persian-date` ندارد.

---

## Features

* نمایش تقویم شمسی
* نمایش نام ماه‌های شمسی
* نمایش روزهای هفته به زبان فارسی
* جابه‌جایی بین ماه‌ها
* تشخیص روز جاری
* انتخاب تاریخ
* نمایش تاریخ انتخاب‌شده
* استفاده به‌صورت صفحه مستقل
* استفاده به‌صورت Date Picker
* اتصال یک Calendar به چند input
* API جاوااسکریپت برای باز و بسته کردن تقویم
* بدون نیاز به jQuery
* بدون نیاز به Flatpickr
* بدون نیاز به Persian Datepicker
* بدون نیاز به Persian Date
* استفاده از JavaScript و CSS اختصاصی

---

# Installation

## 1. Create the app

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

ساختار پیشنهادی:

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

> نام پوشه داخل `static` عمداً `mycalendar` است و با نام اپ `my_calendar` یکسان نیست.

---

# URL Configuration

## 1. App URLs

در فایل:

```text
my_calendar/urls.py
```

قرار دهید:

```python
from django.urls import path
from . import views


urlpatterns = [
    path("", views.calendar_view, name="my_calendar"),
]
```

## 2. Project URLs

در `urls.py` اصلی پروژه:

```python
from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "my-calendar/",
        include("my_calendar.urls"),
    ),
]
```

تقویم اکنون در این آدرس در دسترس است:

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

# Loading Static Files

در template ابتدا:

```django
{% load static %}
```

سپس CSS:

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

# Standalone Calendar

برای نمایش Calendar به‌صورت یک صفحه مستقل، template باید containerهای اصلی Calendar را داشته باشد.

مثال:

```html
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
```

JavaScript اپ این عناصر را پیدا کرده و Calendar را ایجاد می‌کند.

---

# Date Picker

یکی از کاربردهای اصلی `My Calendar` استفاده از آن برای انتخاب تاریخ در فرم‌ها است.

هر input که کلاس زیر را داشته باشد:

```text
jalali-date-input
```

می‌تواند از Calendar استفاده کند.

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

یک input دیگر:

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

پس از Load شدن `calendar.js`، کلیک روی هر input باعث باز شدن Calendar می‌شود.

---

# How Date Picker Works

فرآیند انتخاب تاریخ:

```text
User
  ↓
Click input
  ↓
My Calendar opens
  ↓
User selects a Jalali date
  ↓
Selected date is written into the input
```

مثلاً:

```text
1405/06/20
```

داخل input قرار می‌گیرد.

---

# Using Multiple Inputs

یک Calendar می‌تواند برای چند input استفاده شود.

مثال:

```html
<input
    type="text"
    name="start_date"
    class="jalali-date-input"
    placeholder="تاریخ شروع"
    readonly
>

<input
    type="text"
    name="deadline"
    class="jalali-date-input"
    placeholder="مهلت"
    readonly
>

<input
    type="text"
    name="meeting_date"
    class="jalali-date-input"
    placeholder="تاریخ جلسه"
    readonly
>
```

Calendar تشخیص می‌دهد که کدام input کلیک شده و تاریخ انتخاب‌شده را در همان input قرار می‌دهد.

---

# JavaScript API

اپ `MyCalendar` یک API ساده در اختیار صفحه قرار می‌دهد.

## Open

برای باز کردن Calendar روی یک input:

```javascript
const input =
    document.getElementById("start-date");

MyCalendar.open(input);
```

## Close

برای بستن Calendar:

```javascript
MyCalendar.close();
```

---

# Manual Trigger

می‌توانید باز کردن Calendar را به یک button متصل کنید.

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

# Using My Calendar in a Django Form

مثال یک فرم ساده:

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
        class="jalali-date-input"
        placeholder="انتخاب تاریخ شروع"
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

پس از انتخاب تاریخ:

```text
1405/06/20
```

به عنوان مقدار input ارسال می‌شود.

---

# Receiving the Date in Django

در View:

```python
start_date_str = request.POST.get(
    "start_date"
)
```

مثلاً مقدار:

```text
1405/06/20
```

است.

---

# Converting the Jalali Date

برای تبدیل رشته به `jdatetime.date`:

```python
import jdatetime


start_date = None


if start_date_str:

    try:

        start_date = jdatetime.date.fromisoformat(
            start_date_str.replace("/", "-")
        )

    except ValueError:

        start_date = None
```

اکنون:

```python
start_date
```

یک شیء:

```python
jdatetime.date
```

است.

---

# Using django-jalali

اگر پروژه از `django-jalali` استفاده می‌کند:

```python
from django_jalali.db import models as jmodels


class Todo(models.Model):

    title = models.CharField(
        max_length=200
    )

    start_date = jmodels.jDateField(
        null=True,
        blank=True
    )

    deadline = jmodels.jDateField(
        null=True,
        blank=True
    )
```

بعد می‌توانید تاریخ تبدیل‌شده را ذخیره کنید:

```python
todo = Todo.objects.create(

    title=title,

    start_date=start_date,

    deadline=deadline,

)
```

---

# TaskFlow Example

در TaskFlow می‌توانید Calendar را در Sidebar قرار دهید:

```html
<a
    href="{% url 'my_calendar' %}"
    class="nav-item"
>
    <span>📅</span>
    Calendar
</a>
```

و در فرم افزودن Task:

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

در این حالت:

```text
Home
 │
 ├── Start Date
 │      ↓
 │   My Calendar
 │      ↓
 │   1405/06/20
 │
 └── Deadline
        ↓
     My Calendar
        ↓
     1405/06/25
```

---

# Important: No External Datepicker

`My Calendar` مستقل است.

بنابراین برای استفاده از آن نباید این کتابخانه‌ها را همزمان Load کنید:

```text
flatpickr
persian-datepicker
persian-date
PwtDatepicker
```

همچنین Calendar به `jQuery` وابسته نیست.

فقط فایل‌های خود اپ کافی هستند:

```text
calendar.css
calendar.js
```

---

# Static Path

اگر ساختار فایل‌ها این باشد:

```text
my_calendar/
└── static/
    └── mycalendar/
        ├── calendar.css
        └── calendar.js
```

باید دقیقاً از این مسیرها استفاده کنید:

```django
{% static 'mycalendar/calendar.css' %}
```

و:

```django
{% static 'mycalendar/calendar.js' %}
```

مسیر زیر اشتباه است:

```django
{% static 'my_calendar/calendar.css' %}
```

چون نام پوشه Static:

```text
mycalendar
```

است.

---

# Required HTML IDs

اگر از Calendar به‌صورت مستقیم استفاده می‌کنید، این عناصر باید وجود داشته باشند:

```text
calendar-picker-modal
calendar-picker-close
previous-month
next-month
month-title
weekdays
calendar-grid
```

اگر یکی از این عناصر در HTML وجود نداشته باشد، بخش مربوط به آن قابلیت کار نخواهد کرد.

---

# Troubleshooting

## Calendar does not open

ابتدا Developer Tools مرورگر را باز کنید:

```text
F12 → Console
```

سپس بررسی کنید `calendar.js` بدون خطا Load شده باشد.

---

## 404 for CSS or JavaScript

مسیر Static را بررسی کنید.

ساختار:

```text
my_calendar/static/mycalendar/calendar.js
```

باید با:

```django
{% static 'mycalendar/calendar.js' %}
```

هماهنگ باشد.

---

## Input does not open the calendar

بررسی کنید input دارای این کلاس باشد:

```html
class="jalali-date-input"
```

و `calendar.js` در صفحه Load شده باشد.

---

## Date is not written to the input

بررسی کنید `MyCalendar.open()` با input صحیح اجرا شده باشد:

```javascript
MyCalendar.open(
    document.getElementById("start-date")
);
```

---

# Full Minimal Example

```html
{% load static %}

<!DOCTYPE html>

<html lang="fa" dir="rtl">

<head>

    <meta charset="UTF-8">

    <title>
        My Calendar Example
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
        readonly
    >

    <input
        type="text"
        name="deadline"
        id="deadline"
        class="jalali-date-input"
        placeholder="انتخاب مهلت"
        readonly
    >

    <button type="submit">
        ذخیره
    </button>

</form>


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

        <div class="calendar-picker-header">

            <h2>
                انتخاب تاریخ
            </h2>

        </div>

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
1. Add my_calendar to INSTALLED_APPS
2. Configure my_calendar URLs
3. Load calendar.css
4. Load calendar.js
5. Add class="jalali-date-input" to date inputs
6. User clicks the input
7. My Calendar opens
8. User selects a Jalali date
9. Selected date is written into the input
10. Django receives the Jalali date
```

فرمت خروجی:

```text
YYYY/MM/DD
```

مثال:

```text
1405/06/20
```

`My Calendar` مستقل از datepickerهای خارجی است و می‌تواند در هر فرم Django که نیاز به انتخاب تاریخ شمسی دارد استفاده شود.
