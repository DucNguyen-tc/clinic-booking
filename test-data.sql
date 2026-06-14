-- ============================================================
-- MediBook - SQL Test Data
-- QUAN TRONG: Chay script nay trong MySQL Workbench
-- Password tat ca tai khoan: 123456
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- ============================================================
-- 1. DATABASE: clinic_identity
-- Luu y: Hash nay duoc generate boi Spring BCryptPasswordEncoder(10)
-- cho password "123456". Neu login loi 401, hay dung script
-- generate-hash.sql de lay hash moi.
-- ============================================================
USE clinic_identity;

DELETE FROM sessions;
DELETE FROM users;

-- BCrypt hash cho "123456":
-- $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi  (password)
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyiejO9JK  (Password123!)
-- Dung hash sau day - duoc xac nhan la cua "123456" voi cost=10:
INSERT INTO users (id, email, password_hash, role, is_active, created_at) VALUES
('a1b2c3d4-0001-0000-0000-000000000001', 'admin@medibook.vn',        '$2a$10$ByIUiNaRfBKSV6urSjNFUugNRcnFklFHAhXGKBBfpTFsCAdBMJ6SS', 'ADMIN',   TRUE, NOW()),
('d1e2f3g4-0002-0000-0000-000000000002', 'dr.maiphuong@medibook.vn', '$2a$10$ByIUiNaRfBKSV6urSjNFUugNRcnFklFHAhXGKBBfpTFsCAdBMJ6SS', 'DOCTOR',  TRUE, NOW()),
('d5e6f7g8-0003-0000-0000-000000000003', 'dr.trunghieu@medibook.vn', '$2a$10$ByIUiNaRfBKSV6urSjNFUugNRcnFklFHAhXGKBBfpTFsCAdBMJ6SS', 'DOCTOR',  TRUE, NOW()),
('p1a2b3c4-0004-0000-0000-000000000004', 'nguyenvanan@gmail.com',    '$2a$10$ByIUiNaRfBKSV6urSjNFUugNRcnFklFHAhXGKBBfpTFsCAdBMJ6SS', 'PATIENT', TRUE, NOW()),
('p5a6b7c8-0005-0000-0000-000000000005', 'tranthib@gmail.com',       '$2a$10$ByIUiNaRfBKSV6urSjNFUugNRcnFklFHAhXGKBBfpTFsCAdBMJ6SS', 'PATIENT', TRUE, NOW()),
('p9a0b1c2-0006-0000-0000-000000000006', 'levanc@gmail.com',         '$2a$10$ByIUiNaRfBKSV6urSjNFUugNRcnFklFHAhXGKBBfpTFsCAdBMJ6SS', 'PATIENT', TRUE, NOW());

-- ============================================================
-- 2. DATABASE: clinic_profile
-- ============================================================
USE clinic_profile;

DELETE FROM doctor_schedules;
DELETE FROM doctors;
DELETE FROM patients;
DELETE FROM specialties;

INSERT INTO specialties (id, name, description, image_url) VALUES
(1, 'Noi Tong Quat',  'Kham va dieu tri cac benh noi khoa thong thuong', NULL),
(2, 'Tim mach',        'Chan doan va dieu tri cac benh ve tim, mach mau', NULL),
(3, 'Nhi khoa',        'Kham va dieu tri tre em tu so sinh den 15 tuoi',  NULL),
(4, 'Da lieu',         'Dieu tri cac benh ve da, toc, mong',              NULL),
(5, 'Than kinh',       'Chan doan cac benh lien quan den he than kinh',   NULL),
(6, 'Tai Mui Hong',    'Kham va dieu tri cac benh ve tai, mui, hong',     NULL);

INSERT INTO doctors (user_id, specialty_id, full_name, degree, experience_years, price) VALUES
('d1e2f3g4-0002-0000-0000-000000000002', 1, 'Le Thi Mai Phuong', 'ThS.BS',  8, 300000.00),
('d5e6f7g8-0003-0000-0000-000000000003', 2, 'Tran Trung Hieu',   'PGS.TS', 15, 500000.00);

INSERT INTO doctor_schedules (doctor_id, day_of_week, shift_type, start_time, end_time, slot_duration, is_active, created_at, updated_at) VALUES
('d1e2f3g4-0002-0000-0000-000000000002', 1, 'MORNING',   '08:00:00', '12:00:00', 30, TRUE, NOW(), NOW()),
('d1e2f3g4-0002-0000-0000-000000000002', 3, 'MORNING',   '08:00:00', '12:00:00', 30, TRUE, NOW(), NOW()),
('d1e2f3g4-0002-0000-0000-000000000002', 5, 'MORNING',   '08:00:00', '12:00:00', 30, TRUE, NOW(), NOW()),
('d5e6f7g8-0003-0000-0000-000000000003', 2, 'MORNING',   '09:00:00', '12:00:00', 30, TRUE, NOW(), NOW()),
('d5e6f7g8-0003-0000-0000-000000000003', 4, 'AFTERNOON', '13:30:00', '17:00:00', 30, TRUE, NOW(), NOW());

INSERT INTO patients (user_id, full_name, dob, gender, phone) VALUES
('p1a2b3c4-0004-0000-0000-000000000004', 'Nguyen Van An',  '1990-08-15', 'MALE',   '0901234567'),
('p5a6b7c8-0005-0000-0000-000000000005', 'Tran Thi Bich',  '1995-03-22', 'FEMALE', '0912345678'),
('p9a0b1c2-0006-0000-0000-000000000006', 'Le Van Cuong',   '1988-11-10', 'MALE',   '0923456789');

