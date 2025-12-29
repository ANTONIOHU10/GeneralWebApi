# Email Service

Email service implementation using MailKit for sending emails.

## Configuration

### Mailtrap (Testing/Development)

For development and testing, you can use [Mailtrap](https://mailtrap.io/) - a fake SMTP server that captures emails without sending them to real recipients.

#### Setup Steps:

1. **Sign up for Mailtrap** (free account available)
   - Visit: https://mailtrap.io/
   - Create an account or sign in

2. **Get SMTP Credentials**
   - Go to your Mailtrap inbox
   - Navigate to "SMTP Settings" → "Integrations" → ".NET"
   - Copy the SMTP credentials:
     - Host: `smtp.mailtrap.io`
     - Port: `587` (or `2525`)
     - Username: (your Mailtrap username)
     - Password: (your Mailtrap password)

3. **Update appsettings.json**
   ```json
   "Email": {
     "SmtpHost": "smtp.mailtrap.io",
     "SmtpPort": 587,
     "SmtpUsername": "your-mailtrap-username",
     "SmtpPassword": "your-mailtrap-password",
     "EnableSsl": true,
     "FromEmail": "noreply@generalwebapi.com",
     "FromName": "GeneralWebApi",
     "FrontendBaseUrl": "http://localhost:4200",
     "Enabled": true
   }
   ```

4. **View Emails in Mailtrap**
   - All emails sent by the application will appear in your Mailtrap inbox
   - You can view the email content, HTML rendering, and test links
   - No emails will be sent to real recipients

### Production Configuration

For production, update the configuration with your real SMTP server settings:

```json
"Email": {
  "SmtpHost": "smtp.yourdomain.com",
  "SmtpPort": 587,
  "SmtpUsername": "your-smtp-username",
  "SmtpPassword": "your-smtp-password",
  "EnableSsl": true,
  "FromEmail": "noreply@yourdomain.com",
  "FromName": "Your Application Name",
  "FrontendBaseUrl": "https://yourdomain.com",
  "Enabled": true
}
```

### Common SMTP Providers

- **Gmail**: `smtp.gmail.com:587` (requires App Password)
- **SendGrid**: `smtp.sendgrid.net:587`
- **Amazon SES**: `email-smtp.region.amazonaws.com:587`
- **Office 365**: `smtp.office365.com:587`
- **Mailtrap**: `smtp.mailtrap.io:587` (testing only)

## Features

- ✅ Password reset email with secure token
- ✅ HTML email templates with styling
- ✅ Plain text fallback
- ✅ Configurable SMTP settings
- ✅ Error handling and logging
- ✅ Environment-based configuration

## Usage

The email service is automatically registered when you call `AddEmailService()` in `Program.cs`.

Example usage in `UserService`:
```csharp
await _emailService.SendPasswordResetEmailAsync(user.Email, user.Name, resetToken);
```

## Disabling Email Service

To disable email sending (e.g., for local development without SMTP), set:
```json
"Email": {
  "Enabled": false
}
```

When disabled, the service will log the action but not send emails.

