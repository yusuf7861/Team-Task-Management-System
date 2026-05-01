package com.etharaai.taskmanager.config;

import com.etharaai.taskmanager.entity.Role;
import com.etharaai.taskmanager.entity.Users;
import com.etharaai.taskmanager.repository.UserRepository;
import jakarta.mail.Message;
import jakarta.mail.internet.InternetAddress;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender javaMailSender;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Transactional(rollbackOn = Exception.class)
    @Override
    public void run(String... args) {
        Optional<Users> existingUser = userRepository.findUserByEmailAndRole(adminEmail, Role.ADMIN);

        if (existingUser.isEmpty()) {
            String randomPassword = generateRandomPassword(8);
            Users adminUsers = new Users();
            String adminName = adminEmail.contains("@") ? adminEmail.substring(0, adminEmail.indexOf("@")) : "Admin";
            adminUsers.setName(adminName);
            adminUsers.setEmail(adminEmail);
            adminUsers.setPassword(passwordEncoder.encode(randomPassword));
            adminUsers.setRole(Role.ADMIN);
            userRepository.save(adminUsers);

            // Send email with credentials
            try {
                String subject = "Your Admin Account Credentials";
                String text = "Your admin account has been created.\n\n" +
                        "Email: " + adminEmail + "\n" +
                        "Password: " + randomPassword + "\n\n" +
                        "Please log in and change your password immediately.";
                javaMailSender.send(mimeMessage -> {
                    mimeMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(adminEmail));
                    mimeMessage.setSubject(subject);
                    mimeMessage.setText(text);
                });

                log.info("Admin account created and email sent to {}, password: {}", adminEmail, randomPassword);
            } catch (Exception e) {
                log.error("Failed to send admin credentials email: {}", e.getMessage());
                log.info("Admin account created with email: {} and password: {}", adminEmail, randomPassword);
            }
        }
    }

    String generateRandomPassword(int length) {
        String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
