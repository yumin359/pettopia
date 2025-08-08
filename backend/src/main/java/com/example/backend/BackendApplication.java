package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        // ✨ JVM 시스템 프로퍼티로 파일 개수 제한 해제
        System.setProperty("org.apache.tomcat.util.http.fileupload.FileUploadBase.fileCountMax", "50000");
        System.setProperty("org.apache.tomcat.util.http.fileupload.impl.FileUploadBase.fileCountMax", "50000");

        // ✨ 추가 Tomcat 파라미터 설정
        System.setProperty("server.tomcat.max-parameter-count", "50000");

        System.out.println("파일 업로드 제한 해제 완료");

        SpringApplication.run(BackendApplication.class, args);
    }

}
