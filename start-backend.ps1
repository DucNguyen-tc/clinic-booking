cd backend
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd api_gateway; .\mvnw spring-boot:run"
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd clinic-identity; .\mvnw spring-boot:run"
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd clinic_profile; .\mvnw spring-boot:run"
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd clinic_appointment; .\mvnw spring-boot:run"
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd clinic_medical_record; .\mvnw spring-boot:run"
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd clinic_payment; .\mvnw spring-boot:run"
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd clinic_notification; .\mvnw spring-boot:run"