-- ============================================================
-- 3. DATABASE: clinic_appointment
-- ============================================================
USE clinic_appointment;

DELETE FROM slot_locks;
DELETE FROM appointments;

-- Tat ca ngay trong tuong lai xa de khong conflict khi test booking
INSERT INTO appointments (patient_id, doctor_id, specialty_id, appointment_date, slot_time, status, created_at) VALUES
('p1a2b3c4-0004-0000-0000-000000000004', 'd1e2f3g4-0002-0000-0000-000000000002', 1, DATE_ADD(CURDATE(), INTERVAL 60 DAY), '09:00:00', 'CONFIRMED',      NOW()),
('p5a6b7c8-0005-0000-0000-000000000005', 'd1e2f3g4-0002-0000-0000-000000000002', 1, DATE_ADD(CURDATE(), INTERVAL 65 DAY), '10:30:00', 'PENDING_PAYMENT', NOW()),
('p1a2b3c4-0004-0000-0000-000000000004', 'd1e2f3g4-0002-0000-0000-000000000002', 1, DATE_SUB(CURDATE(), INTERVAL 7  DAY), '09:00:00', 'COMPLETED',       DATE_SUB(NOW(), INTERVAL 7 DAY)),
('p9a0b1c2-0006-0000-0000-000000000006', 'd5e6f7g8-0003-0000-0000-000000000003', 2, DATE_SUB(CURDATE(), INTERVAL 2  DAY), '14:00:00', 'CANCELLED',       DATE_SUB(NOW(), INTERVAL 3 DAY)),
('p5a6b7c8-0005-0000-0000-000000000005', 'd5e6f7g8-0003-0000-0000-000000000003', 2, DATE_ADD(CURDATE(), INTERVAL 70 DAY), '09:30:00', 'CONFIRMED',       NOW());

-- ============================================================
-- 4. DATABASE: clinic_payment
-- ============================================================
USE clinic_payment;

DELETE FROM payments;

INSERT INTO payments (appointment_id, amount, payment_method, transaction_no, status, payment_url, created_at, updated_at) VALUES
(1, 300000.00, 'VNPAY', 'VNP-TXN-001-2024', 'SUCCESS', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?demo=1', NOW(), NOW()),
(2, 300000.00, 'VNPAY', NULL,                'PENDING', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?demo=2', NOW(), NOW()),
(3, 300000.00, 'MOMO',  'MOMO-TXN-003-2024', 'SUCCESS', NULL, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 500000.00, 'VNPAY', 'VNP-TXN-005-2024', 'SUCCESS', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?demo=5', NOW(), NOW());

-- ============================================================
-- 5. DATABASE: clinic_medical_record
-- ============================================================
USE clinic_medical_record;

DELETE FROM medical_records;

INSERT INTO medical_records (appointment_id, patient_id, doctor_id, diagnosis, prescription, doctor_note, result_url, created_at) VALUES
(3,
 'p1a2b3c4-0004-0000-0000-000000000004',
 'd1e2f3g4-0002-0000-0000-000000000002',
 'Viem hong cap tinh. Benh nhan co trieu chung dau hong, sot nhe, kho nuot 3 ngay.',
 'Amoxicillin 500mg x 3 lan/ngay x 7 ngay. Paracetamol 500mg khi sot. Vitamin C 1000mg x 1 lan/ngay.',
 'Benh nhan can nghi ngoi, uong nhieu nuoc am. Tai kham sau 7 ngay.',
 NULL,
 DATE_SUB(NOW(), INTERVAL 7 DAY));

-- ============================================================
-- 6. DATABASE: clinic_notification
-- ============================================================
USE clinic_notification;

DELETE FROM notification_logs;

INSERT INTO notification_logs (recipient_id, recipient_email, type, title, content, status, error_message, created_at) VALUES
('p1a2b3c4-0004-0000-0000-000000000004', 'nguyenvanan@gmail.com', 'EMAIL', 'Xac nhan dat lich kham #000001', '<p>Lich kham cua ban da duoc xac nhan.</p>', 'SENT',   NULL, DATE_SUB(NOW(), INTERVAL 7 DAY)),
('p1a2b3c4-0004-0000-0000-000000000004', 'nguyenvanan@gmail.com', 'EMAIL', 'Ket qua kham cua ban da san sang', '<p>Bac si da cap nhat ket qua kham.</p>', 'SENT',   NULL, DATE_SUB(NOW(), INTERVAL 6 DAY)),
('p5a6b7c8-0005-0000-0000-000000000005', 'tranthib@gmail.com',    'EMAIL', 'Xac nhan dat lich kham #000002', '<p>Lich kham cua ban da duoc tao.</p>',  'FAILED', 'Connection refused: smtp.gmail.com:587', DATE_SUB(NOW(), INTERVAL 1 DAY));

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- ============================================================
-- TAI KHOAN TEST
-- Neu hash sai (login tra 401), chay lenh sau de lay hash moi:
--   SELECT password_hash FROM clinic_identity.users LIMIT 1;
-- Hoac dung API: POST /api/auth/register roi update role thu cong
-- ============================================================
-- Email                         | Password | Role
-- admin@medibook.vn             | 123456   | ADMIN
-- dr.maiphuong@medibook.vn      | 123456   | DOCTOR
-- dr.trunghieu@medibook.vn      | 123456   | DOCTOR
-- nguyenvanan@gmail.com         | 123456   | PATIENT
-- tranthib@gmail.com            | 123456   | PATIENT
-- levanc@gmail.com              | 123456   | PATIENT
-- ============================================================
