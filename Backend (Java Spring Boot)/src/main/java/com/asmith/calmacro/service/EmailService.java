package com.asmith.calmacro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.SendEmailRequest;
import software.amazon.awssdk.services.ses.model.SendEmailResponse;
import software.amazon.awssdk.services.ses.model.Message;
import software.amazon.awssdk.services.ses.model.Body;
import software.amazon.awssdk.services.ses.model.Content;
import software.amazon.awssdk.services.ses.model.Destination;

/**
 * EmailService
 * 
 * Service responsible for sending emails using Amazon SES (Simple Email Service).
 * It handles sending:
 *  - Email verification links to users upon registration
 *  - Password reset codes
 *  - Contact messages submitted by users via the app
 * 
 * Configuration values for AWS credentials, region, sender email, and base URL
 * are injected from application properties.
 */

@Service
public class EmailService {

    private final SesClient sesClient;

    @Value("${email.from}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    // Initializes the SES client with AWS credentials and region.
    public EmailService(@Value("${aws.ses.access-key}") String accessKey,
                        @Value("${aws.ses.secret-key}") String secretKey,
                        @Value("${aws.ses.region}") String region) {
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
        this.sesClient = SesClient.builder()
                                   .region(Region.of(region))
                                   .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                                   .build();
    }

    // Sends a verification email containing a tokenized confirmation link.
    public void sendVerificationEmail(String to, String token) {
        String subject = "Please Verify Email";
        String confirmationUrl = baseUrl + "/verify-email?token=" + token;
        String message = "Welcome! Thank you for creating an account with us. \n\n" + 
        "To finish the registration process, please verify your email address by clicking the link below:\n\n" + 
        confirmationUrl + "\n\n\n-Macros&More";

        // Build and send the email
        SendEmailRequest emailRequest = SendEmailRequest.builder()
                .destination(Destination.builder().toAddresses(to).build())
                .message(Message.builder()
                        .subject(Content.builder().data(subject).build())
                        .body(Body.builder()
                                .text(Content.builder().data(message).build())
                                .build())
                        .build())
                .source(fromEmail)
                .build();

        SendEmailResponse response = sesClient.sendEmail(emailRequest);
        System.out.println("Email sent! Message ID: " + response.messageId());
    }

    // Sends a password reset email containing a one-time reset code.   
    public void sendPasswordResetEmail(String to, String resetCode) {
        String subject = "Password Reset Request";
        String message = "Please use the following code to reset your account password: \n\n" + resetCode + "\n\n -Macros&More";
        
        SendEmailRequest emailRequest = SendEmailRequest.builder()
                .destination(Destination.builder().toAddresses(to).build())
                .message(Message.builder()
                        .subject(Content.builder().data(subject).build())
                        .body(Body.builder()
                                .text(Content.builder().data(message).build())
                                .build())
                        .build())
                .source(fromEmail)
                .build();
        
        SendEmailResponse response = sesClient.sendEmail(emailRequest);
        System.out.println("Password reset email sent! Message ID: " + response.messageId());
    }

    // Sends a message to the support email address from the contact form submission.
    public void sendContactEmail(String userEmail, String userName, String userSubject, String userMessage) {
        String message = "You have received a new message from the Contact Us form:\n\n" +
                        "Name: " + userName + "\n" +
                        "Email: " + userEmail + "\n\n" +
                        "Message: \n" + userMessage + "\n\n" +
                        "- Sent from Macros&More App";

        SendEmailRequest emailRequest = SendEmailRequest.builder()
                .destination(Destination.builder().toAddresses("support@andrewsmithdevelopment.com").build()) 
                .message(Message.builder()
                        .subject(Content.builder().data(userSubject).build()) 
                        .body(Body.builder()
                                .text(Content.builder().data(message).build())
                                .build())
                        .build())
                .source(fromEmail)
                .build();

        SendEmailResponse response = sesClient.sendEmail(emailRequest);
        System.out.println("Contact Us email sent! Message ID: " + response.messageId());
   }

}
