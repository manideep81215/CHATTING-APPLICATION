package com.app.chat.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    private final Path uploadDir;

    public FileService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public Map<String, String> upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        try {
            Files.createDirectories(uploadDir);
            String fileName = Instant.now().toEpochMilli() + "-" + UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path target = uploadDir.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return Map.of(
                    "fileName", fileName,
                    "fileUrl", "/api/files/" + fileName);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store file", ex);
        }
    }

    public Path resolveFile(String fileName) {
        Path resolved = uploadDir.resolve(fileName).normalize();
        if (!resolved.startsWith(uploadDir)) {
            throw new IllegalArgumentException("Invalid file path");
        }
        return resolved;
    }
}
