CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  image_url LONGTEXT,
  status VARCHAR(50) NOT NULL,
  group_name VARCHAR(255),
  description TEXT,
  page_count INT,
  price DECIMAL(10,2)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_number VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  dob VARCHAR(50),
  education_institution VARCHAR(255),
  class_name VARCHAR(255),
  class_roll VARCHAR(255),
  name_english VARCHAR(255),
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  curr_village VARCHAR(255),
  curr_post_office VARCHAR(255),
  curr_upazila VARCHAR(255),
  curr_district VARCHAR(255),
  perm_village VARCHAR(255),
  perm_post_office VARCHAR(255),
  perm_upazila VARCHAR(255),
  perm_district VARCHAR(255),
  blood_group VARCHAR(50),
  nid_birth_reg VARCHAR(255),
  education_qualification VARCHAR(255),
  profession VARCHAR(255),
  nationality VARCHAR(255),
  photo LONGTEXT,
  payment_method VARCHAR(255),
  sender_number VARCHAR(255),
  transaction_id VARCHAR(255),
  payment_status VARCHAR(50)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  member_id INT NOT NULL,
  book_code VARCHAR(255) NOT NULL,
  book_name VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  member_name VARCHAR(255) NOT NULL,
  form_number VARCHAR(255) NOT NULL,
  mobile VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  issue_date DATETIME NOT NULL,
  return_date DATETIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  extension_history JSON,
  comments JSON,
  returned_at DATETIME,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  member_form_number VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE shop_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_form_number VARCHAR(255) NOT NULL,
  member_name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL,
  reviewed_at DATETIME
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image LONGTEXT DEFAULT NULL,
  created_at DATETIME NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  number VARCHAR(255) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE book_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE shop_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE settings (
  setting_key VARCHAR(255) PRIMARY KEY,
  setting_value JSON NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'unread',
  created_at DATETIME NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE site_traffic (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  view_count INT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
