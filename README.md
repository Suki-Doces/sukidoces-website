# 🍬 Suki Doces E-commerce - Version 2.0

**Suki Doces** is a complete e-commerce platform developed for a candy and sweets store. Version 2.0 brings a modular architecture, a robust administrative panel, advanced inventory management, an optimized shopping flow, and accessibility features.

## 🚀 Main Features

### 🛍️ For Customers (Front-end)
* **Product Catalog:** Seamless navigation through products, categories, and promotions.
* **Search and Filter System:** Quick search for sweets and specific products (`buscar.php`).
* **Cart and Checkout:** Persistent shopping cart system and a complete checkout page with address processing.
* **Customer Area:** User registration, login, and account management.
* **My Orders:** Track order history and current status.
* **Accessibility:** Integration with the **VLibras** tool for automatic translation to Brazilian Sign Language (`vlibras-comp.php`).

### ⚙️ For Administration (Back-end)
* **Administrative Panel (Dashboard):** Overview of sales, transactions, and store metrics.
* **Inventory Management (CRUD):** Add, edit, and delete products and categories (`pages/storage/` and `pages/product/`).
* **Order Management:** Detailed order tracking with status updates (`pages/order/`).
* **Customer Management:** Control and view registered customers.
* **Real-Time Updates:** Notification system and transaction/order monitoring via JavaScript *polling*.

## 🛠️ Technologies Used
* **Back-end:** PHP (Business logic, Authentication, Routing, and CRUD)
* **Database:** MySQL (`database.php`)
* **Front-end:** HTML5, CSS3, JavaScript (Vanilla)
* **Architecture:** Component-oriented (Header, Footer, Carousels, etc.)

## 📁 Folder Structure

* `/assets/`: Static images, SVG icons, and product uploads.
* `/components/`: Modular UI components (Header, Footer, Navbars, Carousels).
* `/css/` & `/js/`: Global styles and scripts (including cart logic and async requests).
* `/database/`: Database connection configuration.
* `/include/`: Global configuration files, session/authentication validation (`auth.php`).
* `/pages/`: Main system pages, divided by context:
  * `/checkoutPage/`: Payment and address flow.
  * `/client/`: Profile and customer management.
  * `/conta/`: Authentication and registration.
  * `/dashboard/`: Administration panel.
  * `/order/`: Order management and viewing.
  * `/product/` & `/storage/`: Category creation and inventory control.

## ⚙️ How to Run Locally

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/sukidoces-website-2.0.git](https://github.com/your-username/sukidoces-website-2.0.git)

2. Create a MySQL database and import the database/sukidoces_db.sql file to set up the tables.

* Login as administrator to test:
**Login:** admin@sukidoces.com
**Password:** 123456"


  Developers by crizzila (database), danielfontz (customer side), TiagoAntunes-Dev (seller/administrator side), and Unidadeobvia (login system).
