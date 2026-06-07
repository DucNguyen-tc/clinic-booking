package com.ducnguyen.clinic_medical_record.service;

import org.springframework.web.multipart.MultipartFile;

public interface StoragePort {
    String uploadFile(MultipartFile file, String folderPath);
    String getPresignedUrl(String objectName, int expirySeconds);
    void deleteFile(String objectName);
}
